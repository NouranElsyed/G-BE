const { Schema, model, models } = require('mongoose');

// ── Nested: category children (recursive-like, stored flat as array) ──
const CategoryChildSchema = new Schema(
  {
    category_id:          { type: Number, default: null },
    category_code:        { type: String, default: null },
    category_name_code:   { type: String, default: null },
    category_name:        { type: String, default: null },
    category_table:       { type: String, default: null },
    category_level:       { type: Number, default: null },
    category_parent_id:   { type: Number, default: null },
    category_status_id:   { type: Number, default: null },
    category_status:      { type: String, default: null },
    category_status_color:{ type: String, default: null },
    category_is_public:   { type: Number, default: 1 },
    category_created_at:  { type: Date, default: null },
    category_updated_at:  { type: Date, default: null },
    // children can go deeper — store as Mixed
    category_children:    { type: Schema.Types.Mixed, default: [] },
  },
  { _id: false }
);

// ── Nested: entity (top-level category) inside a module ──────────────
const CategoryEntitySchema = new Schema(
  {
    category_id:          { type: Number, required: true },
    category_code:        { type: String, required: true },
    category_name_code:   { type: String, default: null },
    category_name:        { type: String, default: null },
    category_table:       { type: String, default: null },
    category_level:       { type: Number, default: 1 },
    category_parent_id:   { type: Number, default: null },
    category_status_id:   { type: Number, default: null },
    category_status:      { type: String, default: null },
    category_status_color:{ type: String, default: null },
    category_is_public:   { type: Number, default: 1 },
    category_created_at:  { type: Date, default: null },
    category_updated_at:  { type: Date, default: null },
    category_children:    { type: [CategoryChildSchema], default: [] },
  },
  { _id: false }
);

// ── Root: one document per module ────────────────────────────────────
const CategorySchema = new Schema(
  {
    module_id:    { type: Number, required: true, unique: true },
    module_code:  { type: String, required: true, unique: true, trim: true },
    module_name:  { type: String, default: null },
    module_table: { type: String, default: null },
    entities:     { type: [CategoryEntitySchema], default: [] },
  },
  { timestamps: false, versionKey: false }
);

CategorySchema.index({ module_code: 1 });

module.exports = models['Category'] || model('Category', CategorySchema);
