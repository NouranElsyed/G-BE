/**
 * Permission Controller
 *
 * HTTP layer only — validates inputs, delegates to services, formats responses.
 * Zero business logic here.
 */

const treeService     = require('./permission.tree.service');
const nodeService     = require('./permission.node.service');
const generateService = require('./permission.generate.service');
const { ok, created, notFound, badRequest } = require('../../shared/utils/response');

// ── GET /api/permissions ──────────────────────────────────────────────────────

async function getTree(req, res, next) {
  try {
    const lang   = req.lang;
    const roleId = req.query.role_id ? Number(req.query.role_id) : null;

    const result = await treeService.getPermissionTree(lang, roleId);
    if (!result) return notFound(res, 'Permissions not found');

    const { rootMeta, items, rolesList, roleAssignments } = result;

    res.json({
      ...buildResponse(rootMeta, items),
      result: {
        ...buildResponse(rootMeta, items).result,
        roles:            rolesList,
        role_assignments: roleAssignments,
      },
    });
  } catch (err) { next(err); }
}

// ── PATCH entity roles ────────────────────────────────────────────────────────

async function assignRolesToEntity(req, res, next) {
  try {
    const { moduleName, entityKey } = req.params;
    const { roleIds }               = req.body;

    if (!Array.isArray(roleIds)) return badRequest(res, 'roleIds must be an array');

    const result = await nodeService.assignRolesToEntity(
      moduleName,
      entityKey,
      toNumberArray(roleIds),
    );

    ok(res, result, 'Entity roles updated');
  } catch (err) { next(err); }
}

// ── PATCH permission roles ────────────────────────────────────────────────────

async function assignRolesToPermission(req, res, next) {
  try {
    const { moduleName, entityKey, permKey } = req.params;
    const { roleIds }                        = req.body;

    if (!Array.isArray(roleIds)) return badRequest(res, 'roleIds must be an array');

    const result = await nodeService.assignRolesToPermission(
      moduleName,
      entityKey,
      permKey,
      toNumberArray(roleIds),
    );

    ok(res, result, 'Permission roles updated');
  } catch (err) { next(err); }
}

// ── PATCH field roles ─────────────────────────────────────────────────────────

async function assignRolesToField(req, res, next) {
  try {
    const { moduleName, entityKey, permKey, fieldKey } = req.params;
    const { roleIds }                                  = req.body;

    if (!Array.isArray(roleIds)) return badRequest(res, 'roleIds must be an array');

    const result = await nodeService.assignRolesToField(
      moduleName,
      entityKey,
      permKey,
      fieldKey,
      toNumberArray(roleIds),
    );

    ok(res, result, 'Field roles updated');
  } catch (err) { next(err); }
}

// ── DELETE permission ─────────────────────────────────────────────────────────

async function deletePermission(req, res, next) {
  try {
    const { moduleName, entityKey, permKey } = req.params;

    const result = await nodeService.deletePermission(moduleName, entityKey, permKey);
    ok(res, result, 'Permission deleted');
  } catch (err) { next(err); }
}

// ── POST /bulk/status ─────────────────────────────────────────────────────────

async function bulkSetStatus(req, res, next) {
  try {
    const { permKeys, status } = req.body;

    if (!Array.isArray(permKeys) || !permKeys.length)
      return badRequest(res, 'permKeys must be a non-empty array');

    if (!['Active', 'Inactive'].includes(status))
      return badRequest(res, 'status must be Active or Inactive');

    const result = await nodeService.bulkSetStatus(permKeys, status);
    ok(res, result, `Permissions set to ${status}`);
  } catch (err) { next(err); }
}

// ── POST /generate ────────────────────────────────────────────────────────────

async function generate(req, res, next) {
  try {
    const dryRun       = req.query.dry === '1';
    const prefixFilter = req.query.prefix
      ? req.query.prefix.toUpperCase().split(',').map(p => p.trim())
      : null;

    const result = await generateService.generatePermissions({ prefixFilter, dryRun });

    if (!result.generated) {
      return res.json({
        success: 1,
        message: { type: 'warning', texts: ['No tables matched the filter'] },
        result:  { generated: 0 },
      });
    }

    if (dryRun) {
      return res.json({
        success: 1,
        message: { type: 'info', texts: ['Dry run — nothing saved'] },
        result,
      });
    }

    created(res, result, 'Permissions generated');
  } catch (err) { next(err); }
}

// ── Shared stubs for unimplemented PATCH endpoints ────────────────────────────

function stubOk(_req, res) {
  res.json({ success: 1, message: { type: 'success', texts: ['Updated'] }, result: null });
}

// ── Internal utils ────────────────────────────────────────────────────────────

function toNumberArray(arr) {
  return [...new Set(arr.map(Number).filter(n => !isNaN(n)))];
}

function buildResponse(rootMeta, items) {
  return {
    success: 1,
    message: { type: 'success', texts: [] },
    result:  { ...rootMeta, items },
  };
}

module.exports = {
  getTree,
  assignRolesToEntity,
  assignRolesToPermission,
  assignRolesToField,
  deletePermission,
  bulkSetStatus,
  generate,
  stubOk,
};