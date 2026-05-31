const { Schema, model, models } = require('mongoose');

const ProcessSchema = new Schema(
  {
    code:            { type: String, required: true, unique: true, trim: true },
    secondaryCode:   { type: String, default: null, trim: true },
    nameCode:        { type: String, default: null },
    descriptionCode: { type: String, default: null },
    attachmentId:    { type: Number, default: null },
    createdById:     { type: Number, default: null },
    updatedById:     { type: Number, default: null },
    createdAt:       { type: Date, default: Date.now },
    updatedAt:       { type: Date, default: null },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

ProcessSchema.index({ secondaryCode: 1 });

module.exports = models['Process'] || model('Process', ProcessSchema);
