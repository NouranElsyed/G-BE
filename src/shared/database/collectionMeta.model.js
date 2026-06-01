/**
 * Re-export CollectionMeta from the shared database layer.
 *
 * All modules import from here rather than referencing a distant models/ path.
 * If the model is ever refactored, only this file needs updating.
 */
const { Schema, model, models } = require('mongoose');

// ── FieldMeta ────────────────────────────────────────────────────────────────
const FieldMetaSchema = new Schema(
  {
    secondary_code: { type: String, required: true },
    name:           { type: String, required: true },
    icon:           { type: String, default: null  },
    order:          { type: Number, default: 0     },
    type: {
      type:    String,
      enum:    ['STRING', 'NUMBER', 'DATE', 'STATUS', 'BOOLEAN', 'ENUM', 'ARRAY'],
      default: 'STRING',
    },
    is_public: {
      type:    Number,
      enum:    [-1, 0, 1],
      default: 1,
    },
    enum:   { type: Schema.Types.Mixed, default: null },
    lookup: { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

const PageLabelsSchema = new Schema({}, { _id: false, strict: false });

// ── CollectionMeta ────────────────────────────────────────────────────────────
const CollectionMetaSchema = new Schema(
  {
    collection: { type: String, required: true },
    lang:       { type: String, enum: ['en', 'ar'], required: true },
    paging: {
      page_title:     { type: String, default: null },
      page_subtitle:  { type: String, default: null },
      items_per_page: { type: Number, default: 24   },
    },
    fields: { type: [FieldMetaSchema], default: [] },
    labels: { type: PageLabelsSchema,  default: {} },
  },
  { timestamps: true, versionKey: false }
);

CollectionMetaSchema.index({ collection: 1, lang: 1 }, { unique: true });

// Guard against model re-registration in hot-reload environments
module.exports = models.CollectionMeta || model('CollectionMeta', CollectionMetaSchema);
