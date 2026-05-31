/**
 * Permission Node Service
 *
 * Handles role assignment at entity, permission, and field levels.
 * Pattern per function: load → diff → update → sync role counts → return.
 */

const PermissionModule = require('./permission.model');
const Role             = require('../../identity/roles/role.model');
const { AppError }     = require('../../../shared/errors/AppError');
const {
  buildCascadeSet,
  buildBubbleUpSet,
  diffRoleIds,
  buildRoleCountOps,
} = require('../../../shared/helpers/propagation');

// ── Helpers ───────────────────────────────────────────────────────────────────

const byName = name => ({ name: { $regex: new RegExp(`^${name}$`, 'i') } });

async function findModule(name) {
  const mod = await PermissionModule.findOne(byName(name)).lean();
  if (!mod) throw new AppError(`Module not found: ${name}`, 404);
  return mod;
}

function findEntity(mod, entityKey) {
  const entity = mod.entities.find(e => e.key === entityKey);
  if (!entity) throw new AppError(`Entity not found: ${entityKey}`, 404);
  return entity;
}

function findPermission(entity, permKey) {
  const perm = entity.permissions?.find(p => p.key === permKey);
  if (!perm) throw new AppError(`Permission not found: ${permKey}`, 404);
  return perm;
}

async function syncRoleCounts(oldIds, newIds) {
  const { added, removed } = diffRoleIds(oldIds, newIds);
  const ops = buildRoleCountOps(added, removed);
  if (ops.length) await Role.bulkWrite(ops);
}

// ── Entity-level assignment ───────────────────────────────────────────────────

async function assignRolesToEntity(moduleName, entityKey, newRoleIds) {
  const mod    = await findModule(moduleName);
  const entity = findEntity(mod, entityKey);

  // ✅ FIX Bug 3: diff against the entity's own cached union, not recomputed
  //    from children — keeps role_perm_count accurate.
  const oldIds = entity.assignedRoleIds ?? [];

  const setObj = buildCascadeSet(entity.permissions ?? [], newRoleIds);

  const updated = await PermissionModule.findOneAndUpdate(
    byName(moduleName),
    { $set: setObj },
    { new: true, arrayFilters: [{ 'ent.key': entityKey }] },
  ).lean();

  if (!updated) throw new AppError('Update failed', 500);

  await syncRoleCounts(oldIds, newRoleIds);

  const updatedEntity = updated.entities.find(e => e.key === entityKey);

  return {
    entity_key:          updatedEntity.key,
    assignedRoleIds:     updatedEntity.assignedRoleIds,
    permissions_updated: (updatedEntity.permissions ?? []).length,
  };
}

// ── Permission-level assignment ───────────────────────────────────────────────

async function assignRolesToPermission(moduleName, entityKey, permKey, newRoleIds) {
  const mod    = await findModule(moduleName);
  const entity = findEntity(mod, entityKey);
  const perm   = findPermission(entity, permKey);

  const oldIds = perm.assignedRoleIds ?? [];
  const { entityUnion, set } = buildBubbleUpSet(
    entity.permissions ?? [],
    permKey,
    newRoleIds,
  );

  const updated = await PermissionModule.findOneAndUpdate(
    byName(moduleName),
    { $set: set },
    { new: true, arrayFilters: [{ 'ent.key': entityKey }, { 'perm.key': permKey }] },
  ).lean();

  if (!updated) throw new AppError('Update failed', 500);

  await syncRoleCounts(oldIds, newRoleIds);

  return {
    perm_key:               permKey,
    assignedRoleIds:        newRoleIds,
    entity_assignedRoleIds: entityUnion,
  };
}

// ── Field-level assignment ────────────────────────────────────────────────────

