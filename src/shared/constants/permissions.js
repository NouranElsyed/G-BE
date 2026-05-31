/**
 * Permission constants — single source of truth.
 *
 * Import these everywhere instead of duplicating values.
 */

// prefix (e.g. "IAM") → module display name used in API URLs and DB
const MODULE_PREFIX_MAP = {
  COR: 'Core',
  DTA: 'Data',
  FLW: 'Flow',
  GRP: 'Group',
  HLP: 'Help',
  IAM: 'Identity',
  IFR: 'Infrastructure',
  LOG: 'Logging',
  MSG: 'Messaging',
  NTF: 'Notification',
  ORG: 'Organization',
  PRC: 'Process',
  SHR: 'Shared',
  SRH: 'Search',
  STG: 'Storage',
  TKT: 'Ticket',
  VSL: 'Vessel',
};

// Default CRUD actions generated for every entity
const DEFAULT_ACTIONS = [
  { suffix: 'VIEW',   action: 'READ'   },
  { suffix: 'CREATE', action: 'WRITE'  },
  { suffix: 'UPDATE', action: 'UPDATE' },
  { suffix: 'DELETE', action: 'DELETE' },
];

// Only these action types carry field-level permissions
const FIELD_LEVEL_ACTIONS = new Set(['READ']);

const PERMISSION_STATUS = {
  ACTIVE:   'Active',
  INACTIVE: 'Inactive',
};

const FIELD_ACCESS = {
  FULL:   'FULL',
  READ:   'READ',
  HIDDEN: 'HIDDEN',
};

module.exports = {
  MODULE_PREFIX_MAP,
  DEFAULT_ACTIONS,
  FIELD_LEVEL_ACTIONS,
  PERMISSION_STATUS,
  FIELD_ACCESS,
};