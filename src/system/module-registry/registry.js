/**
 * Module Registry — Runtime Configuration Engine
 *
 * This is the single source of truth for the entire frontend architecture.
 * The Angular DomainRegistryService calls GET /api/system/modules once at
 * startup and uses the response to build:
 *
 *   - The sidebar navigation tree
 *   - All lazy-loaded routes
 *   - Table configurations per module
 *   - Permission guards
 *   - Feature flags (enabled/disabled)
 *
 * HOW TO ADD A NEW MODULE:
 *   1. Add a module entry inside the correct domain below.
 *   2. Set apiEndpoint to your resource route.
 *   3. Define tableConfig with column overrides if needed.
 *   4. No frontend changes required.
 *
 * HOW TO DISABLE A MODULE AT RUNTIME:
 *   Set enabled: false — the frontend removes it from routing and sidebar.
 *
 * HOW TO DISABLE A DOMAIN AT RUNTIME:
 *   Set enabled: false on the domain — all child modules are hidden.
 */

// ── Feature flag store ────────────────────────────────────────────────────────
// In production this could read from DB / Redis / env vars.
// For now it's an in-memory map that can be patched via the feature-flags route.

const _flags = {
  // domain flags
  'exchange':    true,
  'transport':   true,
  'identity':    true,
  'operations':  true,
  'community':   true,
  'dashboard':   true,

  // module flags — can override domain defaults
  'dashboard.overview':          true,
  'exchange.messages':           true,
  'exchange.conversations':      true,
  'exchange.topics':             true,
  'exchange.schemas':            true,
  'transport.vessels':           true,
  'transport.visits':            true,
  'identity.users':              true,
  'identity.roles':              true,
  'identity.permissions':        true,
  'operations.processes':        true,
  'operations.categories':       true,
  'community.communities':       true,
  'community.organizations':     true,
  'community.contacts':          true,
};

function isEnabled(...keys) {
  return keys.every(k => _flags[k] !== false);
}

function setFlag(key, value) {
  _flags[key] = Boolean(value);
}

function getFlags() {
  return { ..._flags };
}

// ── Registry builder ──────────────────────────────────────────────────────────

/**
 * Builds the full runtime config array for the given language.
 *
 * @param {string} lang - 'en' | 'ar'
 * @returns {object[]}  BackendDomainConfig[]
 */
