const { Schema, model, models } = require('mongoose');

// ── Field-level permission ────────────────────────────────────────────────────
const FieldPermissionSchema = new Schema(
  {
    key:    { type: String, required: true },
    code:   { type: String, default: null },
    // { en: 'Email', ar: 'البريد الإلكتروني' }
    i18n:   { type: Schema.Types.Mixed, default: {} },
    status: { type: String, default: 'Active' },
    // FULL | READ | HIDDEN — default field visibility
    access: { type: String, enum: ['FULL', 'READ', 'HIDDEN'], default: 'FULL' },
    // ✅ FIX: fields carry their own role assignments
    assignedRoleIds:    { type: [Number], default: [] },
    assignedRolesCount: { type: Number,   default: 0  },
  },
  { _id: false }
);

// ── Single permission (action-level) ─────────────────────────────────────────
const PermissionItemSchema = new Schema(
  {
    key:                { type: String, required: true },
    code:               { type: String, default: null },
    // { en: 'View', ar: 'عرض' }
    i18n:               { type: Schema.Types.Mixed, default: {} },
    action:             { type: String, default: null }, // READ | WRITE | UPDATE | DELETE
    status:             { type: String, default: 'Active' },
    assignedRolesCount: { type: Number,   default: 0  },
    assignedRoleIds:    { type: [Number], default: [] },
    fieldPermissions:   { type: [FieldPermissionSchema], default: [] },
  },
  { _id: false }
);

// ── Entity inside a module ────────────────────────────────────────────────────
const PermissionEntitySchema = new Schema(
  {
    key:  { type: String, required: true },
    code: { type: String, default: null },
    // { en: 'Users', ar: 'المستخدمون' }
    i18n:               { type: Schema.Types.Mixed, default: {} },
    status:             { type: String, default: 'Active' },
    assignedRolesCount: { type: Number,   default: 0  },
    // Union of all child permissions' assignedRoleIds (bubble-up cache)
    assignedRoleIds:    { type: [Number], default: [] },
    createdBy:  { type: String, default: null },
    createdAt:  { type: Date,   default: null },
    updatedBy:  { type: String, default: null },
    updatedAt:  { type: Date,   default: null },
    permissions: { type: [PermissionItemSchema], default: [] },
  },
  { _id: false }
);

// ── Root: one document per module ────────────────────────────────────────────
const PermissionModuleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    // { en: 'Core', ar: 'النواة' }
    i18n:     { type: Schema.Types.Mixed, default: {} },
    entities: { type: [PermissionEntitySchema], default: [] },
  },
  { timestamps: false, versionKey: false }
);

PermissionModuleSchema.index({ name: 1 });
PermissionModuleSchema.index({ 'entities.key': 1 });

module.exports = models.PermissionModule || model('PermissionModule', PermissionModuleSchema);
