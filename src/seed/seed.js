require('dotenv').config();
const mongoose = require('mongoose');

const Vessel           = require('../models/vessel.model');
const User             = require('../models/user.model');
const Role             = require('../modules/identity/roles/role.model');
const Process          = require('../models/process.model');
const Conversation     = require('../models/conversation.model');
const Topic            = require('../models/topic.model');
const Visit            = require('../models/visit.model');
const CollectionMeta   = require('../models/collectionMeta.model');
const PermissionModule = require('../modules/identity/permissions/permission.model');

const vesselsEn           = require('./data/vessels-en.json');
const vesselsAr           = require('./data/vessels-ar.json');
const usersEn             = require('./data/users-en.json');
const usersAr             = require('./data/users-ar.json');
const rolesEn             = require('./data/roles-list-en.json');
const rolesAr             = require('./data/roles-list-ar.json');
const processesEn         = require('./data/processes-en.json');
const processesAr         = require('./data/processes-ar.json');
const permissionsEn       = require('./data/permissions-en.json');
const permissionsAr       = require('./data/permissions-ar.json');
const permissionsEntityEn = require('./data/permissions-entity-en.json');
const permissionsEntityAr = require('./data/permissions-entity-ar.json');
const permissionsChildEn  = require('./data/permissions-child-en.json');
const permissionsChildAr  = require('./data/permissions-child-ar.json');
const permissionsFieldEn  = require('./data/permissions-field-en.json');
const permissionsFieldAr  = require('./data/permissions-field-ar.json');
const conversationsEn     = require('./data/conversations-en.json');
const conversationsAr     = require('./data/conversations-ar.json');
const topicsEn            = require('./data/topics-en.json');
const topicsAr            = require('./data/topics-ar.json');
const visitsEn            = require('./data/visits-en.json');
const visitsAr            = require('./data/visits-ar.json');

