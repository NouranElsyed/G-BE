/**
 * Permission Controller
 *
 * HTTP layer only — validates inputs, delegates to services, formats responses.
 * Zero business logic here.
 */

const treeService     = require('./permission.tree.service');
const nodeService     = require('./permission.node.service');
const generateService = require('./permission.generate.service');
const overrideService = require('./permission.override.service');
const resolverService = require('./permission.resolver.service');
const PermissionModule = require('./permission.model');
const { ok, created, notFound, badRequest } = require('../../../shared/response/response.builder');

// ── GET /api/permissions ──────────────────────────────────────────────────────

async function getTree(req, res, next) {
  try {
    const lang   = req.lang;
    const roleId = req.query.role_id ? Number(req.query.role_id) : null;

    const result = await treeService.getPermissionTree(lang, roleId);
    if (!result) return notFound(res, 'Permissions not found');

    const { rootMeta, items, rolesList, roleAssignments } = result;

    res.json({
      ...buildPagedResult(rootMeta, items),
      result: {
        ...buildPagedResult(rootMeta, items).result,
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

// ── POST /overrides ───────────────────────────────────────────────────────────

async function setOverride(req, res, next) {
  try {
    const { roleId, targetType, targetKey, parentKey, access } = req.body;

    if (!roleId || !targetType || !targetKey || !parentKey)
      return badRequest(res, 'roleId, targetType, targetKey, and parentKey are required');

    if (!['field', 'permission'].includes(targetType))
      return badRequest(res, 'targetType must be field or permission');

    if (access && !['GRANT', 'DENY'].includes(access))
      return badRequest(res, 'access must be GRANT or DENY');

    const result = await overrideService.setOverride({ roleId, targetType, targetKey, parentKey, access });
    ok(res, result, 'Override set');
  } catch (err) { next(err); }
}

// ── DELETE /overrides ─────────────────────────────────────────────────────────

async function removeOverride(req, res, next) {
  try {
    const { roleId, targetKey } = req.body;

    if (!roleId || !targetKey)
      return badRequest(res, 'roleId and targetKey are required');

    const result = await overrideService.removeOverride({ roleId, targetKey });
    ok(res, result, 'Override removed');
  } catch (err) { next(err); }
}

// ── GET /overrides/:roleId ────────────────────────────────────────────────────

async function getOverridesForRole(req, res, next) {
  try {
    const roleId = Number(req.params.roleId);
    if (isNaN(roleId)) return badRequest(res, 'roleId must be a number');

    const result = await overrideService.getOverridesForRole(roleId);
    ok(res, result, 'Overrides fetched');
  } catch (err) { next(err); }
}

// ── GET /effective ────────────────────────────────────────────────────────────

async function getEffective(req, res, next) {
  try {
    const roleId = req.query.role_id ? Number(req.query.role_id) : null;
    if (!roleId || isNaN(roleId)) return badRequest(res, 'role_id query param is required');

    const modules   = await PermissionModule.find({}).lean();
    const resolved  = await resolverService.resolveAssignments(modules, roleId);

    const grantedKeys   = [];
    const deniedKeys    = [];
    const inheritedKeys = [];

    for (const [key, node] of Object.entries(resolved)) {
      if (node.source === 'override') {
        if (node.effectiveRoleIds.length) grantedKeys.push(key);
        else                              deniedKeys.push(key);
      } else if (node.source === 'inherited') {
        inheritedKeys.push(key);
      } else if (node.source === 'direct' && node.effectiveRoleIds.length) {
        grantedKeys.push(key);
      }
    }

    ok(res, { roleId, grantedKeys, deniedKeys, inheritedKeys }, 'Effective assignments fetched');
  } catch (err) { next(err); }
}

// ── POST /bulk/assign ─────────────────────────────────────────────────────────

async function bulkAssign(req, res, next) {
  try {
    const { operations } = req.body;

    if (!Array.isArray(operations) || !operations.length)
      return badRequest(res, 'operations must be a non-empty array');

    const VALID_TYPES = new Set(['assign_entity', 'assign_permission', 'assign_field', 'override', 'remove_override']);
    const details  = [];
    let processed  = 0;
    let failed     = 0;

    // Sequential execution to avoid race conditions on the same document
    for (const op of operations) {
      try {
        if (!VALID_TYPES.has(op.type)) {
          throw new Error(`Unknown operation type: ${op.type}`);
        }

        let opResult;

        if (op.type === 'assign_entity') {
          opResult = await nodeService.assignRolesToEntity(
            op.moduleKey, op.entityKey, toNumberArray(op.roleIds ?? [])
          );
        } else if (op.type === 'assign_permission') {
          opResult = await nodeService.assignRolesToPermission(
            op.moduleKey, op.entityKey, op.permKey, toNumberArray(op.roleIds ?? [])
          );
        } else if (op.type === 'assign_field') {
          opResult = await nodeService.assignRolesToField(
            op.moduleKey, op.entityKey, op.permKey, op.fieldKey, toNumberArray(op.roleIds ?? [])
          );
        } else if (op.type === 'override') {
          opResult = await overrideService.setOverride({
            roleId:     op.roleId,
            targetType: op.targetType ?? 'permission',
            targetKey:  op.permKey ?? op.fieldKey,
            parentKey:  op.entityKey,
            access:     op.access ?? 'GRANT',
          });
        } else if (op.type === 'remove_override') {
          opResult = await overrideService.removeOverride({
            roleId:    op.roleId,
            targetKey: op.permKey ?? op.fieldKey,
          });
        }

        details.push({ type: op.type, status: 'ok', result: opResult });
        processed++;
      } catch (opErr) {
        details.push({ type: op.type, status: 'error', error: opErr.message });
        failed++;
      }
    }

    ok(res, { processed, failed, details }, 'Bulk assign completed');
  } catch (err) { next(err); }
}

// ── Shared stubs for unimplemented endpoints ──────────────────────────────────

function stubOk(_req, res) {
  res.json({ success: 1, message: { type: 'success', texts: ['Updated'] }, result: null });
}

// ── Internal utils ────────────────────────────────────────────────────────────

function toNumberArray(arr) {
  return [...new Set(arr.map(Number).filter(n => !isNaN(n)))];
}

function buildPagedResult(rootMeta, items) {
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
  setOverride,
  removeOverride,
  getOverridesForRole,
  getEffective,
  bulkAssign,
  stubOk,
};
