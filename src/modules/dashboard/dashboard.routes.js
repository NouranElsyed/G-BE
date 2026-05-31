/**
 * Dashboard Route
 *
 * Returns summary statistics for the Angular dashboard page.
 * Follows the same { paging, meta_data, items } envelope as every
 * other list endpoint so the frontend rendering engine works uniformly.
 */

const express      = require('express');
const router       = express.Router();
const Vessel       = require('../../models/vessel.model');
const Visit        = require('../../models/visit.model');
const User         = require('../../models/user.model');
const Role         = require('../../modules/identity/roles/role.model');
const Organization = require('../../models/organization.model');
const Community    = require('../../models/community.model');
const Contact      = require('../../models/contact.model');
const Conversation = require('../../models/conversation.model');
const { ok }       = require('../../shared/response/response.builder');
const { hiddenField, stringField, numberField } = require('../../shared/utils/metadata.builder');

router.get('/', async (req, res, next) => {
  try {
    const lang  = req.lang || 'en';
    const isAr  = lang === 'ar';

    const [
      vesselCount, visitCount, userCount, roleCount,
      orgCount, communityCount, contactCount, conversationCount,
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

    const t = {
      vessels:       isAr ? 'السفن'          : 'Vessels',
      visits:        isAr ? 'الزيارات'        : 'Port Visits',
      users:         isAr ? 'المستخدمون'      : 'Users',
      roles:         isAr ? 'الأدوار'         : 'Roles',
      organizations: isAr ? 'المنظمات'        : 'Organizations',
      communities:   isAr ? 'المجتمعات'       : 'Communities',
      contacts:      isAr ? 'جهات الاتصال'   : 'Contacts',
      conversations: isAr ? 'المحادثات'       : 'Conversations',
    };

    const items = [
      { key: 'vessels',       label: t.vessels,       value: vesselCount,       icon: 'pi pi-send',         route: '/vessels',       color: 'blue'   },
      { key: 'visits',        label: t.visits,         value: visitCount,        icon: 'pi pi-calendar',     route: '/visits',        color: 'teal'   },
      { key: 'users',         label: t.users,          value: userCount,         icon: 'pi pi-users',        route: '/users',         color: 'indigo' },
      { key: 'roles',         label: t.roles,          value: roleCount,         icon: 'pi pi-shield',       route: '/roles',         color: 'purple' },
      { key: 'organizations', label: t.organizations,  value: orgCount,          icon: 'pi pi-building',     route: '/organizations', color: 'orange' },
      { key: 'communities',   label: t.communities,    value: communityCount,    icon: 'pi pi-globe',        route: '/communities',   color: 'cyan'   },
      { key: 'contacts',      label: t.contacts,       value: contactCount,      icon: 'pi pi-address-book', route: '/contacts',      color: 'pink'   },
      { key: 'conversations', label: t.conversations,  value: conversationCount, icon: 'pi pi-comments',     route: '/conversations', color: 'green'  },
    ];

    const meta_data = [
      hiddenField('key',   'Key',   { order: 0 }),
      stringField('label', 'Label', { order: 1 }),
      numberField('value', 'Value', { order: 2 }),
      hiddenField('icon',  'Icon',  { order: 3 }),
      hiddenField('route', 'Route', { order: 4 }),
      hiddenField('color', 'Color', { order: 5 }),
    ];

    ok(res, {
      paging: {
        page_title:     isAr ? 'لوحة التحكم' : 'Dashboard',
        page_subtitle:  null,
        total_items:    items.length,
        start_item:     1,
        end_item:       items.length,
        items_per_page: items.length,
        total_pages:    1,
        current_page:   1,
      },
      meta_data,
      items,
    });
  } catch (err) { next(err); }
});

module.exports = router;
