const { Schema, model, models } = require('mongoose');

const OrganizationSchema = new Schema(
  {
    ID:             { type: Number, required: true, unique: true },
    CODE:           { type: String, required: true, unique: true, trim: true },
    SECONDARY_CODE: { type: String, default: null, trim: true },
    NAME:           { type: String, required: true, trim: true },
    DESCRIPTION:    { type: String, default: null },

    STATUS_ID:    { type: Number, default: null },
    STATUS_CODE:  { type: String, default: null },
    STATUS_NAME:  { type: String, default: null },
    STATUS_COLOR: { type: String, default: 'GREEN' },

    CATEGORY_ID:   { type: Number, default: null },
    CATEGORY_CODE: { type: String, default: null },
    CATEGORY_NAME: { type: String, default: null },

    COMMUNITY_ID:   { type: Number, default: null },
    COMMUNITY_CODE: { type: String, default: null },
    COMMUNITY_NAME: { type: String, default: null },

    MEDIA_ICON:  { type: String, default: null },
    MEDIA_IMAGE: { type: String, default: null },

    CREATED_BY:    { type: String, default: null },
    CREATED_BY_ID: { type: Number, default: null },
    CREATED_AT:    { type: Date, default: Date.now },

    UPDATED_BY:    { type: String, default: null },
    UPDATED_BY_ID: { type: Number, default: null },
    UPDATED_AT:    { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: false, versionKey: false }
);

OrganizationSchema.index({ STATUS_ID: 1 });
OrganizationSchema.index({ CATEGORY_ID: 1 });
OrganizationSchema.index({ COMMUNITY_ID: 1 });

module.exports = models['Organization'] || model('Organization', OrganizationSchema);
