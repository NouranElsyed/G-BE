const Vessel = require('../../../models/vessel.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

function flattenVessel(doc, lang) {
  return {
    vessel_id:           doc.vessel_id,
    vessel_name:         doc.vessel_name,
    vessel_imo:          doc.vessel_imo,
    vessel_call_sign:    doc.vessel_call_sign,
    vessel_type:         doc.vessel_type,
    vessel_country:      doc.vessel_country,
    vessel_agency_code:  doc.vessel_agency_code,
    vessel_updated_at:   doc.vessel_updated_at,
    ...doc.i18n?.[lang],
  };
}

const router = createCrudRouter({
  collection: 'vessels',
  Model:      Vessel,
  idField:    'vessel_id',
  idType:     'number',
  flatten:    flattenVessel,
});

module.exports = router;
