const Community = require('../../../models/community.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

function flattenCommunity(doc) {
  return {
    id:           doc.ID,
    code:         doc.CODE,
    name:         doc.NAME,
    description:  doc.DESCRIPTION,
    status_id:    doc.STATUS_ID,
    status_code:  doc.STATUS_CODE,
    status_name:  doc.STATUS_NAME,
    status_color: doc.STATUS_COLOR,
    category_id:  doc.CATEGORY_ID,
    category_code:doc.CATEGORY_CODE,
    category_name:doc.CATEGORY_NAME,
    domain_id:    doc.DOMAIN_ID,
    domain_code:  doc.DOMAIN_CODE,
    domain_name:  doc.DOMAIN_NAME,
    media_icon:   doc.MEDIA_ICON,
    media_image:  doc.MEDIA_IMAGE,
    created_by:   doc.CREATED_BY,
    created_at:   doc.CREATED_AT,
    updated_by:   doc.UPDATED_BY,
    updated_at:   doc.UPDATED_AT,
  };
}

const router = createCrudRouter({
  collection: 'communities',
  Model:      Community,
  idField:    'ID',
  idType:     'number',
  flatten:    flattenCommunity,
});

module.exports = router;
