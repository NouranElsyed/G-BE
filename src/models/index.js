const mongoose = require("mongoose");

// ─── Role ────────────────────────────────────────────────────────────────────
const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─── Entity ───────────────────────────────────────────────────────────────────
// Entity is the top-level node in the tree (e.g. "Users", "Orders")
const EntitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Entity", default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── Permission ───────────────────────────────────────────────────────────────
// Second level: belongs to an Entity
const PermissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, ref: "Entity", required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── PermissionField ─────────────────────────────────────────────────────────
// Third level: belongs to a Permission
const PermissionFieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    permissionId: { type: mongoose.Schema.Types.ObjectId, ref: "Permission", required: true },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ─── RoleAssignment ───────────────────────────────────────────────────────────
/**
 * Stores which roles are assigned to a target node.
 *
 * targetType: "ENTITY" | "PERMISSION" | "FIELD"
 * targetId  : ObjectId of the corresponding document
 *
 * source    : how the assignment got here
 *   DIRECT           – set directly on this node
 *   ENTITY_PARENT    – inherited from parent entity
 *   PERMISSION_PARENT– inherited from parent permission
 *   MODULE_PARENT    – inherited from a module/global scope
 *
 * isCustomized: true  → this node has its own explicit override;
 *                        propagation from parent MUST NOT overwrite it.
 * isInherited : true  → role came from a parent, not set directly here.
 */
const RoleAssignmentSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      required: true,
      enum: ["ENTITY", "PERMISSION", "FIELD"],
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    isInherited: { type: Boolean, default: false },
    isCustomized: { type: Boolean, default: false },
    source: {
      type: String,
      enum: ["DIRECT", "ENTITY_PARENT", "PERMISSION_PARENT", "MODULE_PARENT", null],
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent duplicate (targetType, targetId, roleId) combos
RoleAssignmentSchema.index({ targetType: 1, targetId: 1, roleId: 1 }, { unique: true });

module.exports = {
  Role: mongoose.model("Role", RoleSchema),
  Entity: mongoose.model("Entity", EntitySchema),
  Permission: mongoose.model("Permission", PermissionSchema),
  PermissionField: mongoose.model("PermissionField", PermissionFieldSchema),
  RoleAssignment: mongoose.model("RoleAssignment", RoleAssignmentSchema),
};
