const { Schema } = require('mongoose');

// ── Paging sub-doc ────────────────────────────────────────────────
const PagingSchema = new Schema(
  {
    page_title:    { type: String, default: null },
    page_subtitle: { type: String, default: null },
    total_items:   { type: Number, default: 0 },
    start_item:    { type: Number, default: 1 },
    end_item:      { type: Number, default: 0 },
    items_per_page:{ type: Number, default: 24 },
    total_pages:   { type: Number, default: 1 },
    current_page:  { type: Number, default: 1 },
  },
  { _id: false }
);

// ── MetaData entry sub-doc ────────────────────────────────────────
const MetaDataSchema = new Schema(
  {
    secondary_code: { type: String },
    name:           { type: String },
    icon:           { type: String, default: null },
    order:          { type: Number },
    type:           { type: String, enum: ['STRING', 'NUMBER', 'DATE', 'STATUS', 'BOOLEAN'] },
    is_public:      { type: Number, enum: [-1, 0, 1] },
    enum:           { type: Schema.Types.Mixed, default: null },
    lookup:         { type: Schema.Types.Mixed, default: null },
  },
  { _id: false }
);

module.exports = { PagingSchema, MetaDataSchema };
