/** Stores per-role overrides that take precedence over inherited assignments. */

const { Schema, model, models } = require('mongoose');

const PermissionOverrideSchema = new Schema({
  roleId:     { type: Number, required: true, index: true },
  targetType: { type: String, enum: ['field', 'permission'], required: true },
  targetKey:  { type: String, required: true, index: true },
  parentKey:  { type: String, required: true },
  moduleId:   { type: Schema.Types.ObjectId, ref: 'PermissionModule' },
  access:     { type: String, enum: ['GRANT', 'DENY'], default: 'GRANT' },
  createdBy:  { type: String },
  createdAt:  { type: Date, default: () => new Date() },
}, { timestamps: false, versionKey: false });

PermissionOverrideSchema.index({ roleId: 1, targetKey: 1 }, { unique: true });
PermissionOverrideSchema.index({ roleId: 1, parentKey: 1 });

module.exports = models.PermissionOverride || model('PermissionOverride', PermissionOverrideSchema);
