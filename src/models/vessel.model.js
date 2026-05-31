const { Schema, model, models } = require('mongoose');

const VesselSchema = new Schema(
  {
    vessel_id:           { type: Number, required: true, unique: true },
    vessel_name:         { type: String, required: true, trim: true },
    vessel_imo:          { type: String, required: true, trim: true },
    vessel_call_sign:    { type: String, default: null },
    vessel_type:         { type: Number, default: null },
    vessel_country:      { type: String, default: null },
    vessel_agency_code:  { type: Schema.Types.Mixed, default: null },
    vessel_updated_at:   { type: Date, default: Date.now },

    // ── Localised fields ──────────────────────────────
    i18n: {
      en: {
        vessel_category_name: { type: String, default: null },
        vessel_status_name:   { type: String, default: 'Active' },
        vessel_status_color:  { type: String, default: 'GREEN' },
        vessel_agency_name:   { type: String, default: null },
      },
      ar: {
        vessel_category_name: { type: String, default: null },
        vessel_status_name:   { type: String, default: null },
        vessel_status_color:  { type: String, default: 'GREEN' },
        vessel_agency_name:   { type: String, default: null },
      },
    },
  },
  { timestamps: false, versionKey: false }
);

VesselSchema.index({ vessel_imo: 1 });

module.exports = models['Vessel'] || model('Vessel', VesselSchema);