// ══════════════════════════════════════════════════════════════════════════════
// DB Schema
// ══════════════════════════════════════════════════════════════════════════════
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
  { table: 'FLW_EXECUTION',     columns: ['ID','CODE','NAME','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','RULE_ID','ROUTE_ID','STEP_ID','PATH_ID','ORDER','OCCURRED_AT','RESULT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'FLW_NODE',          columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','WORKFLOW_ID','CHANNEL_ID','TRANSFORMATION_ID','IS_INITIAL','IS_FINAL','ORDER','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'FLW_PATH',          columns: ['ID','CODE','NAME','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','ROUTE_ID','EDGE_ID','FROM_STEP_ID','TO_STEP_ID','OCCURRED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'FLW_ROUTE',         columns: ['ID','CODE','NAME','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','WORKFLOW_ID','PARENT_ID','FROM_ROUTE_ID','TO_ROUTE_ID','CONVERSATION_ID','MESSAGE_ID','SERVICE_ID','STARTED_AT','ENDED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'FLW_RULE',          columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','NODE_ID','EDGE_ID','EXPRESSION','ATTACHMENT_ID','PATH','SEVERITY','PRIORITY','ORDER','VERSION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'FLW_STEP',          columns: ['ID','CODE','NAME','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','ROUTE_ID','NODE_ID','STARTED_AT','ENDED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'FLW_WORKFLOW',      columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','VERSION','STATUS_ID','CATEGORY_ID','POLICY_ID','PARENT_ID','FROM_WORKFLOW_ID','TO_WORKFLOW_ID','ATTACHMENT_ID','CONFIGURATION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'GRP_CATEGORY',      columns: ['ID','CODE','NAME_CODE','STATUS_ID','PARENT_ID','IS_PUBLIC','PATH','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','TABLE_NAME','LEVEL'] },
  { table: 'GRP_DOMAIN',        columns: ['ID','CODE','NAME_CODE','STATUS_ID','CATEGORY_ID','IS_PUBLIC','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID','ORDER'] },
  { table: 'GRP_ENTITY',        columns: ['ID','CODE','NAME_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','MODULE_ID','IS_PUBLIC','TABLE_NAME','VIEW_NAME','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID','STATUSES','DESCRIPTION_CODE'] },
  { table: 'GRP_MODULE',        columns: ['ID','CODE','NAME_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','IS_PUBLIC','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'GRP_TOPIC',         columns: ['ID','CODE','NAME_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','MODULE_ID','ENTITY_ID','IS_PUBLIC','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'HLP_DOCUMENTATION', columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','MODULE_ID','ENTITY_ID','PARENT_ID','ATTACHMENT_ID','PAYLOAD_ID','VERSION','IS_PUBLIC','ORDER','PUBLISHED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'HLP_FAQ',           columns: ['ID','CODE','NAME_CODE','STATUS_ID','CATEGORY_ID','QUESTION_CODE','ANSWER_CODE','DOMAIN_ID','MODULE_ID','ENTITY_ID','COMMUNITY_ID','ORDER','IS_FEATURED','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'HLP_GUIDE',         columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','MODULE_ID','ENTITY_ID','COMMUNITY_ID','ATTACHMENT_ID','PAYLOAD_ID','ORDER','VERSION','PUBLISHED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IAM_ASSIGNMENT',    columns: ['ID','USER_ID','ROLE_ID','STATUS_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IAM_PERMISSION',    columns: ['ID','CODE','NAME_CODE','STATUS_ID','CATEGORY_ID','MODULE_ID','ENTITY_ID','ACTION_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IAM_PRIVILEGE',     columns: ['ID','PERMISSION_ID','ROLE_ID','STATUS_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IAM_ROLE',          columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','COMMUNITY_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'IAM_SESSION',       columns: ['ID','CODE','NAME','STATUS_ID','CATEGORY_ID','USER_ID','TOKEN_ID','IP_ADDRESS','USER_AGENT','DEVICE_ID','STARTED_AT','LAST_ACTIVE_AT','EXPIRED_AT','REVOKED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IAM_TOKEN',         columns: ['ID','CODE','NAME','STATUS_ID','CATEGORY_ID','USER_ID','TOKEN_TYPE','TOKEN_HASH','SCOPE','ISSUED_AT','EXPIRED_AT','REVOKED_AT','LAST_USED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IAM_USER',          columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','ORGANIZATION_ID','PASSWORD','EMAIL','PHONE','LANDLINE','LANGUAGE_ID','SETTING_ID','LAST_LOGIN_AT','LOCKED_UNTIL','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'IFR_ACCESS',        columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','HOST_ID','SERVICE_ID','CONNECTOR_ID','PORT','USERNAME','PASSWORD','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IFR_CHANNEL',       columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','CONNECTOR_ID','TYPE','PATH','DIRECTION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IFR_CLUSTER',       columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','CONFIGURATION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IFR_CONNECTION',    columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','FROM_CONNECTOR_ID','TO_CONNECTOR_ID','PORT','CONFIGURATION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IFR_CONNECTOR',     columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','SERVICE_ID','URI','CONFIGURATION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IFR_HOST',          columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','OWNER_ID','CLUSTER_ID','IP','SECONDARY_IP','OS','RAM','CPU','STORAGE','CONFIGURATION','CATEGORY_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'IFR_SERVICE',       columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','CLUSTER_ID','HOST_ID','VERSION','BASE_URL','PORT','CONFIGURATION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'LOG_EVENT',         columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','ENTITY_ID','TOPIC_ID','PROCESS_ID','SCHEMA_ID','ACTION_ID','ATTACHMENT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'LOG_HISTORY',       columns: ['ID','CODE','NAME','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','USER_ID','LISTENER_ID','CONVERSATION_ID','MESSAGE_ID','TEXT','ATTACHMENT_ID','FROM_STATUS_ID','TO_STATUS_ID','OCCURRED_AT','STORED_UNTIL','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'LOG_LISTENER',      columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','EVENT_ID','LOGGER_ID','PATH','VALID_UNTIL','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'LOG_LOGGER',        columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','INFRA_ENTITY_ID','INFRA_ID','FLOW_ENTITY_ID','FLOW_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'MSG_ACKNOWLEDGMENT',columns: ['ID','CODE','NAME_CODE','DESCRIPTION','STATUS_ID','CATEGORY_ID','CONFIRMATION_ID','MESSAGE_ID','ACKNOWLEDGED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'MSG_CONFIRMATION',  columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','TYPE','SCHEMA_ID','DATA_SOURCE_ID','EXPRESSION','ATTACHMENT_ID','VERSION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'MSG_MESSAGE',       columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','PROCESS_ID','SCHEMA_ID','CONVERSATION_ID','PORT_ID','IDEMPOTENCY','HASH','REF_MSG_ID','SENDER_ID','SENDER_CONNECTOR_ID','SENDER_CHANNEL_ID','RECEIVER_ID','RECEIVER_CONNECTOR_ID','RECEIVER_CHANNEL_ID','SENT_AT','PROCESSED_AT','RECEIVED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'MSG_POLICY',        columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','PROCESS_ID','SCHEMA_ID','ACTION_ID','COMMUNITY_ID','ACTOR_ID','PARENT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'MSG_SCHEMA',        columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','PROCESS_ID','VERSION','FORMAT','ATTACHMENT_ID','PAYLOAD_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'NTF_DELIVERY',      columns: ['ID','CODE','NAME','STATUS_ID','CATEGORY_ID','NOTIFICATION_ID','ATTEMPT_NO','SENT_AT','DELIVERED_AT','FAILED_AT','ERROR_MESSAGE','RESPONSE_CODE','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'NTF_METHOD',        columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','CHANNEL_TYPE','CONFIGURATION','IS_DEFAULT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'NTF_NOTIFICATION',  columns: ['ID','CODE','NAME','STATUS_ID','CATEGORY_ID','SUBSCRIPTION_ID','SUBJECT','BODY','PRIORITY','SCHEDULED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'NTF_SUBSCRIPTION',  columns: ['ID','CODE','NAME','STATUS_ID','CATEGORY_ID','USER_ID','CONTACT_ID','LISTENER_ID','CHANNEL_ID','TEMPLATE_ID','VALID_FROM','VALID_UNTIL','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'NTF_TEMPLATE',      columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','CHANNEL_TYPE','SUBJECT_CODE','BODY_CODE','FORMAT','VERSION','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'ORG_ACTOR',         columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','COMMUNITY_ID','ORGANIZATION_ID','PORT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'ORG_COMMUNITY',     columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'ORG_CONTACT',       columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','ORGANIZATION_ID','EMAIL','PHONE','LANDLINE','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','SETTING_ID'] },
  { table: 'ORG_ORGANIZATION',  columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','COMMUNITY_ID','DOMAIN_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','MEDIA_ID'] },
  { table: 'PRC_CONVERSATION',  columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','PROCESS_ID','STAGE_ID','PORT_ID','STARTED_AT','CLOSED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'PRC_MOVE',          columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','CONVERSATION_ID','TRANSITION_ID','MESSAGE_ID','FROM_STATE_ID','TO_STATE_ID','OCCURRED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'PRC_PROCESS',       columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','TOPIC_ID','VERSION','ATTACHMENT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'PRC_STAGE',         columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','CONVERSATION_ID','STATE_ID','MESSAGE_ID','ACTOR_ID','ENTERED_AT','EXITED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'PRC_STATE',         columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','PROCESS_ID','IS_INITIAL','IS_FINAL','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'PRC_TRANSITION',    columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','PROCESS_ID','FROM_STATE_ID','TO_STATE_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'SHR_ACTION',        columns: ['ID','CODE','NAME_CODE','CATEGORY_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','DESCRIPTION_CODE'] },
  { table: 'SHR_LANGUAGE',      columns: ['CODE','NAME_CODE','STATUS_ID','IS_RTL','IS_DEFAULT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','ID'] },
  { table: 'SHR_LOCALIZATION',  columns: ['ID','CODE','LANGUAGE_ID','MODULE_ID','IS_PERSISTENT','STRING_VALUE','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'SHR_PORT',          columns: ['ID','CODE','NAME_CODE','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','SECONDARY_CODE'] },
  { table: 'SHR_STATUS',        columns: ['ID','CODE','NAME_CODE','DESCRIPTION_CODE','CATEGORY_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'SRH_FIELD',         columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','MODULE_ID','ENTITY_ID','PARAMETER_ID','IS_PUBLIC','IS_PERSISTENT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'SRH_FILTER',        columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','QUERY_ID','EXPRESSION','IS_PUBLIC','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'SRH_QUERY',         columns: ['ID','CODE','SECONDARY_CODE','NAME_CODE','DESCRIPTION_CODE','STATUS_ID','CATEGORY_ID','DOMAIN_ID','MODULE_ID','ENTITY_ID','DATA_SOURCE_ID','TYPE','PUBLIC_EXPRESSION','EXECUTION_EXPRESSION','VIEW_NAME','IS_PUBLIC','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'SRH_RESULT',        columns: ['ID','CODE','NAME','DESCRIPTION_CODE','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','QUERY_ID','FILTER_ID','ATTACHMENT_ID','VIEW','COUNT','EXECUTED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'SRH_VALUE',         columns: ['ID','CODE','NAME','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','RESULT_ID','FIELD_ID','STRING_VALUE','NUMBER_VALUE','DATE_VALUE','BOOLEAN_VALUE','GENERIC_VALUE','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'STG_ARCHIVE',       columns: ['ID','CODE','NAME','DESCRIPTION','STATUS_ID','CATEGORY_ID','ENTITY_ID','RECORD_ID','ATTACHMENT_ID','TYPE','RETENTION_POLICY','VALID_UNTIL','ARCHIVED_BY_ID','ARCHIVED_AT','RESTORED_BY_ID','RESTORED_AT','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'STG_ATTACHMENT',    columns: ['ID','CODE','NAME','DESCRIPTION','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','PATH','TYPE','SIZE','HASH','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','VALID_UNTIL'] },
  { table: 'STG_BACKUP',        columns: ['ID','CODE','NAME','DESCRIPTION','STATUS_ID','CATEGORY_ID','TYPE','SCOPE','ATTACHMENT_ID','SIZE','CHECKSUM','STARTED_AT','COMPLETED_AT','VALID_UNTIL','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'STG_MEDIA',         columns: ['ID','CODE','SECONDARY_CODE','NAME','DESCRIPTION','STATUS_ID','CATEGORY_ID','PATH','ICON','THUMB','IMAGE','VIDEO','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','VALID_UNTIL'] },
  { table: 'STG_PAYLOAD',       columns: ['ID','CODE','NAME','DESCRIPTION','SECONDARY_CODE','STATUS_ID','CATEGORY_ID','MESSAGE_ID','STORAGE_TYPE','CONTENT_TYPE','TYPE','SIZE','VALUE','ATTACHMENT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','VALID_UNTIL','XML_VALUE'] },
  { table: 'TKT_COMMENT',       columns: ['ID','CODE','STATUS_ID','TICKET_ID','PARENT_ID','USER_ID','BODY','TYPE','ATTACHMENT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT'] },
  { table: 'TKT_TICKET',        columns: ['ID','CODE','NAME','DESCRIPTION','STATUS_ID','CATEGORY_ID','USER_ID','ORGANIZATION_ID','PRIORITY','ASSIGNED_TO_ID','RESOLVED_AT','ATTACHMENT_ID','CREATED_BY_ID','CREATED_AT','UPDATED_BY_ID','UPDATED_AT','DOMAIN_ID','MODULE_ID','ENTITY_ID','TOPIC_ID','PARENT_ID','TYPE','SOURCE','CLOSED_AT','RESOLUTION','RECOMMENDATION'] },
];

const MODULE_MAP = {
  COR: 'Core',   DTA: 'Data',   FLW: 'Flow',     GRP: 'Group',
  HLP: 'Help',   IAM: 'Identity', IFR: 'Infrastructure', LOG: 'Logging',
  MSG: 'Messaging', NTF: 'Notification', ORG: 'Organization', PRC: 'Process',
  SHR: 'Shared', SRH: 'Search', STG: 'Storage',  TKT: 'Ticket',
};

const DEFAULT_ACTIONS = [
  { suffix: 'VIEW',   action: 'READ'   },
  { suffix: 'CREATE', action: 'WRITE'  },
  { suffix: 'EDIT',   action: 'UPDATE' },
  { suffix: 'DELETE', action: 'DELETE' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function toTitleCase(str) {
  return str.toLowerCase().split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

const log = (msg) => console.log(`  ✅ ${msg}`);

function makeMap(items, key) {
  return Object.fromEntries(items.map(i => [i[key], i]));
}

async function drop(model, label) {
  await model.deleteMany({});
  log(`${label} cleared`);
}

async function insert(model, items, label) {
  const result = await model.insertMany(items, { ordered: false });
  log(`${label}: ${result.length} docs inserted`);
}

async function upsertMeta(collection, lang, data) {
  const { paging, meta_data, labels } = data.result;
  await CollectionMeta.findOneAndUpdate(
    { collection, lang },
    {
      collection, lang,
      paging: {
        page_title:     paging.page_title,
        page_subtitle:  paging.page_subtitle,
        items_per_page: paging.items_per_page,
      },
      fields: meta_data,
      labels: labels || {},
    },
    { upsert: true, new: true }
  );
  log(`meta [${collection}/${lang}] saved`);
}

// ══════════════════════════════════════════════════════════════════════════════
// Builders
// ══════════════════════════════════════════════════════════════════════════════

function buildVessels() {
  const arMap = makeMap(vesselsAr.result.items, 'vessel_id');
  return vesselsEn.result.items.map(en => {
    const ar = arMap[en.vessel_id] || {};
    return {
      vessel_id:         en.vessel_id,
      vessel_name:       en.vessel_name,
      vessel_imo:        en.vessel_imo,
      vessel_call_sign:  en.vessel_call_sign,
      vessel_type:       en.vessel_type,
      vessel_country:    en.vessel_country,
      vessel_agency_code: en.vessel_agency_code,
      vessel_updated_at: en.vessel_updated_at,
      i18n: {
        en: { vessel_category_name: en.vessel_category_name, vessel_status_name: en.vessel_status_name, vessel_status_color: en.vessel_status_color, vessel_agency_name: en.vessel_agency_name },
        ar: { vessel_category_name: ar.vessel_category_name, vessel_status_name: ar.vessel_status_name, vessel_status_color: ar.vessel_status_color, vessel_agency_name: ar.vessel_agency_name },
      },
    };
  });
}

function buildUsers() {
  const arMap = makeMap(usersAr.result.items, 'id');
  return usersEn.result.items.map(en => {
    const ar = arMap[en.id] || {};
    return {
      id:           Number(en.id),
      username:     en.username,
      email:        en.email,
      phone:        en.phone,
      organization: {
        org_id:   en.org_id   ?? null,
        org_code: en.org_code ?? null,
        i18n: {
          en: { org_name: en.org_name ?? null },
          ar: { org_name: ar.org_name ?? null },
        },
      },
      createdAt: en.createdAt ? new Date(en.createdAt) : new Date(),
      updatedAt: en.updatedAt ? new Date(en.updatedAt) : new Date(),
      i18n: {
        en: { name: en.name, role: en.role, status: en.status },
        ar: { name: ar.name, role: ar.role, status: ar.status },
      },
    };
  });
}

function buildRoles() {
  const arMap = makeMap(rolesAr.result.items, 'role_id');
  return rolesEn.result.items.map(en => {
    const ar = arMap[en.role_id] || {};
    return {
      role_id:           en.role_id,
      role_user_count:   en.role_user_count,
      role_perm_count:   en.role_perm_count,
      role_status_color: en.role_status_color,
      role_updated_at:   en.role_updated_at,
      i18n: {
        en: { role_name: en.role_name, role_category: en.role_category, role_community: en.role_community, role_status_name: en.role_status_name },
        ar: { role_name: ar.role_name, role_category: ar.role_category, role_community: ar.role_community, role_status_name: ar.role_status_name },
      },
    };
  });
}

function buildTopics() {
  const arMap = makeMap(topicsAr.result.items, 'code');
  return topicsEn.result.items.map(en => {
    const ar = arMap[en.code] || {};
    return {
      code:            en.code,
      name:            en.name,
      name_ar:         ar.name        || null,
      status:          en.status,
      category:        en.category,
      category_ar:     ar.category    || null,
      domain:          en.domain,
      description:     en.description,
      description_ar:  ar.description || null,
      tags:            en.tags,
      tags_ar:         ar.tags        || null,
    };
  });
}

function buildVisits() {
  const arMap = makeMap(visitsAr.result.items, 'id');
  return visitsEn.result.items.map(en => {
    const ar = arMap[en.id] || {};
    return {
      id:                    Number(en.id),
      internalCode:          en.internalCode,
      externalCode:          en.externalCode,
      routeNumber:           en.routeNumber,
      vesselId:              en.vesselId,
      imoNumber:             en.imoNumber,
      callSign:              en.callSign,
      portId:                en.portId,
      berth:                 en.berth,
      eta: en.eta, ata: en.ata, etd: en.etd, atd: en.atd,
      etaDate: en.etaDate, etaTime: en.etaTime,
      ataDate: en.ataDate, ataTime: en.ataTime,
      etdDate: en.etdDate, etdTime: en.etdTime,
      atdDate: en.atdDate, atdTime: en.atdTime,
      visitNumberForVessel:  en.visitNumberForVessel,
      totalVisitsForVessel:  en.totalVisitsForVessel,
      messagesCount:         en.messagesCount,
      messageFormat:         en.messageFormat,
      lastMessageStatus:     en.lastMessageStatus,
      createdAt:             en.createdAt,
      updatedAt:             en.updatedAt,
      i18n: {
        en: { vesselName: en.vesselName, vesselDisplay: en.vesselDisplay, carrier: en.carrier, nationality: en.nationality, portName: en.portName, status: en.status, agentName: en.agentName },
        ar: { vesselName: ar.vesselName, vesselDisplay: ar.vesselDisplay, carrier: ar.carrier, nationality: ar.nationality, portName: ar.portName, status: ar.status, agentName: ar.agentName },
      },
    };
  });
}

// ── NEW: builds PermissionModule docs with i18n — matches the new model ───────
function buildPermissionsFromSchema() {
  const modulesMap = {};

  for (const { table, columns } of DB_SCHEMA) {
    const prefix     = table.split('_')[0];
    const moduleName = MODULE_MAP[prefix] ?? prefix;
    const entityKey  = table.toLowerCase();
    const entityNameEn = toTitleCase(table.replace(/_/g, ' '));

    // Field permissions — only on READ/VIEW actions
    const fieldPermissions = columns.map(col => ({
      key:    col.toLowerCase(),
      code:   `${table}_FIELD_${col}`,
      i18n:   { en: toTitleCase(col) },   // ← i18n instead of flat name
      status: 'Active',
      access: 'FULL',
    }));

    const permissions = DEFAULT_ACTIONS.map(act => ({
      key:                `${entityKey}_${act.suffix.toLowerCase()}`,
      code:               `${table}_${act.suffix}`,
      i18n:               { en: act.suffix.charAt(0) + act.suffix.slice(1).toLowerCase() }, // ← i18n
      action:             act.action,
      status:             'Active',
      assignedRolesCount: 0,
      assignedRoleIds:    [],
      fieldPermissions:   act.action === 'READ' ? fieldPermissions : [],
    }));

    if (!modulesMap[moduleName]) {
      modulesMap[moduleName] = {
        name:     moduleName,
        i18n:     { en: moduleName },     // ← i18n on module
        entities: [],
      };
    }

    modulesMap[moduleName].entities.push({
      key:                entityKey,
      code:               table,
      i18n:               { en: entityNameEn }, // ← i18n on entity
      status:             'Active',
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

// ══════════════════════════════════════════════════════════════════════════════
// Main
// ══════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('\n🌱 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected\n');

  // ── Clear all collections ─────────────────────────────────────────────────
  await Promise.all([
    drop(Vessel,           'Vessel'),
    drop(User,             'User'),
    drop(Role,             'Role'),
    drop(Process,          'Process'),
    drop(Conversation,     'Conversation'),
    drop(Topic,            'Topic'),
    drop(Visit,            'Visit'),
    drop(CollectionMeta,   'CollectionMeta'),
    drop(PermissionModule, 'PermissionModule'),
  ]);

  // ── Insert data ───────────────────────────────────────────────────────────
  console.log('\n📦 Inserting data…');
  await insert(Vessel,           buildVessels(),                 'Vessels');
  await insert(User,             buildUsers(),                   'Users');
  await insert(Role,             buildRoles(),                   'Roles');
  await insert(Process,          processesEn.result.items,       'Processes');
  await insert(Conversation,     conversationsEn.result.items,   'Conversations');
  await insert(Topic,            buildTopics(),                  'Topics');
  await insert(Visit,            buildVisits(),                  'Visits');
  await insert(PermissionModule, buildPermissionsFromSchema(),   'PermissionModules');

  // ── Save CollectionMeta ───────────────────────────────────────────────────
  console.log('\n🌐 Saving meta_data…');
  await upsertMeta('vessels',            'en', vesselsEn);
  await upsertMeta('vessels',            'ar', vesselsAr);
  await upsertMeta('users',              'en', usersEn);
  await upsertMeta('users',              'ar', usersAr);
  await upsertMeta('roles',              'en', rolesEn);
  await upsertMeta('roles',              'ar', rolesAr);
  await upsertMeta('processes',          'en', processesEn);
  await upsertMeta('processes',          'ar', processesAr);
  await upsertMeta('conversations',      'en', conversationsEn);
  await upsertMeta('conversations',      'ar', conversationsAr);
  await upsertMeta('topics',             'en', topicsEn);
  await upsertMeta('topics',             'ar', topicsAr);
  await upsertMeta('visits',             'en', visitsEn);
  await upsertMeta('visits',             'ar', visitsAr);
  await upsertMeta('permissions',        'en', permissionsEn);
  await upsertMeta('permissions',        'ar', permissionsAr);
  await upsertMeta('permissions_entity', 'en', permissionsEntityEn);
  await upsertMeta('permissions_entity', 'ar', permissionsEntityAr);
  await upsertMeta('permissions_child',  'en', permissionsChildEn);
  await upsertMeta('permissions_child',  'ar', permissionsChildAr);
  await upsertMeta('permissions_field',  'en', permissionsFieldEn);
  await upsertMeta('permissions_field',  'ar', permissionsFieldAr);

  console.log('\n🎉 Seed complete!\n');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});