function buildRegistry(lang) {
  const isAr = lang === 'ar';

  const t = {
    // Domain labels
    dashboard:    isAr ? 'الرئيسية'        : 'Dashboard',
    exchange:     isAr ? 'التبادل'          : 'Exchange',
    transport:    isAr ? 'النقل'            : 'Transport',
    identity:     isAr ? 'الهوية والصلاحيات': 'Identity & Access',
    operations:   isAr ? 'العمليات'         : 'Operations',
    community:    isAr ? 'المجتمع'          : 'Community',

    // Module labels
    overview:      isAr ? 'لوحة التحكم'    : 'Overview',
    messages:      isAr ? 'الرسائل'         : 'Messages',
    conversations: isAr ? 'المحادثات'       : 'Conversations',
    topics:        isAr ? 'الموضوعات'       : 'Topics',
    schemas:       isAr ? 'المخططات'        : 'Schemas',
    vessels:       isAr ? 'السفن'           : 'Vessels',
    visits:        isAr ? 'الزيارات'        : 'Visits',
    users:         isAr ? 'المستخدمون'      : 'Users',
    roles:         isAr ? 'الأدوار'         : 'Roles',
    permissions:   isAr ? 'الصلاحيات'       : 'Permissions',
    processes:     isAr ? 'العمليات'        : 'Processes',
    categories:    isAr ? 'الفئات'          : 'Categories',
    communities:   isAr ? 'المجتمعات'       : 'Communities',
    organizations: isAr ? 'المنظمات'        : 'Organizations',
    contacts:      isAr ? 'جهات الاتصال'   : 'Contacts',
  };

  return [

    // ── Dashboard ─────────────────────────────────────────────────────────────
    {
      id:      'dashboard',
      label:   t.dashboard,
      enabled: isEnabled('dashboard'),
      modules: [
        {
          domainId:    'dashboard',
          moduleId:    'overview',
          label:       t.overview,
          icon:        'pi pi-fw pi-home',
          routePath:   'dashboard',
          apiEndpoint: '/api/dashboard',
          enabled:     isEnabled('dashboard', 'dashboard.overview'),
          preload:     true,
          permissions: [],
          subModules:  [],
          tableConfig: {
            idField: 'key',
            actions: { create: false, edit: false, view: false, delete: false },
            extraRowActions: [],
          },
        },
      ],
    },

    // ── Exchange ──────────────────────────────────────────────────────────────
    {
      id:      'exchange',
      label:   t.exchange,
      enabled: isEnabled('exchange'),
      modules: [

        {
          domainId:    'exchange',
          moduleId:    'messages',
          label:       t.messages,
          icon:        'pi pi-fw pi-envelope',
          routePath:   'messages',
          apiEndpoint: '/api/messages',
          enabled:     isEnabled('exchange', 'exchange.messages'),
          preload:     false,
          permissions: ['messages.view'],
          subModules: [
            {
              id:          'messages-list',
              label:       t.messages,
              icon:        'pi pi-fw pi-envelope',
              routerLink:  ['/messages'],
              enabled:     isEnabled('exchange.messages'),
              permissions: ['messages.view'],
            },
          ],
          tableConfig: {
            idField: 'id',
            columnTypeMap: { sentAt: 'DATE', status: 'STATUS' },
            excludedKeys: [],
            actions: { create: true, edit: true, view: true, delete: false },
            extraRowActions: [],
          },
        },

        {
          domainId:    'exchange',
          moduleId:    'conversations',
          label:       t.conversations,
          icon:        'pi pi-fw pi-comments',
          routePath:   'conversations',
          apiEndpoint: '/api/conversations',
          enabled:     isEnabled('exchange', 'exchange.conversations'),
          preload:     false,
          permissions: ['conversations.view'],
          subModules: [
            {
              id:          'conversations-list',
              label:       t.conversations,
              icon:        'pi pi-fw pi-comments',
              routerLink:  ['/conversations'],
              enabled:     isEnabled('exchange.conversations'),
              permissions: ['conversations.view'],
            },
          ],
          tableConfig: {
            idField: 'ID',
            columnTypeMap: { CREATED_AT: 'DATE', UPDATED_AT: 'DATE', STATUS: 'STATUS' },
            excludedKeys: [],
            actions: { create: true, edit: true, view: true, delete: false },
            extraRowActions: [],
          },
        },

        {
          domainId:    'exchange',
          moduleId:    'topics',
          label:       t.topics,
          icon:        'pi pi-fw pi-tag',
          routePath:   'topics',
          apiEndpoint: '/api/topics',
          enabled:     isEnabled('exchange', 'exchange.topics'),
          preload:     false,
          permissions: ['topics.view'],
          subModules: [
            {
              id:          'topics-list',
              label:       t.topics,
              icon:        'pi pi-fw pi-tag',
              routerLink:  ['/topics'],
              enabled:     isEnabled('exchange.topics'),
              permissions: ['topics.view'],
            },
          ],
          tableConfig: {
            idField: 'code',
            columnTypeMap: {},
            excludedKeys: [],
            actions: { create: true, edit: true, view: true, delete: true },
            extraRowActions: [],
          },
        },

        {
          domainId:    'exchange',
          moduleId:    'schemas',
          label:       t.schemas,
          icon:        'pi pi-fw pi-database',
          routePath:   'schemas',
          apiEndpoint: '/api/schemas',
          enabled:     isEnabled('exchange', 'exchange.schemas'),
          preload:     false,
          permissions: ['schemas.view'],
          subModules: [
            {
              id:          'schemas-list',
              label:       t.schemas,
              icon:        'pi pi-fw pi-database',
              routerLink:  ['/schemas'],
              enabled:     isEnabled('exchange.schemas'),
              permissions: ['schemas.view'],
            },
          ],
          tableConfig: {
            idField: 'id',
            columnTypeMap: { created_at: 'DATE', updated_at: 'DATE' },
            excludedKeys: [],
            actions: { create: true, edit: true, view: true, delete: true },
            extraRowActions: [],
          },
        },

      ],
    },

    // ── Transport ─────────────────────────────────────────────────────────────
    {
      id:      'transport',
      label:   t.transport,
      enabled: isEnabled('transport'),
      modules: [

        {
          domainId:    'transport',
          moduleId:    'vessels',
          label:       t.vessels,
          icon:        'pi pi-fw pi-send',
          routePath:   'vessels',
          apiEndpoint: '/api/vessels',
          enabled:     isEnabled('transport', 'transport.vessels'),
          preload:     false,
          permissions: ['vessels.view'],
          subModules: [
            {
              id:          'vessels-list',
              label:       t.vessels,
              icon:        'pi pi-fw pi-send',
              routerLink:  ['/vessels'],
              enabled:     isEnabled('transport.vessels'),
              permissions: ['vessels.view'],
            },
          ],
          tableConfig: {
            idField: 'vessel_id',
            columnTypeMap: { vessel_updated_at: 'DATE' },
            excludedKeys: ['vessel_status_color'],
            actions: { create: true, edit: true, view: true, delete: false },
            extraRowActions: [
              {
                labelKey:    'actions.viewVisits',
                icon:        'pi pi-calendar',
                navigateTo:  '/visits',
                queryParams: { vesselId: 'vessel_id' },
              },
            ],
          },
        },

        {
          domainId:    'transport',
          moduleId:    'visits',
          label:       t.visits,
          icon:        'pi pi-fw pi-calendar',
          routePath:   'visits',
          apiEndpoint: '/api/visits',
          enabled:     isEnabled('transport', 'transport.visits'),
          preload:     false,
          permissions: ['visits.view'],
          subModules: [
            {
              id:          'visits-list',
              label:       t.visits,
              icon:        'pi pi-fw pi-calendar',
              routerLink:  ['/visits'],
              enabled:     isEnabled('transport.visits'),
              permissions: ['visits.view'],
            },
          ],
          tableConfig: {
            idField: 'id',
            columnTypeMap: {
              eta: 'DATE', ata: 'DATE', etd: 'DATE', atd: 'DATE',
              createdAt: 'DATE', updatedAt: 'DATE',
              status: 'STATUS',
            },
            excludedKeys: ['etaDate','etaTime','ataDate','ataTime','etdDate','etdTime','atdDate','atdTime'],
            actions: { create: true, edit: true, view: true, delete: false },
            extraRowActions: [],
          },
        },

      ],
    },

    // ── Identity & Access ─────────────────────────────────────────────────────
    {
      id:      'identity',
      label:   t.identity,
      enabled: isEnabled('identity'),
      modules: [

        {
          domainId:    'identity',
          moduleId:    'users',
          label:       t.users,
          icon:        'pi pi-fw pi-users',
          routePath:   'users',
          apiEndpoint: '/api/users',
          enabled:     isEnabled('identity', 'identity.users'),
          preload:     false,
          permissions: ['users.view'],
          subModules: [
            {
              id:          'users-list',
              label:       t.users,
              icon:        'pi pi-fw pi-users',
              routerLink:  ['/users'],
              enabled:     isEnabled('identity.users'),
              permissions: ['users.view'],
            },
          ],
          tableConfig: {
            idField: 'id',
            columnTypeMap: { createdAt: 'DATE', updatedAt: 'DATE', status: 'STATUS' },
            excludedKeys: [],
            actions: { create: true, edit: true, view: true, delete: true },
            extraRowActions: [],
          },
        },

        {
          domainId:    'identity',
          moduleId:    'roles',
          label:       t.roles,
          icon:        'pi pi-fw pi-shield',
          routePath:   'roles',
          apiEndpoint: '/api/roles',
          enabled:     isEnabled('identity', 'identity.roles'),
          preload:     false,
          permissions: ['roles.view'],
          subModules: [
            {
              id:          'roles-list',
              label:       t.roles,
              icon:        'pi pi-fw pi-shield',
              routerLink:  ['/roles'],
              enabled:     isEnabled('identity.roles'),
              permissions: ['roles.view'],
            },
          ],
          tableConfig: {
            idField: 'role_id',
            columnTypeMap: { role_updated_at: 'DATE', role_status_color: 'STATUS' },
            excludedKeys: [],
            actions: { create: true, edit: true, view: true, delete: true },
            extraRowActions: [],
          },
        },

        {
          domainId:    'identity',
          moduleId:    'permissions',
          label:       t.permissions,
          icon:        'pi pi-fw pi-lock',
          routePath:   'permissions',
          apiEndpoint: '/api/permissions',
          enabled:     isEnabled('identity', 'identity.permissions'),
          preload:     false,
          permissions: ['permissions.view'],
          subModules: [
            {
              id:          'permissions-tree',
              label:       t.permissions,
              icon:        'pi pi-fw pi-lock',
              routerLink:  ['/permissions'],
              enabled:     isEnabled('identity.permissions'),
              permissions: ['permissions.view'],
            },
          ],
          tableConfig: null, // Permissions use a custom tree UI, not the generic table
        },

      ],
    },

    // ── Operations ────────────────────────────────────────────────────────────
    {
      id:      'operations',
      label:   t.operations,
      enabled: isEnabled('operations'),
      modules: [

        {
          domainId:    'operations',
          moduleId:    'processes',
          label:       t.processes,
          icon:        'pi pi-fw pi-cog',
          routePath:   'processes',
          apiEndpoint: '/api/processes',
          enabled:     isEnabled('operations', 'operations.processes'),
          preload:     false,
          permissions: ['processes.view'],
          subModules: [
            {
              id:          'processes-list',
              label:       t.processes,
              icon:        'pi pi-fw pi-cog',
              routerLink:  ['/processes'],
              enabled:     isEnabled('operations.processes'),
              permissions: ['processes.view'],
            },
          ],
          tableConfig: {
            idField: 'code',
            columnTypeMap: { createdAt: 'DATE', updatedAt: 'DATE' },
            excludedKeys: [],
            actions: { create: true, edit: true, view: true, delete: true },
            extraRowActions: [],
          },
        },

        {
          domainId:    'operations',
          moduleId:    'categories',
          label:       t.categories,
          icon:        'pi pi-fw pi-list',
          routePath:   'categories',
          apiEndpoint: '/api/categories',
          enabled:     isEnabled('operations', 'operations.categories'),
          preload:     false,
          permissions: ['categories.view'],
          subModules: [
            {
              id:          'categories-list',
              label:       t.categories,
              icon:        'pi pi-fw pi-list',
              routerLink:  ['/categories'],
              enabled:     isEnabled('operations.categories'),
              permissions: ['categories.view'],
            },
          ],
          tableConfig: {
            idField: 'module_code',
            columnTypeMap: {},
            excludedKeys: [],
            actions: { create: true, edit: true, view: false, delete: true },
            extraRowActions: [],
          },
        },

      ],
    },

    // ── Community ─────────────────────────────────────────────────────────────
    {
      id:      'community',
      label:   t.community,
      enabled: isEnabled('community'),
      modules: [

        {
          domainId:    'community',
          moduleId:    'communities',
          label:       t.communities,
          icon:        'pi pi-fw pi-globe',
          routePath:   'communities',
          apiEndpoint: '/api/communities',
          enabled:     isEnabled('community', 'community.communities'),
          preload:     false,
          permissions: ['communities.view'],
          subModules: [
            {
              id:          'communities-list',
              label:       t.communities,
              icon:        'pi pi-fw pi-globe',
              routerLink:  ['/communities'],
              enabled:     isEnabled('community.communities'),
              permissions: ['communities.view'],
            },
          ],
          tableConfig: {
            idField: 'ID',
            columnTypeMap: { CREATED_AT: 'DATE', UPDATED_AT: 'DATE' },
            excludedKeys: [],
            actions: { create: true, edit: true, view: true, delete: true },
            extraRowActions: [],
          },
        },

        {
          domainId:    'community',
          moduleId:    'organizations',
          label:       t.organizations,
          icon:        'pi pi-fw pi-building',
          routePath:   'organizations',
          apiEndpoint: '/api/organizations',
          enabled:     isEnabled('community', 'community.organizations'),
          preload:     false,
          permissions: ['organizations.view'],
          subModules: [
            {
              id:          'organizations-list',
              label:       t.organizations,
              icon:        'pi pi-fw pi-building',
              routerLink:  ['/organizations'],
              enabled:     isEnabled('community.organizations'),
              permissions: ['organizations.view'],
            },
          ],
          tableConfig: {
            idField: 'id',
            columnTypeMap: { created_at: 'DATE', updated_at: 'DATE', status_name: 'STATUS' },
            excludedKeys: ['status_color'],
            actions: { create: true, edit: true, view: true, delete: false },
            extraRowActions: [],
          },
        },

        {
          domainId:    'community',
          moduleId:    'contacts',
          label:       t.contacts,
          icon:        'pi pi-fw pi-address-book',
          routePath:   'contacts',
          apiEndpoint: '/api/contacts',
          enabled:     isEnabled('community', 'community.contacts'),
          preload:     false,
          permissions: ['contacts.view'],
          subModules: [
            {
              id:          'contacts-list',
              label:       t.contacts,
              icon:        'pi pi-fw pi-address-book',
              routerLink:  ['/contacts'],
              enabled:     isEnabled('community.contacts'),
              permissions: ['contacts.view'],
            },
          ],
          tableConfig: {
            idField: 'id',
            columnTypeMap: { createdAt: 'DATE', updatedAt: 'DATE' },
            excludedKeys: [],
            actions: { create: true, edit: true, view: true, delete: true },
            extraRowActions: [],
          },
        },

      ],
    },

  ];
}

module.exports = { buildRegistry, setFlag, getFlags, isEnabled };
