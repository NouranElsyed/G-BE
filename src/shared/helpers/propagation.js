/**
 * Permission propagation helpers — pure functions, no DB calls.
 *
 * Two directions:
 *   ↓ cascade   — entity change pushes roles to all permissions + their fields
 *   ↑ bubble-up — permission change recalculates the parent entity's union
 */

// ── Cascade (entity → permissions → fields) ───────────────────────────────────

/**
 * Builds a $set object that cascades a role list from an entity
 * down to all its permissions AND each permission's field-level permissions.
 *
 * ✅ FIX Bug 2: now includes fieldPermissions in the cascade.
 *
 * @param {object[]} permissions - entity.permissions (lean)
 * @param {number[]} newRoleIds
 * @returns {object}
 */
function buildCascadeSet(permissions, newRoleIds) {
  const set = {
    'entities.$[ent].assignedRoleIds':    newRoleIds,
    'entities.$[ent].assignedRolesCount': newRoleIds.length,
  };

  permissions.forEach((perm, pi) => {
    const base = `entities.$[ent].permissions.${pi}`;

    set[`${base}.assignedRoleIds`]    = newRoleIds;
    set[`${base}.assignedRolesCount`] = newRoleIds.length;

    // cascade into each field inside this permission
    (perm.fieldPermissions ?? []).forEach((_, fi) => {
      set[`${base}.fieldPermissions.${fi}.assignedRoleIds`]    = newRoleIds;
      set[`${base}.fieldPermissions.${fi}.assignedRolesCount`] = newRoleIds.length;
    });
  });

  return set;
}

// ── Bubble-up (permission → entity) ──────────────────────────────────────────

/**
 * Builds a $set object that updates a single permission's roles
 * and bubbles the change up to the parent entity.
 *
 * @param {object[]} allPermissions - all permissions in the entity (lean)
 * @param {string}   targetPermKey
 * @param {number[]} newRoleIds
 * @returns {{ entityUnion: number[], set: object }}
 */
function buildBubbleUpSet(allPermissions, targetPermKey, newRoleIds) {
  const entityUnion = unionOf(
    allPermissions.map(p =>
      p.key === targetPermKey ? newRoleIds : (p.assignedRoleIds ?? [])
    )
  );

  const set = {
    'entities.$[ent].permissions.$[perm].assignedRoleIds':    newRoleIds,
    'entities.$[ent].permissions.$[perm].assignedRolesCount': newRoleIds.length,
    'entities.$[ent].assignedRoleIds':                        entityUnion,
    'entities.$[ent].assignedRolesCount':                     entityUnion.length,
  };

  return { entityUnion, set };
}

// ── Role count diff helpers ───────────────────────────────────────────────────

/**
 * @param {number[]} oldIds
 * @param {number[]} newIds
 * @returns {{ added: number[], removed: number[] }}
 */
function diffRoleIds(oldIds, newIds) {
  const oldSet = new Set(oldIds);
  const newSet = new Set(newIds);
  return {
    added:   newIds.filter(id => !oldSet.has(id)),
    removed: oldIds.filter(id => !newSet.has(id)),
  };
}

/**
 * @param {number[]} added
 * @param {number[]} removed
 * @returns {object[]} bulkWrite ops
 */
function buildRoleCountOps(added, removed) {
  const ops = [];
  const now  = new Date();

  if (added.length) {
    ops.push({
      updateMany: {
        filter: { role_id: { $in: added } },
        update: { $inc: { role_perm_count: 1 }, $set: { role_updated_at: now } },
      },
    });
  }

  if (removed.length) {
    ops.push({
      updateMany: {
        filter: { role_id: { $in: removed } },
        update: { $inc: { role_perm_count: -1 }, $set: { role_updated_at: now } },
      },
    });
  }

  return ops;
}

// ── Internal ──────────────────────────────────────────────────────────────────

function unionOf(arrays) {
  return [...new Set(arrays.flat())];
}

module.exports = { buildCascadeSet, buildBubbleUpSet, diffRoleIds, buildRoleCountOps };
