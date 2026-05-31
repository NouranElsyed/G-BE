/**
 * Permission tree builder.
 *
 * Converts raw MongoDB documents into the tree node shape
 * the frontend expects.
 *
 * Node contract (all levels):
 * {
 *   level:     1 | 2 | 3 | 4,
 *   label:     string,          ← localised display name
 *   module_en: string,          ← stable English key for API URLs
 *   data:      object,          ← level-specific fields
 *   children:  { data: node[] } | null,
 * }
 *
 * NOTE: checked / partial_checked are intentionally absent — the frontend
 * derives them from the roleAssignments map returned by the API.
 */

// ── i18n ──────────────────────────────────────────────────────────────────────

function resolveLabel(i18n, lang, fallback = '') {
  if (!i18n)                     return fallback;
  if (typeof i18n === 'string')  return i18n || fallback;
  return i18n[lang] ?? i18n.en ?? fallback;
}

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_LABELS = {
  Active:   { en: 'Active',   ar: 'مفعل'     },
  Inactive: { en: 'Inactive', ar: 'غير مفعل' },
  Pending:  { en: 'Pending',  ar: 'معلق'     },
};

function resolveStatusLabel(status, lang) {
  return STATUS_LABELS[status]?.[lang] ?? status ?? 'Active';
}

// ── Node builders (level 4 → 1) ───────────────────────────────────────────────

function buildFieldNode(field, moduleEn, lang) {
  return {
    level:     4,
    label:     resolveLabel(field.i18n, lang, field.key),
    module_en: moduleEn,
    data: {
      field_key:          field.key,
      field_name:         resolveLabel(field.i18n, lang, field.key),
      field_access:       field.access ?? 'FULL',
      field_status:       field.status ?? 'Active',
      statusLabel:        resolveStatusLabel(field.status, lang),
      assignedRoleIds:    field.assignedRoleIds    ?? [],
      assignedRolesCount: field.assignedRolesCount ?? 0,
    },
    children: null,
  };
}

function buildPermissionNode(perm, moduleEn, lang) {
  const fieldNodes = (perm.fieldPermissions ?? []).map(f =>
    buildFieldNode(f, moduleEn, lang)
  );

  return {
    level:     3,
    label:     resolveLabel(perm.i18n, lang, perm.key),
    module_en: moduleEn,
    data: {
      perm_key:            perm.key,
      perm_name:           resolveLabel(perm.i18n, lang, perm.key),
      perm_action:         perm.action ?? null,
      perm_status:         perm.status ?? 'Active',
      statusLabel:         resolveStatusLabel(perm.status, lang),
      perm_assigned_roles: perm.assignedRolesCount ?? 0,
      assignedRoleIds:     perm.assignedRoleIds    ?? [],
    },
    children: { data: fieldNodes },
  };
}

function buildEntityNode(entity, moduleEn, lang) {
  const permNodes = (entity.permissions ?? []).map(p =>
    buildPermissionNode(p, moduleEn, lang)
  );

  return {
    level:     2,
    label:     resolveLabel(entity.i18n, lang, entity.key),
    module_en: moduleEn,
    data: {
      entity_key:            entity.key,
      entity_name:           resolveLabel(entity.i18n, lang, entity.key),
      entity_category:       moduleEn,
      entity_status:         entity.status ?? 'Active',
      statusLabel:           resolveStatusLabel(entity.status, lang),
      entity_assigned_roles: entity.assignedRolesCount ?? 0,
      assignedRoleIds:       entity.assignedRoleIds    ?? [],
    },
    children: { data: permNodes },
  };
}

function buildModuleNode(mod, lang) {
  const moduleEn    = resolveLabel(mod.i18n, 'en', mod.name ?? '');
  const moduleLabel = resolveLabel(mod.i18n, lang,  mod.name ?? '');

  const entityNodes = (mod.entities ?? []).map(e =>
    buildEntityNode(e, moduleEn, lang)
  );

  return {
    level:     1,
    label:     moduleLabel,
    module_en: moduleEn,
    data: { module_name: moduleLabel },
    children: { data: entityNodes },
  };
}

module.exports = {
  buildModuleNode,
  buildEntityNode,
  buildPermissionNode,
  buildFieldNode,
  resolveLabel,
  resolveStatusLabel,
};
