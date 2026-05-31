const { Schema, model, models } = require('mongoose');

const TopicSchema = new Schema(
  {
    code:        { type: String, required: true, unique: true, trim: true },
    name:        { type: String, required: true, trim: true },
    name_ar:     { type: String, default: null },       // Arabic name stored separately
    status:      { type: String, default: 'Active' },
    category:    { type: String, default: null },
    category_ar: { type: String, default: null },
    domain:      { type: String, default: null },
    description: { type: String, default: null },
    description_ar: { type: String, default: null },
    tags:        { type: String, default: null },
    tags_ar:     { type: String, default: null },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

TopicSchema.index({ category: 1 });
TopicSchema.index({ status: 1 });

module.exports = models['Topic'] || model('Topic', TopicSchema);
