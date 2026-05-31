const { Schema, model, models } = require('mongoose');

const VisitSchema = new Schema(
  {
    id:                   { type: Number, required: true, unique: true },
    internalCode:         { type: String, default: null },
    externalCode:         { type: String, default: null },
    routeNumber:          { type: String, default: null },

    vesselId:             { type: String, default: null },
    imoNumber:            { type: String, default: null },
    callSign:             { type: String, default: null },

    portId:               { type: String, default: null },
    berth:                { type: String, default: null },

    eta:  { type: String, default: null },
    ata:  { type: String, default: null },
    etd:  { type: String, default: null },
    atd:  { type: String, default: null },
    etaDate: { type: String, default: null },
    etaTime: { type: String, default: null },
    ataDate: { type: String, default: null },
    ataTime: { type: String, default: null },
    etdDate: { type: String, default: null },
    etdTime: { type: String, default: null },
    atdDate: { type: String, default: null },
    atdTime: { type: String, default: null },

    visitNumberForVessel: { type: Number, default: null },
    totalVisitsForVessel: { type: Number, default: null },
    messagesCount:        { type: Number, default: 0 },
    messageFormat:        { type: String, default: null },
    lastMessageStatus:    { type: String, default: null },

    createdAt: { type: String, default: null },
    updatedAt: { type: String, default: null },

    // ── Localised fields ──────────────────────────────
    i18n: {
      en: {
        vesselName:    { type: String, default: null },
        vesselDisplay: { type: String, default: null },
        carrier:       { type: String, default: null },
        nationality:   { type: String, default: null },
        portName:      { type: String, default: null },
        status:        { type: String, default: null },
        agentName:     { type: String, default: null },
      },
      ar: {
        vesselName:    { type: String, default: null },
        vesselDisplay: { type: String, default: null },
        carrier:       { type: String, default: null },
        nationality:   { type: String, default: null },
        portName:      { type: String, default: null },
        status:        { type: String, default: null },
        agentName:     { type: String, default: null },
      },
    },
  },
  { timestamps: false, versionKey: false }
);

VisitSchema.index({ vesselId: 1 });
VisitSchema.index({ portId: 1 });
VisitSchema.index({ 'i18n.en.status': 1 });

module.exports = models['Visit'] || model('Visit', VisitSchema);
