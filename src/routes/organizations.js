const express        = require('express');
const Organization   = require('../../../models/organization.model');
const Actor          = require('../../../models/actor.model');
const CollectionMeta = require('../../../models/collectionMeta.model');
const { buildPagedResult } = require('../../../shared/paging/paging.builder');
const { ok, created, noContent, notFound } = require('../../../shared/response/response.builder');

const router = express.Router();

// ── flattenOrg — maps Mongoose doc (UPPER_CASE) to API shape (snake_case) ─────
// Includes all fields so the frontend form/table can read and write every attribute.
function flattenOrg(o) {
  return {
    id:             o.ID,
    code:           o.CODE,
    secondary_code: o.SECONDARY_CODE,
    name:           o.NAME,
    description:    o.DESCRIPTION,

    status_id:      o.STATUS_ID,
    status_code:    o.STATUS_CODE,
    status_name:    o.STATUS_NAME,
    status_color:   o.STATUS_COLOR,

    category_id:    o.CATEGORY_ID,
    category_code:  o.CATEGORY_CODE,
    category_name:  o.CATEGORY_NAME,

    community_id:   o.COMMUNITY_ID,
    community_code: o.COMMUNITY_CODE,
    community_name: o.COMMUNITY_NAME,

    media_icon:     o.MEDIA_ICON,
    media_image:    o.MEDIA_IMAGE,

    created_by:     o.CREATED_BY,
    created_by_id:  o.CREATED_BY_ID,
    created_at:     o.CREATED_AT,

    updated_by:     o.UPDATED_BY,
    updated_by_id:  o.UPDATED_BY_ID,
    updated_at:     o.UPDATED_AT,
  };
}

// ── flattenActor — maps Actor doc to API shape ────────────────────────────────
function flattenActor(a) {
  return {
    id:               a.ID,
    code:             a.CODE,
    secondary_code:   a.SECONDARY_CODE,
    name:             a.NAME,

    organization_id:   a.ORGANIZATION_ID,
    organization_code: a.ORGANIZATION_CODE,
    organization_name: a.ORGANIZATION_NAME,

    port_id:           a.PORT_ID,
    port_code:         a.PORT_CODE,
    port_name:         a.PORT_NAME,

    status_id:         a.STATUS_ID,
    status_code:       a.STATUS_CODE,
    status_name:       a.STATUS_NAME,
    status_color:      a.STATUS_COLOR,

    category_id:       a.CATEGORY_ID,
    category_code:     a.CATEGORY_CODE,
    category_name:     a.CATEGORY_NAME,

    community_id:      a.COMMUNITY_ID,
    community_code:    a.COMMUNITY_CODE,
    community_name:    a.COMMUNITY_NAME,

    created_by:        a.CREATED_BY,
    created_by_id:     a.CREATED_BY_ID,
    created_at:        a.CREATED_AT,

    updated_by:        a.UPDATED_BY,
    updated_by_id:     a.UPDATED_BY_ID,
    updated_at:        a.UPDATED_AT,
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

// ── Actors sub-resource ───────────────────────────────────────────────────────
// NOTE: must be defined BEFORE /:id to avoid Express matching "actors" as an id param

router.get('/actors/list', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.organizationId) filter.ORGANIZATION_ID = Number(req.query.organizationId);
    const actors = await Actor.find(filter).lean();
    ok(res, actors.map(flattenActor));
  } catch (err) { next(err); }
});

router.get('/actors/:id', async (req, res, next) => {
  try {
    const actor = await Actor.findOne({ ID: Number(req.params.id) }).lean();
    if (!actor) return notFound(res);
    ok(res, flattenActor(actor));
  } catch (err) { next(err); }
});

router.post('/actors', async (req, res, next) => {
  try {
    const actor = await Actor.create(req.body);
    created(res, flattenActor(actor.toObject ? actor.toObject() : actor));
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
    ok(res, flattenActor(actor));
  } catch (err) { next(err); }
});

router.delete('/actors/:id', async (req, res, next) => {
  try {
    const actor = await Actor.findOneAndDelete({ ID: Number(req.params.id) });
    if (!actor) return notFound(res);
    noContent(res);
  } catch (err) { next(err); }
});

// ── GET /api/organizations/:id ────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const org = await Organization.findOne({ ID: Number(req.params.id) }).lean();
    if (!org) return notFound(res);
    ok(res, flattenOrg(org));
  } catch (err) { next(err); }
});

// ── POST /api/organizations ───────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const org = await Organization.create(req.body);
    created(res, flattenOrg(org.toObject ? org.toObject() : org));
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
    ok(res, flattenOrg(org));
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

module.exports = router;