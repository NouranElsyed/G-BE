const express        = require('express');
const Organization   = require('../../../models/organization.model');
const Actor          = require('../../../models/actor.model');
const CollectionMeta = require('../../../models/collectionMeta.model');
const { buildPagedResult } = require('../../../shared/paging/paging.builder');
const { ok, created, noContent, notFound } = require('../../../shared/response/response.builder');

const router = express.Router();

function flattenOrg(o) {
  return {
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
  };
}

// ── GET /api/organizations ────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const lang = req.lang ?? 'en';
    const [meta, orgs] = await Promise.all([
      CollectionMeta.findOne({ collection: 'organizations', lang }).lean(),
      Organization.find({}).lean(),
    ]);
    const items  = orgs.map(flattenOrg);
    const result = buildPagedResult(
      meta ?? { paging: { page_title: lang === 'ar' ? 'المنظمات' : 'Organizations' }, fields: [] },
      items,
      { page: req.query.page, limit: req.query.limit },
    );
    ok(res, result);
  } catch (err) { next(err); }
});

// ── GET /api/organizations/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const org = await Organization.findOne({ ID: Number(req.params.id) }).lean();
    if (!org) return notFound(res);
    ok(res, org);
  } catch (err) { next(err); }
});

// ── POST /api/organizations ───────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const org = await Organization.create(req.body);
    created(res, org.toObject ? org.toObject() : org);
  } catch (err) { next(err); }
});

// ── PUT /api/organizations/:id ────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const org = await Organization.findOneAndUpdate(
      { ID: Number(req.params.id) },
      { ...req.body, UPDATED_AT: new Date() },
      { new: true, runValidators: true },
    ).lean();
    if (!org) return notFound(res);
    ok(res, org);
  } catch (err) { next(err); }
});

// ── DELETE /api/organizations/:id ─────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const org = await Organization.findOneAndDelete({ ID: Number(req.params.id) });
    if (!org) return notFound(res);
    noContent(res);
  } catch (err) { next(err); }
});

// ── Actors sub-resource ───────────────────────────────────────────────────────

router.get('/actors/list', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.organizationId) filter.ORGANIZATION_ID = Number(req.query.organizationId);
    const actors = await Actor.find(filter).lean();
    ok(res, actors);
  } catch (err) { next(err); }
});

router.get('/actors/:id', async (req, res, next) => {
  try {
    const actor = await Actor.findOne({ ID: Number(req.params.id) }).lean();
    if (!actor) return notFound(res);
    ok(res, actor);
  } catch (err) { next(err); }
});

router.post('/actors', async (req, res, next) => {
  try {
    const actor = await Actor.create(req.body);
    created(res, actor.toObject ? actor.toObject() : actor);
  } catch (err) { next(err); }
});

router.put('/actors/:id', async (req, res, next) => {
  try {
    const actor = await Actor.findOneAndUpdate(
      { ID: Number(req.params.id) },
      { ...req.body, UPDATED_AT: new Date() },
      { new: true, runValidators: true },
    ).lean();
    if (!actor) return notFound(res);
    ok(res, actor);
  } catch (err) { next(err); }
});

router.delete('/actors/:id', async (req, res, next) => {
  try {
    const actor = await Actor.findOneAndDelete({ ID: Number(req.params.id) });
    if (!actor) return notFound(res);
    noContent(res);
  } catch (err) { next(err); }
});

module.exports = router;
