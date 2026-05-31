/**
 * i18n resolution helpers.
 *
 * Single source of truth for locale resolution across the entire codebase.
 * All services import from here — never inline locale resolution logic.
 *
 * Permission i18n structure:  { en: string, ar: string }
 * Role i18n structure:        { en: { role_name, ... }, ar: { role_name, ... } }
 */

/**
 * Resolves a localised label from a flat i18n map: { en: string, ar: string }
 * Falls back: requested lang → English → fallback string.
 *
 * @param {object} i18n      - { en: string, ar: string }
 * @param {string} lang      - 'en' | 'ar'
 * @param {string} [fallback]
 * @returns {string}
 */
function resolveLabel(i18n, lang, fallback = '') {
  return i18n?.[lang] ?? i18n?.en ?? fallback;
}

/**
 * Resolves the labels of an entire permission module document tree.
 * Returns a new object with every node's `name` set to the localised string.
 * Used by the tree service before passing to the tree builder.
 *
 * @param {object} mod   - raw module document (lean Mongoose result)
 * @param {string} lang  - 'en' | 'ar'
 * @returns {object}     - cloned module with `name` resolved at every level
 */
function resolveModuleI18n(mod, lang) {
  return {
    ...mod,
    name: resolveLabel(mod.i18n, lang, mod.name),
    entities: (mod.entities ?? []).map(ent => ({
      ...ent,
      name: resolveLabel(ent.i18n, lang, ent.key),
      permissions: (ent.permissions ?? []).map(perm => ({
        ...perm,
        name: resolveLabel(perm.i18n, lang, perm.key),
        fieldPermissions: (perm.fieldPermissions ?? []).map(f => ({
          ...f,
          name: resolveLabel(f.i18n, lang, f.key),
        })),
      })),
    })),
  };
}

module.exports = { resolveLabel, resolveModuleI18n };
