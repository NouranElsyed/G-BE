const express = require('express');
const router  = express.Router();

/**
 * GET /api/system/modules
 *
 * Returns the list of application modules that the Angular DomainRegistry
 * uses to build the navigation menu and lazy-load routes.
 *
 * Each entry maps a route key to its display label and icon so the
 * frontend can render the sidebar / toolbar dynamically without
 * hard-coding module names.
 *
 * This endpoint is language-aware via req.lang (set by langMiddleware).
 */
router.get('/modules', (req, res) => {
  const lang = req.lang || 'en';

  const labels = {
    en: {
      dashboard:     'Dashboard',
      vessels:       'Vessels',
      visits:        'Visits',
      users:         'Users',
      roles:         'Roles',
      permissions:   'Permissions',
      processes:     'Processes',
      conversations: 'Conversations',
      topics:        'Topics',
      communities:   'Communities',
      organizations: 'Organizations',
      contacts:      'Contacts',
      categories:    'Categories',
      schemas:       'Schemas',
      messages:      'Messages',
    },
    ar: {
      dashboard:     'لوحة التحكم',
      vessels:       'السفن',
      visits:        'الزيارات',
      users:         'المستخدمون',
      roles:         'الأدوار',
      permissions:   'الصلاحيات',
      processes:     'العمليات',
      conversations: 'المحادثات',
      topics:        'الموضوعات',
      communities:   'المجتمعات',
      organizations: 'المنظمات',
      contacts:      'جهات الاتصال',
      categories:    'الفئات',
      schemas:       'المخططات',
      messages:      'الرسائل',
    },
  };

  const t = labels[lang] || labels.en;

  const modules = [
    { key: 'dashboard',     label: t.dashboard,     icon: 'pi pi-home',          route: '/dashboard',     order: 0 },
    { key: 'vessels',       label: t.vessels,        icon: 'pi pi-send',          route: '/vessels',       order: 1 },
    { key: 'visits',        label: t.visits,         icon: 'pi pi-calendar',      route: '/visits',        order: 2 },
    { key: 'users',         label: t.users,          icon: 'pi pi-users',         route: '/users',         order: 3 },
    { key: 'roles',         label: t.roles,          icon: 'pi pi-shield',        route: '/roles',         order: 4 },
    { key: 'permissions',   label: t.permissions,    icon: 'pi pi-lock',          route: '/permissions',   order: 5 },
    { key: 'processes',     label: t.processes,      icon: 'pi pi-cog',           route: '/processes',     order: 6 },
    { key: 'conversations', label: t.conversations,  icon: 'pi pi-comments',      route: '/conversations', order: 7 },
    { key: 'topics',        label: t.topics,         icon: 'pi pi-tag',           route: '/topics',        order: 8 },
    { key: 'communities',   label: t.communities,    icon: 'pi pi-globe',         route: '/communities',   order: 9 },
    { key: 'organizations', label: t.organizations,  icon: 'pi pi-building',      route: '/organizations', order: 10 },
    { key: 'contacts',      label: t.contacts,       icon: 'pi pi-address-book',  route: '/contacts',      order: 11 },
    { key: 'categories',    label: t.categories,     icon: 'pi pi-list',          route: '/categories',    order: 12 },
    { key: 'schemas',       label: t.schemas,        icon: 'pi pi-database',      route: '/schemas',       order: 13 },
    { key: 'messages',      label: t.messages,       icon: 'pi pi-envelope',      route: '/messages',      order: 14 },
  ];

  // DomainRegistryService expects result to be an array of BackendDomainConfig[]
  // We map the flat modules list into a single domain group as a fallback shape.
  // The frontend staticFallback() handles any parsing error gracefully.
  const domainResult = [
    {
      id:      'backend',
      label:   lang === 'ar' ? 'القائمة' : 'Navigation',
      enabled: true,
      modules: modules.map(m => ({
        domainId:    'backend',
        moduleId:    m.key,
        label:       m.label,
        icon:        m.icon,
        routePath:   m.route.replace('/', ''),
        apiEndpoint: `/api/${m.key}`,
        enabled:     true,
        preload:     m.key === 'dashboard',
        permissions: [],
        subModules:  [],
      })),
    },
  ];

  res.json({
    success: 1,
    message: { type: 'string', texts: [] },
    result: domainResult,
  });
});

module.exports = router;
