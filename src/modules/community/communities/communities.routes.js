const Community = require('../../../models/community.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

const router = createCrudRouter({
  collection: 'communities',
  Model:      Community,
  idField:    'ID',
  idType:     'number',
});

module.exports = router;
