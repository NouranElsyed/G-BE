const { Schema, model, models } = require('mongoose');

const RoleSchema = new Schema(
  {
    role_id:           { type: Number, required: true, unique: true },
    role_user_count:   { type: Number, default: 0 },
    role_perm_count:   { type: Number, default: 0 },
    role_status_color: { type: String, default: 'GREEN' },
    role_updated_at:   { type: Date,   default: Date.now },

    /**
     * Localised fields.
     * Stored as i18n map so the document is the single source for all locales.
     * Response layer resolves the correct language before sending to client.
     */
    i18n: {
      en: {
        role_name:        { type: String, default: null },
        role_category:    { type: String, default: null },
        role_community:   { type: String, default: null },
        role_status_name: { type: String, default: 'Active' },
      },
      ar: {
        role_name:        { type: String, default: null },
        role_category:    { type: String, default: null },
        role_community:   { type: String, default: null },
        role_status_name: { type: String, default: null },
      },
    },
  },
  { timestamps: false, versionKey: false }
);

RoleSchema.index({ role_id: 1 });

module.exports = models.Role || model('Role', RoleSchema);
