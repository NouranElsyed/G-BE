const Message = require('../../../models/message.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

const router = createCrudRouter({
  collection: 'messages',
  Model:      Message,
  idField:    'id',
  idType:     'number',
  buildFilter: (req) => {
    const filter = {};
    if (req.query.conversationId) filter.conversationId = Number(req.query.conversationId);
    if (req.query.status)         filter.status         = req.query.status;
    if (req.query.senderId)       filter.senderId       = Number(req.query.senderId);
    if (req.query.receiverId)     filter.receiverId     = Number(req.query.receiverId);
    return filter;
  },
  buildSort: () => ({ sentAt: -1 }),
});

module.exports = router;
