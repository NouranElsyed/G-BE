/** Resolves effective role assignments for a given roleId across all permission nodes, respecting overrides and inheritance. */

const PermissionOverride = require('./permission.override.model');

/**
 * @param {object[]} moduleDocs - Lean PermissionModule documents
 * @param {number}   roleId
 * @returns {Promise<Record<string, {effectiveRoleIds: number[], source: string|null, overridden: boolean, inheritedFrom: string|null}>>}
 */
async function resolveAssignments(moduleDocs, roleId) {
  const rid = Number(roleId);

  // Fetch all overrides for this role in one query
  const overridesDocs = await PermissionOverride.find({ roleId: rid }).lean();
  const overrideMap   = new Map(); // targetKey → override doc
  for (const ov of overridesDocs) {
    overrideMap.set(ov.targetKey, ov);
  }

  const result = {};

  for (const mod of moduleDocs) {
    for (const entity of mod.entities ?? []) {
      // ── Resolve entity ────────────────────────────────────────────────────
      const entityOv = overrideMap.get(entity.key);
      let entityResolved;

      if (entityOv) {
        entityResolved = {
          effectiveRoleIds: entityOv.access === 'GRANT' ? [rid] : [],
          source:           'override',
          overridden:       true,
          inheritedFrom:    null,
        };
      } else if ((entity.assignedRoleIds ?? []).includes(rid)) {
        entityResolved = {
          effectiveRoleIds: [rid],
          source:           'direct',
          overridden:       false,
          inheritedFrom:    null,
        };
      } else {
        entityResolved = {
          effectiveRoleIds: [],
          source:           null,
          overridden:       false,
          inheritedFrom:    null,
        };
      }
      result[entity.key] = entityResolved;

      const entityGranted = entityResolved.effectiveRoleIds.includes(rid);

      for (const perm of entity.permissions ?? []) {
        // ── Resolve permission ────────────────────────────────────────────
        const permOv = overrideMap.get(perm.key);
        let permResolved;

        if (permOv) {
          permResolved = {
            effectiveRoleIds: permOv.access === 'GRANT' ? [rid] : [],
            source:           'override',
            overridden:       true,
            inheritedFrom:    null,
          };
        } else if ((perm.assignedRoleIds ?? []).includes(rid)) {
          permResolved = {
            effectiveRoleIds: [rid],
            source:           'direct',
            overridden:       false,
            inheritedFrom:    null,
          };
        } else if (entityGranted) {
          permResolved = {
            effectiveRoleIds: [rid],
            source:           'inherited',
            overridden:       false,
            inheritedFrom:    entity.key,
          };
        } else {
          permResolved = {
            effectiveRoleIds: [],
            source:           null,
            overridden:       false,
            inheritedFrom:    null,
          };
        }
        result[perm.key] = permResolved;

        const permGranted = permResolved.effectiveRoleIds.includes(rid);

        for (const field of perm.fieldPermissions ?? []) {
          // ── Resolve field ───────────────────────────────────────────────
          const fieldOv = overrideMap.get(field.key);
          let fieldResolved;

          if (fieldOv) {
            fieldResolved = {
              effectiveRoleIds: fieldOv.access === 'GRANT' ? [rid] : [],
              source:           'override',
              overridden:       true,
              inheritedFrom:    null,
            };
          } else if ((field.assignedRoleIds ?? []).includes(rid)) {
            fieldResolved = {
              effectiveRoleIds: [rid],
              source:           'direct',
              overridden:       false,
              inheritedFrom:    null,
            };
          } else if (permGranted) {
            fieldResolved = {
              effectiveRoleIds: [rid],
              source:           'inherited',
              overridden:       false,
              inheritedFrom:    perm.key,
            };
          } else {
            fieldResolved = {
              effectiveRoleIds: [],
              source:           null,
              overridden:       false,
              inheritedFrom:    null,
            };
          }
          result[field.key] = fieldResolved;
        }
      }
    }
  }

  return result;
}

module.exports = { resolveAssignments };
