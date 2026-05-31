const { Schema, model, models } = require('mongoose');

// ── Single field descriptor inside a schema ───────────────────────
const SchemaFieldSchema = new Schema(
  {
    name:        { type: String, required: true },
    type:        { type: String, default: 'string' },
    required:    { type: Boolean, default: false },
    description: { type: String, default: null },
    example:     { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

// ── Root schema document ──────────────────────────────────────────
const MsgSchemaSchema = new Schema(
  {
    id:          { type: Number, required: true, unique: true },
    code:        { type: String, required: true, unique: true, trim: true },
    name:        { type: String, required: true, trim: true },
    status:      { type: String, default: 'active' },
    category:    { type: String, default: null },
    process:     { type: String, default: null },
    version:     { type: String, default: null },
    format:      { type: String, default: 'JSON' },
    description: { type: String, default: null },

    fields: { type: [SchemaFieldSchema], default: [] },

    created_at: { type: Date, default: Date.now },
    created_by: { type: String, default: null },
    updated_at: { type: Date, default: null },
    updated_by: { type: String, default: null },
  },
  { timestamps: false, versionKey: false }
);

MsgSchemaSchema.index({ status: 1 });
MsgSchemaSchema.index({ category: 1 });
MsgSchemaSchema.index({ process: 1 });

module.exports = models['MsgSchema'] || model('MsgSchema', MsgSchemaSchema);
