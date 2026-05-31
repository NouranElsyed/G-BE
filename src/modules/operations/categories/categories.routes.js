const Category = require('../../../models/category.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

const router = createCrudRouter({
  collection: 'categories',
  Model:      Category,
  idField:    'module_code',
  idType:     'string',
  flatten: (doc) => {
    const { _id, __v, ...rest } = doc;
    return rest;
  },
});

module.exports = router;
