const MsgSchema = require('../../../models/schema.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

const router = createCrudRouter({
  collection: 'schemas',
  Model:      MsgSchema,
  idField:    'id',
  idType:     'number',
});

module.exports = router;
