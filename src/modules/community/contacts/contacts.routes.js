const Contact = require('../../../models/contact.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

const router = createCrudRouter({
  collection: 'contacts',
  Model:      Contact,
  idField:    'id',
  idType:     'number',
});

module.exports = router;
