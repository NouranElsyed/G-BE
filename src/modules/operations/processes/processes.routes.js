const Process = require('../../../models/process.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

const router = createCrudRouter({
  collection: 'processes',
  Model:      Process,
  idField:    'code',
  idType:     'string',
  flatten: (doc) => ({
    code:            doc.code,
    secondaryCode:   doc.secondaryCode,
    nameCode:        doc.nameCode,
    descriptionCode: doc.descriptionCode,
    attachmentId:    doc.attachmentId,
    createdById:     doc.createdById,
    updatedById:     doc.updatedById,
    createdAt:       doc.createdAt,
    updatedAt:       doc.updatedAt,
  }),
});

module.exports = router;
