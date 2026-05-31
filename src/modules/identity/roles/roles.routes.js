const express        = require('express');
const CollectionMeta = require('../../../models/collectionMeta.model');
const roleService    = require('./role.service');
const { buildPagedResult } = require('../../../shared/paging/paging.builder');
const { ok, created, noContent, notFound } = require('../../../shared/response/response.builder');

const router = express.Router();

// ── GET /api/roles ────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const lang = req.lang || 'en';
    const [meta, items] = await Promise.all([
      CollectionMeta.findOne({ collection: 'roles', lang }).lean(),
      roleService.listRoles(lang),
    ]);
    ok(res, buildPagedResult(
      meta ?? { paging: { page_title: 'Roles' }, fields: [] },
      items,
      { page: req.query.page, limit: req.query.limit },
    ));
  } catch (err) { next(err); }
});

// ── GET /api/roles/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const role = await roleService.getRole(Number(req.params.id), req.lang);
    ok(res, role);
  } catch (err) { next(err); }
});

// ── POST /api/roles ───────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const role = await roleService.createRole(req.body);
    created(res, role);
  } catch (err) { next(err); }
});

// ── PUT /api/roles/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const role = await roleService.replaceRole(Number(req.params.id), req.body);
    ok(res, role);
  } catch (err) { next(err); }
});

// ── DELETE /api/roles/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    await roleService.deleteRole(Number(req.params.id));
    noContent(res);
  } catch (err) { next(err); }
});

module.exports = router;