async function assignRolesToField(moduleName, entityKey, permKey, fieldKey, newRoleIds) {
  const mod    = await findModule(moduleName);
  const entity = findEntity(mod, entityKey);
  const perm   = findPermission(entity, permKey);

  const entityIdx = mod.entities.findIndex(e => e.key === entityKey);
  const permIdx   = mod.entities[entityIdx].permissions.findIndex(p => p.key === permKey);
  const fieldIdx  = perm.fieldPermissions?.findIndex(f => f.key === fieldKey) ?? -1;

  if (fieldIdx === -1) throw new AppError(`Field not found: ${fieldKey}`, 404);

  const fieldPath = `entities.${entityIdx}.permissions.${permIdx}.fieldPermissions.${fieldIdx}`;
  const oldIds    = perm.fieldPermissions[fieldIdx].assignedRoleIds ?? [];

  await PermissionModule.findOneAndUpdate(byName(moduleName), {
    $set: {
      [`${fieldPath}.assignedRoleIds`]:    newRoleIds,
      [`${fieldPath}.assignedRolesCount`]: newRoleIds.length,
    },
  });

  await syncRoleCounts(oldIds, newRoleIds);

  return {
    field_key:       fieldKey,
    perm_key:        permKey,
    entity_key:      entityKey,
    assignedRoleIds: newRoleIds,
  };
}

// ── Delete permission ─────────────────────────────────────────────────────────

async function deletePermission(moduleName, entityKey, permKey) {
  const mod    = await findModule(moduleName);
  const entity = findEntity(mod, entityKey);

  if (!entity.permissions?.some(p => p.key === permKey)) {
    throw new AppError(`Permission not found: ${permKey}`, 404);
  }

  const afterDelete = await PermissionModule.findOneAndUpdate(
    { ...byName(moduleName), 'entities.key': entityKey },
    { $pull: { 'entities.$.permissions': { key: permKey } } },
    { new: true },
  ).lean();

  if (!afterDelete) throw new AppError('Delete failed', 500);

  const remaining = afterDelete.entities.find(e => e.key === entityKey)?.permissions ?? [];
  const newUnion  = [...new Set(remaining.flatMap(p => p.assignedRoleIds ?? []))];

  await PermissionModule.findOneAndUpdate(
    { ...byName(moduleName), 'entities.key': entityKey },
    { $set: { 'entities.$.assignedRoleIds': newUnion, 'entities.$.assignedRolesCount': newUnion.length } },
  );

  return {
    entity_key:             entityKey,
    deleted_perm:           permKey,
    permissions_remaining:  remaining.length,
    entity_assignedRoleIds: newUnion,
  };
}

// ── Bulk status update ────────────────────────────────────────────────────────

async function bulkSetStatus(permKeys, status) {
  if (!permKeys.length) return { updated: 0 };

  const modules = await PermissionModule.find({}).lean();
  const grouped = groupPermKeysByLocation(modules, permKeys);

  let updated = 0;

  for (const { moduleName, entityKey, matchingKeys } of grouped) {
    const mod    = await PermissionModule.findOne(byName(moduleName)).lean();
    const entity = mod?.entities.find(e => e.key === entityKey);
    if (!entity) continue;

    const setObj = {};
    entity.permissions.forEach((perm, idx) => {
      if (matchingKeys.includes(perm.key)) {
        setObj[`entities.$[ent].permissions.${idx}.status`] = status;
        updated++;
      }
    });

    if (Object.keys(setObj).length) {
      await PermissionModule.findOneAndUpdate(
        byName(moduleName),
        { $set: setObj },
        { arrayFilters: [{ 'ent.key': entityKey }] },
      );
    }
  }

  return { updated, status };
}

function groupPermKeysByLocation(modules, permKeys) {
  const grouped = new Map();

  for (const mod of modules) {
    for (const entity of mod.entities ?? []) {
      const matchingKeys = entity.permissions
        .filter(p => permKeys.includes(p.key))
        .map(p => p.key);

      if (!matchingKeys.length) continue;

      grouped.set(`${mod.name}::${entity.key}`, {
        moduleName:  mod.name,
        entityKey:   entity.key,
        matchingKeys,
      });
    }
  }

  return [...grouped.values()];
}

module.exports = {
  assignRolesToEntity,
  assignRolesToPermission,
  assignRolesToField,
  deletePermission,
  bulkSetStatus,
};
