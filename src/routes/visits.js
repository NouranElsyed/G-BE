const express        = require('express');
const router         = express.Router();
const Visit          = require('../models/visit.model');
const CollectionMeta = require('../models/collectionMeta.model');
const { buildResponse } = require('../shared/utils/buildResponse');

// ── Flatten a Visit doc for a given lang ───────────────────────────
function flattenVisit(v, lang) {
  return {
    id:                   v.id,
    internalCode:         v.internalCode,
    externalCode:         v.externalCode,
    routeNumber:          v.routeNumber,
    vesselId:             v.vesselId,
    imoNumber:            v.imoNumber,
    callSign:             v.callSign,
    portId:               v.portId,
    berth:                v.berth,
    eta:                  v.eta,
    ata:                  v.ata,
    etd:                  v.etd,
    atd:                  v.atd,
    etaDate:              v.etaDate,
    etaTime:              v.etaTime,
    ataDate:              v.ataDate,
    ataTime:              v.ataTime,
    etdDate:              v.etdDate,
    etdTime:              v.etdTime,
    atdDate:              v.atdDate,
    atdTime:              v.atdTime,
    visitNumberForVessel: v.visitNumberForVessel,
    totalVisitsForVessel: v.totalVisitsForVessel,
    messagesCount:        v.messagesCount,
    messageFormat:        v.messageFormat,
    lastMessageStatus:    v.lastMessageStatus,
    createdAt:            v.createdAt,
    updatedAt:            v.updatedAt,
    ...v.i18n?.[lang],   // vesselName, vesselDisplay, carrier, nationality, portName, status, agentName
  };
}

// ── GET /api/visits  (?vesselId=VES-001) ──────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const lang     = req.lang;
    const filter   = {};
    if (req.query.vesselId) filter.vesselId = req.query.vesselId;

    const [meta, visits] = await Promise.all([
      CollectionMeta.findOne({ collection: 'visits', lang }).lean(),
      Visit.find(filter).lean(),
    ]);

    if (!meta) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Meta not found'] }, result: null });

    const items = visits.map(v => flattenVisit(v, lang));
    res.json(buildResponse(meta, items));
  } catch (err) { next(err); }
});

// ── GET /api/visits/:id ────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const lang  = req.lang;
    const visit = await Visit.findOne({ id: Number(req.params.id) }).lean();
    if (!visit) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Not found'] }, result: null });
    res.json({ success: 1, message: { type: 'string', texts: [] }, result: flattenVisit(visit, lang) });
  } catch (err) { next(err); }
});

// ── POST /api/visits ───────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const visit = await Visit.create(req.body);
    res.status(201).json({ success: 1, message: { type: 'success', texts: ['Created'] }, result: visit });
  } catch (err) { next(err); }
});

// ── PUT /api/visits/:id ────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const visit = await Visit.findOneAndUpdate(
      { id: Number(req.params.id) },
      { ...req.body, updatedAt: new Date().toISOString() },
      { new: true, runValidators: true }
    ).lean();
    if (!visit) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Not found'] }, result: null });
    res.json({ success: 1, message: { type: 'success', texts: ['Updated'] }, result: visit });
  } catch (err) { next(err); }
});

// ── DELETE /api/visits/:id ─────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const visit = await Visit.findOneAndDelete({ id: Number(req.params.id) });
    if (!visit) return res.status(404).json({ success: 0, message: { type: 'error', texts: ['Not found'] }, result: null });
    res.json({ success: 1, message: { type: 'success', texts: ['Deleted'] }, result: null });
  } catch (err) { next(err); }
});

module.exports = router;
