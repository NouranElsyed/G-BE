/**
 * Permission Tree Service
 *
 * Responsible for loading and shaping the full permission tree.
 * No business logic beyond reading and transforming data.
 */

const PermissionModule = require('./permission.model');
const CollectionMeta   = require('../../shared/database/collectionMeta.model');
const Role             = require('../roles/role.model');
const { buildModuleNode } = require('../../shared/helpers/tree.builder');

/**
 * Returns the full permission tree with optional role-scoped check states.
 *
 * @param {string}  lang    - 'en' | 'ar'
 * @param {number|null} roleId - when provided, nodes are marked checked/partial
 * @returns {Promise<object|null>}
 */
async function getPermissionTree(lang, roleId) {
  const [rootMeta, modules, roles] = await Promise.all([
    CollectionMeta.findOne({ collection: 'permissions', lang }).lean(),
    PermissionModule.find({}).lean(),
    Role.find({}).lean(),
  ]);

  if (!rootMeta) return null;

  const items = modules.map(mod => buildModuleNode(mod, roleId, lang));

  const rolesList = roles.map(r => ({
    id:   String(r.role_id),
    name: r.i18n?.[lang]?.role_name ?? r.i18n?.en?.role_name ?? `Role ${r.role_id}`,
  }));

  // Flat map of all current role assignments keyed by node key
  // Used by the frontend to pre-populate assignment dialogs
  const roleAssignments = buildRoleAssignmentMap(modules);

  return { rootMeta, items, rolesList, roleAssignments };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds a flat { key → roleIds[] } map from all module documents.
 * Covers entity, permission, and field levels.
 */
function buildRoleAssignmentMap(modules) {
  const map = {};

  for (const mod of modules) {
    for (const entity of mod.entities ?? []) {
      setIfNonEmpty(map, entity.key, entity.assignedRoleIds);

      for (const perm of entity.permissions ?? []) {
        setIfNonEmpty(map, perm.key, perm.assignedRoleIds);

        for (const field of perm.fieldPermissions ?? []) {
          setIfNonEmpty(map, field.key, field.assignedRoleIds);
        }
      }
    }
  }

  return map;
}

function setIfNonEmpty(map, key, roleIds) {
  if ((roleIds ?? []).length > 0) {
    map[key] = roleIds.map(String);
  }
}

module.exports = { getPermissionTree };