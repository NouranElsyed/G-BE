const Visit = require('../../../models/visit.model');
const { createCrudRouter } = require('../../../shared/utils/crud.factory');

function flattenVisit(doc, lang) {
  return {
    id:                   doc.id,
    internalCode:         doc.internalCode,
    externalCode:         doc.externalCode,
    routeNumber:          doc.routeNumber,
    vesselId:             doc.vesselId,
    imoNumber:            doc.imoNumber,
    callSign:             doc.callSign,
    portId:               doc.portId,
    berth:                doc.berth,
    eta:                  doc.eta,
    ata:                  doc.ata,
    etd:                  doc.etd,
    atd:                  doc.atd,
    etaDate:              doc.etaDate,
    etaTime:              doc.etaTime,
    ataDate:              doc.ataDate,
    ataTime:              doc.ataTime,
    etdDate:              doc.etdDate,
    etdTime:              doc.etdTime,
    atdDate:              doc.atdDate,
    atdTime:              doc.atdTime,
    visitNumberForVessel: doc.visitNumberForVessel,
    totalVisitsForVessel: doc.totalVisitsForVessel,
    messagesCount:        doc.messagesCount,
    messageFormat:        doc.messageFormat,
    lastMessageStatus:    doc.lastMessageStatus,
    createdAt:            doc.createdAt,
    updatedAt:            doc.updatedAt,
    ...doc.i18n?.[lang],
  };
}

const router = createCrudRouter({
  collection: 'visits',
  Model:      Visit,
  idField:    'id',
  idType:     'number',
  flatten:    flattenVisit,
  buildFilter: (req) => {
    const filter = {};
    if (req.query.vesselId) filter.vesselId = req.query.vesselId;
    return filter;
  },
});

module.exports = router;
