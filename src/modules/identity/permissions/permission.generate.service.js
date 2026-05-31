/**
 * Permission Generate Service
 *
 * Generates the full permission tree from the DB schema definition
 * and upserts it into MongoDB.
 *
 * This is a one-time / admin operation, not part of the hot path.
 */

const PermissionModule = require('./permission.model');
const {
  DEFAULT_ACTIONS,
  FIELD_LEVEL_ACTIONS,
  MODULE_PREFIX_MAP,
  PERMISSION_STATUS,
  FIELD_ACCESS,
} = require('../../../shared/constants/permissions');

// ── Full DB schema ────────────────────────────────────────────────────────────
// Each entry = one database table that becomes one entity in the permissions tree.
const DB_SCHEMA = [
  { table: 'COR_CONFIGURATION', columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','ENVIRONMENT','MODULE_ID','KEY','VALUE','FORMAT','IS_ENCRYPTED','VALID_FROM','VALID_UNTIL','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'COR_SCHEDULE',      columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','CRON_EXPRESSION','TIMEZONE','JOB_CLASS','JOB_DATA','IS_ENABLED','LAST_RUN_AT','NEXT_RUN_AT','LAST_STATUS','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'COR_SETTING',       columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','SCOPE','VALUE_TYPE','VALUE','DEFAULT_VALUE','IS_EDITABLE','IS_SENSITIVE','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'DTA_MAPPING',       columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','FROM_PARAMETER_ID','TO_PARAMETER_ID','TRANSFORMATION_ID','EXPRESSION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'DTA_PARAMETER',     columns: ['ID','PARENT_ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','DATA_SOURCE_ID','ENTITY_ID','SCHEMA_ID','TYPE','FORMAT','PATH','EXPRESSION','ENUM','DEFAULT','MIN','MAX','CONSTRAINTS','USAGE','MIN_OCCURS','MAX_OCCURS','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','REF_PARAMETER_ID'] },
  { table: 'DTA_SOURCE',        columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','ORGANIZATION_ID','PORT_ID','SERVICE_ID','CONFIGURATION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'DTA_TRANSFORMATION',columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','VERSION','FROM_SOURCE_ID','TO_SOURCE_ID','FROM_SCHEMA_ID','TO_SCHEMA_ID','ATTACHMENT_ID','PAYLOAD_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'DTA_TRANSLATION',   columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','FROM_SOURCE_ID','TO_SOURCE_ID','FROM_VALUE','TO_VALUE','TRANSFORMATION_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'FLW_EDGE',          columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','WORKFLOW_ID','FROM_NODE_ID','TO_NODE_ID','PRIORITY_NO','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'FLW_NODE',          columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','WORKFLOW_ID','CHANNEL_ID','TRANSFORMATION_ID','IS_INITIAL','IS_FINAL','ORDER','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'FLW_WORKFLOW',      columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','VERSION','STATUS_ID','CATEGORY_ID','POLICY_ID','PARENT_ID','FROM_WORKFLOW_ID','TO_WORKFLOW_ID','ATTACHMENT_ID','CONFIGURATION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'GRP_CATEGORY',      columns: ['ID','CODE','NAME_CODE','STATUS_ID','PARENT_ID','IS_PUBLIC','PATH','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','TABLE_NAME','LEVEL'] },
  { table: 'GRP_ENTITY',        columns: ['ID','CODE','NAME_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','MODULE_ID','IS_PUBLIC','TABLE_NAME','VIEW_NAME','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID','STATUSES','DESCRIPTION_CODE'] },
  { table: 'GRP_MODULE',        columns: ['ID','CODE','NAME_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','IS_PUBLIC','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'IAM_ASSIGNMENT',    columns: ['ID','USER_ID','ROLE_ID','STATUS_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IAM_PERMISSION',    columns: ['ID','CODE','NAME_CODE','STATUS_ID','CATEGORY_ID','MODULE_ID','ENTITY_ID','ACTION_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IAM_ROLE',          columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','COMMUNITY_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'IAM_USER',          columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','ORGANIZATION_ID','PASSWORD','EMAIL','PHONE','LANDLINE','LANGUAGE_ID','SETTING_ID','LAST_LOGIN_AT','LOCKED_UNTIL','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'IAM_USER_FIELD',    columns: ['ID','USER_ID','FIELD_KEY','FIELD_VALUE','STATUS_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'LOG_EVENT',         columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','ENTITY_ID','TOPIC_ID','PROCESS_ID','SCHEMA_ID','ACTION_ID','ATTACHMENT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'MSG_MESSAGE',       columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','PROCESS_ID','SCHEMA_ID','CONVERSATION_ID','PORT_ID','IDEMPOTENCY','HASH','REF_MSG_ID','SENDER_ID','SENDER_CONNECTOR_ID','SENDER_CHANNEL_ID','RECEIVER_ID','RECEIVER_CONNECTOR_ID','RECEIVER_CHANNEL_ID','SENT_AT','PROCESSED_AT','RECEIVED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'ORG_COMMUNITY',     columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'ORG_ORGANIZATION',  columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','COMMUNITY_ID','DOMAIN_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'PRC_PROCESS',       columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','TOPIC_ID','VERSION','ATTACHMENT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'SHR_ACTION',        columns: ['ID','CODE','NAME_CODE','CATEGORY_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','DESCRIPTION_CODE'] },
  { table: 'SHR_LOCALIZATION',  columns: ['ID','CODE','LANGUAGE_ID','MODULE_ID','IS_PERSISTENT','STRING_VALUE','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'STG_ATTACHMENT',    columns: ['ID','CODE','NAME','DESCRIPTION','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','PATH','TYPE','SIZE','HASH','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','VALID_UNTIL'] },
  { table: 'STG_MEDIA',         columns: ['ID','CODE','SECONDARY_CODE','NAME','DESCRIPTION','STATUS_ID','CATEGORY_ID','PATH','ICON','THUMB','IMAGE','VIDEO','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','VALID_UNTIL'] },
  { table: 'TKT_TICKET',        columns: ['ID','CODE','NAME','DESCRIPTION','STATUS_ID','CATEGORY_ID','USER_ID','ORGANIZATION_ID','PRIORITY','ASSIGNED_TO_ID','RESOLVED_AT','ATTACHMENT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','DOMAIN_ID','MODULE_ID','ENTITY_ID','TOPIC_ID','PARENT_ID','TYPE','SOURCE','CLOSED_AT','RESOLUTION','RECOMMENDATION'] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** "CREATED_BY_ID" → "Created By Id" */
function toTitleCase(str) {
  return str
    .toLowerCase()
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Builds in-memory module structures from the DB schema definition.
 * Does NOT touch the database.
 *
 * @param {object[]} schema  - subset of DB_SCHEMA
 * @returns {object[]}       module documents ready for upsert
 */
function buildModulesFromSchema(schema) {
  const modulesMap = {};

  for (const { table, columns } of schema) {
    const prefix     = table.split('_')[0];
    const moduleName = MODULE_PREFIX_MAP[prefix] ?? prefix;
    const entityKey  = table.toLowerCase();
    const entityName = toTitleCase(table.replace('_', ' '));

    const fieldPermissions = columns.map(col => ({
      key:    col.toLowerCase(),
      code:   `${table}_FIELD_${col}`,
      i18n:   { en: toTitleCase(col) },
      status: PERMISSION_STATUS.ACTIVE,
      access: FIELD_ACCESS.FULL,
    }));

    const permissions = DEFAULT_ACTIONS.map(act => ({
      key:                `${entityKey}_${act.suffix.toLowerCase()}`,
      code:               `${table}_${act.suffix}`,
      i18n:               { en: act.suffix.charAt(0) + act.suffix.slice(1).toLowerCase() },
      action:             act.action,
      status:             PERMISSION_STATUS.ACTIVE,
      assignedRolesCount: 0,
      assignedRoleIds:    [],
      // Only VIEW-type actions carry field-level permissions
      fieldPermissions:   FIELD_LEVEL_ACTIONS.has(act.action) ? fieldPermissions : [],
    }));

    if (!modulesMap[moduleName]) {
      modulesMap[moduleName] = {
        name:     moduleName,
        i18n:     { en: moduleName },
        entities: [],
      };
    }

    modulesMap[moduleName].entities.push({
      key:                entityKey,
      code:               table,
      i18n:               { en: entityName },
      status:             PERMISSION_STATUS.ACTIVE,
      assignedRolesCount: 0,
      assignedRoleIds:    [],
      createdBy:          null,
      createdAt:          null,
      updatedBy:          null,
      updatedAt:          null,
      permissions,
    });
  }

  return Object.values(modulesMap);
}

/**
 * Generates permissions from the schema and upserts them into MongoDB.
 *
 * @param {{ prefixFilter?: string[], dryRun?: boolean }} opts
 */
async function generatePermissions({ prefixFilter, dryRun = false } = {}) {
  const filtered = prefixFilter?.length
    ? DB_SCHEMA.filter(r => prefixFilter.includes(r.table.split('_')[0]))
    : DB_SCHEMA;

  if (!filtered.length) {
    return { generated: 0, modules: [] };
  }

  const moduleList = buildModulesFromSchema(filtered);

  if (dryRun) {
    return { generated: moduleList.length, modules: moduleList, dryRun: true };
  }

  const ops = moduleList.map(mod => ({
    updateOne: {
      filter: { name: mod.name },
      update: { $set: { name: mod.name, i18n: mod.i18n, entities: mod.entities } },
      upsert: true,
    },
  }));

  const bulkResult = await PermissionModule.bulkWrite(ops);

  return {
    generated: moduleList.length,
    upserted:  bulkResult.upsertedCount,
    modified:  bulkResult.modifiedCount,
    tables:    filtered.length,
    modules:   moduleList.map(m => ({ name: m.name, entities_count: m.entities.length })),
  };
}

module.exports = { generatePermissions };