/**
 * Roles Service
 *
 * All role-related business logic.
 * Controllers stay thin — one service call per endpoint.
 */

const Role         = require('./role.model');
const { AppError } = require('../../../shared/errors/AppError');

/**
 * Returns all roles with names resolved to the requested language.
 *
 * @param {string} lang
 * @returns {object[]}
 */
async function listRoles(lang) {
  const roles = await Role.find({}).lean();
  return roles.map(r => flattenRole(r, lang));
}

/**
 * Returns a single role.
 *
 * @param {number} roleId
 * @param {string} lang
 */
async function getRole(roleId, lang) {
  const role = await Role.findOne({ role_id: roleId }).lean();
  if (!role) throw new AppError('Role not found', 404);
  return flattenRole(role, lang);
}

/**
 * Creates a new role.
 *
 * @param {object} body  - request body
 */
async function createRole(body) {
  const role = await Role.create(body);
  return role.toObject();
}

/**
 * Full replace update on a role.
 *
 * @param {number} roleId
 * @param {object} body
 */
async function replaceRole(roleId, body) {
  const role = await Role.findOneAndUpdate(
    { role_id: roleId },
    body,
    { new: true, runValidators: true },
  ).lean();

  if (!role) throw new AppError('Role not found', 404);
  return role;
}

/**
 * Deletes a role.
 *
 * @param {number} roleId
 */
async function deleteRole(roleId) {
  const role = await Role.findOneAndDelete({ role_id: roleId });
  if (!role) throw new AppError('Role not found', 404);
}

// ── Internal ─────────────────────────────────────────────────────────────────

/**
 * Flattens the i18n nested structure into a flat response object.
 * The client receives only the requested language — no dual-language payload.
 */
function flattenRole(role, lang) {
  const i18n = role.i18n?.[lang] ?? role.i18n?.en ?? {};
  return {
    role_id:           role.role_id,
    role_user_count:   role.role_user_count,
    role_perm_count:   role.role_perm_count,
    role_status_color: role.role_status_color,
    role_updated_at:   role.role_updated_at,
    ...i18n,
  };
}

module.exports = {
  listRoles,
  getRole,
  createRole,
  replaceRole,
  deleteRole,
};
