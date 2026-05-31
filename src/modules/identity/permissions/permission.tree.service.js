/** Fetches and assembles the full permission tree, with optional role-aware resolved assignments. */

const PermissionModule   = require('./permission.model');
const CollectionMeta     = require('../../../models/collectionMeta.model');
const Role               = require('../../identity/roles/role.model');
const { buildModuleNode }       = require('../../../shared/helpers/tree.builder');
const { resolveAssignments }    = require('./permission.resolver.service');

async function getPermissionTree(lang, roleId) {
  const [rootMeta, modules, roles] = await Promise.all([
    CollectionMeta.findOne({ collection: 'permissions', lang }).lean(),
    PermissionModule.find({}).lean(),
    Role.find({}).lean(),
  ]);

  if (!rootMeta) return null;

  const items = modules.map(mod => buildModuleNode(mod, lang));

  const rolesList = roles.map(r => ({
    id:   String(r.role_id),
    name: r.i18n?.[lang]?.role_name ?? r.i18n?.en?.role_name ?? `Role ${r.role_id}`,
  }));

  const roleAssignments = roleId != null
    ? await resolveAssignments(modules, roleId)
    : buildRoleAssignmentMap(modules);

  return { rootMeta, items, rolesList, roleAssignments };
}

// ── Simple flat map (used when no roleId is provided) ─────────────────────────

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
