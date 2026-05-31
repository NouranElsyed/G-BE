/** CRUD operations for per-role permission overrides. */

const PermissionOverride = require('./permission.override.model');

/**
 * Upserts a permission override for a role on a specific target node.
 * @param {{ roleId, targetType, targetKey, parentKey, moduleId, access }} params
 */
async function setOverride({ roleId, targetType, targetKey, parentKey, moduleId, access = 'GRANT' }) {
  const override = await PermissionOverride.findOneAndUpdate(
    { roleId: Number(roleId), targetKey },
    {
      $set: {
        targetType,
        parentKey,
        moduleId:  moduleId ?? undefined,
        access,
        createdAt: new Date(),
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return override;
}

/**
 * Removes a permission override, restoring natural inheritance for that role + target.
 * @param {{ roleId, targetKey }} params
 */
async function removeOverride({ roleId, targetKey }) {
  await PermissionOverride.deleteOne({ roleId: Number(roleId), targetKey });
  return { removed: true, targetKey };
}

/**
 * Returns all overrides for a given role.
 * @param {number|string} roleId
 */
async function getOverridesForRole(roleId) {
  return PermissionOverride.find({ roleId: Number(roleId) }).lean();
}

module.exports = { setOverride, removeOverride, getOverridesForRole };
