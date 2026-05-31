const express  = require('express');
const router   = express.Router();

// Models — only import what's available; each count is independent
const Vessel       = require('../models/vessel.model');
const Visit        = require('../models/visit.model');
const User         = require('../models/user.model');
const Role         = require('../models/role.model');
const Organization = require('../models/organization.model');
const Community    = require('../models/community.model');
const Contact      = require('../models/contact.model');
const Conversation = require('../models/conversation.model');

/**
 * GET /api/dashboard
 *
 * Returns summary statistics used by the Angular dashboard page.
 * Each stat card has:
 *   - key:    machine-readable identifier
 *   - label:  localised display name
 *   - value:  live count from MongoDB
 *   - icon:   PrimeIcons class
 *   - route:  deep-link for the "view all" button
 *   - color:  CSS variable name (maps to a PrimeFlex / theme colour)
 */
router.get('/', async (req, res, next) => {
  try {
    const lang = req.lang || 'en';

    // Run all counts in parallel — if any model's collection is empty
    // countDocuments() returns 0; it never throws on an empty collection.
    const [
      vesselCount,
      visitCount,
      userCount,
      roleCount,
      orgCount,
      communityCount,
      contactCount,
      conversationCount,
    ] = await Promise.all([
      Vessel.countDocuments(),
      Visit.countDocuments(),
      User.countDocuments(),
      Role.countDocuments(),
      Organization.countDocuments(),
      Community.countDocuments(),
      Contact.countDocuments(),
      Conversation.countDocuments(),
    ]);

    const labels = {
      en: {
        vessels:       'Vessels',
        visits:        'Port Visits',
        users:         'Users',
        roles:         'Roles',
        organizations: 'Organizations',
        communities:   'Communities',
        contacts:      'Contacts',
        conversations: 'Conversations',
      },
      ar: {
        vessels:       'السفن',
        visits:        'الزيارات',
        users:         'المستخدمون',
        roles:         'الأدوار',
        organizations: 'المنظمات',
        communities:   'المجتمعات',
        contacts:      'جهات الاتصال',
        conversations: 'المحادثات',
      },
    };

    const t = labels[lang] || labels.en;

    const items = [
      { key: 'vessels',       label: t.vessels,       value: vesselCount,       icon: 'pi pi-send',         route: '/vessels/vessels',           color: 'blue' },
      { key: 'visits',        label: t.visits,         value: visitCount,        icon: 'pi pi-calendar',     route: '/vessels/visits',            color: 'teal' },
      { key: 'users',         label: t.users,          value: userCount,         icon: 'pi pi-users',        route: '/auth-mgmt/users',           color: 'indigo' },
      { key: 'roles',         label: t.roles,          value: roleCount,         icon: 'pi pi-shield',       route: '/auth-mgmt/roles',           color: 'purple' },
      { key: 'organizations', label: t.organizations,  value: orgCount,          icon: 'pi pi-building',     route: '/org/organizations',         color: 'orange' },
      { key: 'communities',   label: t.communities,    value: communityCount,    icon: 'pi pi-globe',        route: '/org/communities',           color: 'cyan' },
      { key: 'contacts',      label: t.contacts,       value: contactCount,      icon: 'pi pi-address-book', route: '/org/contacts',              color: 'pink' },
      { key: 'conversations', label: t.conversations,  value: conversationCount, icon: 'pi pi-comments',     route: '/prc/conversations',         color: 'green' },
    ];

    const meta_data = [
      { secondary_code: 'key',   name: 'Key',   type: 'STRING', is_public: -1, order: 0, icon: null, enum: null, lookup: null },
      { secondary_code: 'label', name: 'Label', type: 'STRING', is_public: 1,  order: 1, icon: null, enum: null, lookup: null },
      { secondary_code: 'value', name: 'Value', type: 'NUMBER', is_public: 1,  order: 2, icon: null, enum: null, lookup: null },
      { secondary_code: 'icon',  name: 'Icon',  type: 'STRING', is_public: -1, order: 3, icon: null, enum: null, lookup: null },
      { secondary_code: 'route', name: 'Route', type: 'STRING', is_public: -1, order: 4, icon: null, enum: null, lookup: null },
      { secondary_code: 'color', name: 'Color', type: 'STRING', is_public: -1, order: 5, icon: null, enum: null, lookup: null },
    ];

    res.json({
      success: 1,
      message: { type: 'string', texts: [] },
      result: {
        items,
        meta_data,
        paging: {
          page_title:     lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
          page_subtitle:  null,
          total_items:    items.length,
          start_item:     1,
          end_item:       items.length,
          items_per_page: items.length,
          total_pages:    1,
          current_page:   1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
