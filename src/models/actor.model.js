const { Schema, model, models } = require('mongoose');

const ActorSchema = new Schema(
  {
    ID:             { type: Number, required: true, unique: true },
    CODE:           { type: String, required: true, unique: true, trim: true },
    SECONDARY_CODE: { type: String, default: null, trim: true },
    NAME:           { type: String, required: true, trim: true },

    ORGANIZATION_ID:   { type: Number, default: null },
    ORGANIZATION_CODE: { type: String, default: null },
    ORGANIZATION_NAME: { type: String, default: null },

    PORT_ID:   { type: Number, default: null },
    PORT_CODE: { type: String, default: null },
    PORT_NAME: { type: String, default: null },

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

    CREATED_BY:    { type: String, default: null },
    CREATED_BY_ID: { type: Number, default: null },
    CREATED_AT:    { type: Date, default: Date.now },

    UPDATED_BY:    { type: String, default: null },
    UPDATED_BY_ID: { type: Number, default: null },
    UPDATED_AT:    { type: Date, default: null },
  },
  { timestamps: false, versionKey: false }
);

ActorSchema.index({ ORGANIZATION_ID: 1 });
ActorSchema.index({ COMMUNITY_ID: 1 });
ActorSchema.index({ STATUS_ID: 1 });

module.exports = models['Actor'] || model('Actor', ActorSchema);
