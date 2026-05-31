const Conversation = require('../../../models/conversation.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

function stripMongoose(doc) {
  const { _id, __v, ...rest } = doc;
  return rest;
}

const router = createCrudRouter({
  collection: 'conversations',
  Model:      Conversation,
  idField:    'ID',
  idType:     'number',
  flatten:    (doc) => stripMongoose(doc),
});

module.exports = router;
