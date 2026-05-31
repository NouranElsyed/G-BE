const { Schema, model, models } = require('mongoose');

const ConversationSchema = new Schema(
  {
    ID:               { type: Number, required: true, unique: true },
    CODE:             { type: String, required: true, trim: true },
    NAME_CODE:        { type: String, default: null },
    DESCRIPTION_CODE: { type: String, default: null },
    SECONDARY_CODE:   { type: String, default: null },

    STATUS_ID:        { type: Number, default: null },
    STATUS_NAME:      { type: String, default: null },

    CATEGORY_ID:      { type: Number, default: null },
    CATEGORY_NAME:    { type: String, default: null },

    PROCESS_ID:       { type: Number, default: null },
    PROCESS_NAME:     { type: String, default: null },
    PROCESS_CODE:     { type: String, default: null },

    STAGE_ID:         { type: Number, default: null },
    STAGE_NAME:       { type: String, default: null },

    PORT_ID:          { type: Number, default: null },
    PORT_NAME:        { type: String, default: null },

    STARTED_AT:       { type: Date, default: null },
    CLOSED_AT:        { type: Date, default: null },

    CREATED_BY_ID:    { type: Number, default: null },
    CREATED_BY_NAME:  { type: String, default: null },
    CREATED_AT:       { type: Date, default: Date.now },

    UPDATED_BY_ID:    { type: Number, default: null },
    UPDATED_BY_NAME:  { type: String, default: null },
    UPDATED_AT:       { type: Date, default: null },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

ConversationSchema.index({ STATUS_ID: 1 });
ConversationSchema.index({ PROCESS_ID: 1 });
ConversationSchema.index({ PORT_ID: 1 });
ConversationSchema.index({ CATEGORY_ID: 1 });

module.exports = models['Conversation'] || model('Conversation', ConversationSchema);
