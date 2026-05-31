const express        = require('express');
const router         = express.Router();
const Organization   = require('../models/organization.model');
const Actor          = require('../models/actor.model');
const CollectionMeta = require('../models/collectionMeta.model');

// ── GET /api/organizations ─────────────────────────────────────────
// Returns organizations as standard GenericPageResult { items, meta_data, paging }
const { buildResponse } = require('../shared/utils/buildResponse');

router.get('/', async (req, res, next) => {
  try {
    const lang = req.lang ?? 'en';
    const [meta, orgs] = await Promise.all([
      CollectionMeta.findOne({ collection: 'organizations', lang }).lean(),
      Organization.find({}).lean(),
    ]);

    const items = orgs.map(o => ({
      id:             o.ID,
      code:           o.CODE,
      secondary_code: o.SECONDARY_CODE,
      name:           o.NAME,
      description:    o.DESCRIPTION,
      status_name:    o.STATUS_NAME,
      status_color:   o.STATUS_COLOR,
      category_name:  o.CATEGORY_NAME,
      community_name: o.COMMUNITY_NAME,
      created_at:     o.CREATED_AT,
      updated_at:     o.UPDATED_AT,
    }));

    if (!meta) {
      return res.json({
        success: 1,
        message: { type: 'string', texts: [] },
        result: {
          paging: {
            page_title: lang === 'ar' ? 'المنظمات' : 'Organizations',
            page_subtitle: null,
            total_items: items.length,
            start_item: items.length ? 1 : 0,
            end_item: items.length,
            items_per_page: 24,
            total_pages: Math.ceil(items.length / 24) || 1,
            current_page: 1,
          },
          meta_data: [],
          items,
        },
      });
    }

    res.json(buildResponse(meta, items));
  } catch (err) { next(err); }
});

// ── GET /api/organizations/:id ─────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const org = await Organization.findOne({ ID: Number(req.params.id) }).lean();
    if (!org) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Not found'] }, result: null });
    res.json({ success: 1, message: { type: 'string', texts: [] }, result: org });
  } catch (err) { next(err); }
});

// ── POST /api/organizations ────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const org = await Organization.create(req.body);
    res.status(201).json({ success: 1, message: { type: 'success', texts: ['Created'] }, result: org });
  } catch (err) { next(err); }
});

// ── PUT /api/organizations/:id ─────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const org = await Organization.findOneAndUpdate(
      { ID: Number(req.params.id) },
      { ...req.body, UPDATED_AT: new Date() },
      { new: true, runValidators: true }
    ).lean();
    if (!org) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Not found'] }, result: null });
    res.json({ success: 1, message: { type: 'success', texts: ['Updated'] }, result: org });
  } catch (err) { next(err); }
});

// ── DELETE /api/organizations/:id ──────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const org = await Organization.findOneAndDelete({ ID: Number(req.params.id) });
    if (!org) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Not found'] }, result: null });
    res.json({ success: 1, message: { type: 'success', texts: ['Deleted'] }, result: null });
  } catch (err) { next(err); }
});

// ══════════════════════════════════════════════════════════════════
// Actors (sub-resource)
// ══════════════════════════════════════════════════════════════════

// ── GET /api/organizations/actors ─────────────────────────────────
router.get('/actors/list', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.organizationId) filter.ORGANIZATION_ID = Number(req.query.organizationId);

    const actors = await Actor.find(filter).lean();
    res.json({ success: 1, message: { type: 'string', texts: [] }, result: actors });
  } catch (err) { next(err); }
});

// ── GET /api/organizations/actors/:id ─────────────────────────────
router.get('/actors/:id', async (req, res, next) => {
  try {
    const actor = await Actor.findOne({ ID: Number(req.params.id) }).lean();
    if (!actor) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Not found'] }, result: null });
    res.json({ success: 1, message: { type: 'string', texts: [] }, result: actor });
  } catch (err) { next(err); }
});

// ── POST /api/organizations/actors ────────────────────────────────
router.post('/actors', async (req, res, next) => {
  try {
    const actor = await Actor.create(req.body);
    res.status(201).json({ success: 1, message: { type: 'success', texts: ['Created'] }, result: actor });
  } catch (err) { next(err); }
});

// ── PUT /api/organizations/actors/:id ─────────────────────────────
router.put('/actors/:id', async (req, res, next) => {
  try {
    const actor = await Actor.findOneAndUpdate(
      { ID: Number(req.params.id) },
      { ...req.body, UPDATED_AT: new Date() },
      { new: true, runValidators: true }
    ).lean();
    if (!actor) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Not found'] }, result: null });
    res.json({ success: 1, message: { type: 'success', texts: ['Updated'] }, result: actor });
  } catch (err) { next(err); }
});

// ── DELETE /api/organizations/actors/:id ──────────────────────────
router.delete('/actors/:id', async (req, res, next) => {
  try {
    const actor = await Actor.findOneAndDelete({ ID: Number(req.params.id) });
    if (!actor) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Not found'] }, result: null });
    res.json({ success: 1, message: { type: 'success', texts: ['Deleted'] }, result: null });
  } catch (err) { next(err); }
});

module.exports = router;
