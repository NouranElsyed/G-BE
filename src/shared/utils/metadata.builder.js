/**
 * Metadata Builder — typed field descriptor factory.
 *
 * The Angular MetadataRenderer uses these descriptors to:
 *   - Generate table columns
 *   - Render correct field types (date pickers, status badges, enums…)
 *   - Control field visibility (is_public rules)
 *   - Order columns
 *
 * Supported types:
 *   STRING | NUMBER | DATE | BOOLEAN | STATUS | ENUM | LOOKUP
 *
 * is_public rules:
 *   -1 = Hidden completely (never rendered)
 *    0 = Internal only (detail view, not in table)
 *    1 = Visible in table and detail
 */

const FIELD_TYPES = Object.freeze({
  STRING:  'STRING',
  NUMBER:  'NUMBER',
  DATE:    'DATE',
  BOOLEAN: 'BOOLEAN',
  STATUS:  'STATUS',
  ENUM:    'ENUM',
  LOOKUP:  'LOOKUP',
});

const VISIBILITY = Object.freeze({
  HIDDEN:   -1,
  INTERNAL:  0,
  PUBLIC:    1,
});

/**
 * Creates a field metadata descriptor.
 *
 * @param {object} opts
 * @param {string}  opts.code        - field key matching item property (secondary_code)
 * @param {string}  opts.name        - display label
 * @param {string}  [opts.type]      - FIELD_TYPES value (default: STRING)
 * @param {number}  [opts.isPublic]  - VISIBILITY value (default: 1)
 * @param {number}  [opts.order]     - column order (default: 0)
 * @param {string}  [opts.icon]      - PrimeIcons class (e.g. 'pi pi-user')
 * @param {object}  [opts.enum]      - enum map for ENUM type
 * @param {object}  [opts.lookup]    - lookup config for LOOKUP type
 * @returns {object}
 */
function field(opts) {
  return {
    secondary_code: opts.code,
    name:           opts.name,
    type:           opts.type     ?? FIELD_TYPES.STRING,
    is_public:      opts.isPublic ?? VISIBILITY.PUBLIC,
    order:          opts.order    ?? 0,
    icon:           opts.icon     ?? null,
    enum:           opts.enum     ?? null,
    lookup:         opts.lookup   ?? null,
  };
}

// ── Convenience shorthands ────────────────────────────────────────────────────

const stringField  = (code, name, opts = {}) => field({ ...opts, code, name, type: FIELD_TYPES.STRING  });
const numberField  = (code, name, opts = {}) => field({ ...opts, code, name, type: FIELD_TYPES.NUMBER  });
const dateField    = (code, name, opts = {}) => field({ ...opts, code, name, type: FIELD_TYPES.DATE    });
const booleanField = (code, name, opts = {}) => field({ ...opts, code, name, type: FIELD_TYPES.BOOLEAN });
const statusField  = (code, name, opts = {}) => field({ ...opts, code, name, type: FIELD_TYPES.STATUS  });
const enumField    = (code, name, enumMap, opts = {}) => field({ ...opts, code, name, type: FIELD_TYPES.ENUM, enum: enumMap });
const lookupField  = (code, name, lookupCfg, opts = {}) => field({ ...opts, code, name, type: FIELD_TYPES.LOOKUP, lookup: lookupCfg });

const hiddenField   = (code, name, opts = {}) => field({ ...opts, code, name, isPublic: VISIBILITY.HIDDEN   });
const internalField = (code, name, opts = {}) => field({ ...opts, code, name, isPublic: VISIBILITY.INTERNAL });

module.exports = {
  FIELD_TYPES,
  VISIBILITY,
  field,
  stringField,
  numberField,
  dateField,
  booleanField,
  statusField,
  enumField,
  lookupField,
  hiddenField,
  internalField,
};
