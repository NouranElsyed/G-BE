const Topic = require('../../../models/topic.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

function flattenTopic(doc, lang) {
  const isAr = lang === 'ar';
  return {
    code:        doc.code,
    name:        isAr ? doc.name_ar        || doc.name        : doc.name,
    status:      doc.status,
    category:    isAr ? doc.category_ar    || doc.category    : doc.category,
    domain:      doc.domain,
    description: isAr ? doc.description_ar || doc.description : doc.description,
    tags:        isAr ? doc.tags_ar        || doc.tags        : doc.tags,
  };
}

const router = createCrudRouter({
  collection:  'topics',
  Model:       Topic,
  idField:     'code',
  idType:      'string',
  normalizeId: (raw) => String(raw).toUpperCase(),
  flatten:     flattenTopic,
});

module.exports = router;
