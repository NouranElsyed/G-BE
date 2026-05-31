/**
 * Roles Controller
 *
 * Thin HTTP layer — no business logic.
 */

const roleService       = require('./role.service');
const { buildResponse } = require('../../shared/utils/buildResponse');
const CollectionMeta    = require('../../shared/database/collectionMeta.model');
const { ok, created, notFound } = require('../../shared/utils/response');

// ── GET /api/roles ────────────────────────────────────────────────────────────
async function listRoles(req, res, next) {
  try {
    const lang = req.lang;
    const [meta, items] = await Promise.all([
      CollectionMeta.findOne({ collection: 'roles', lang }).lean(),
      roleService.listRoles(lang),
    ]);

    if (!meta) return notFound(res, 'Roles metadata not found');

    res.json(buildResponse(meta, items));
  } catch (err) { next(err); }
}

// ── GET /api/roles/:id ────────────────────────────────────────────────────────
async function getRole(req, res, next) {
  try {
    const role = await roleService.getRole(Number(req.params.id), req.lang);
    ok(res, role);
  } catch (err) { next(err); }
}

// ── POST /api/roles ───────────────────────────────────────────────────────────
async function createRole(req, res, next) {
  try {
    const role = await roleService.createRole(req.body);
    created(res, role);
  } catch (err) { next(err); }
}

// ── PUT /api/roles/:id ────────────────────────────────────────────────────────
async function replaceRole(req, res, next) {
  try {
    const role = await roleService.replaceRole(Number(req.params.id), req.body);
    ok(res, role, 'Role updated');
  } catch (err) { next(err); }
}

// ── DELETE /api/roles/:id ─────────────────────────────────────────────────────
async function deleteRole(req, res, next) {
  try {
    await roleService.deleteRole(Number(req.params.id));
    ok(res, null, 'Role deleted');
  } catch (err) { next(err); }
}

module.exports = { listRoles, getRole, createRole, replaceRole, deleteRole };
