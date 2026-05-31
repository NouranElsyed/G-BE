"use strict";

/**
 * Seed script – populates DB with demo data matching the spec examples.
 * Run with:  node scripts/seed.js
 */

const mongoose = require("mongoose");
require("dotenv").config();

const { Role, Entity, Permission, PermissionField, RoleAssignment } =
  require("../models");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/permissions_db";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    Role.deleteMany({}),
    Entity.deleteMany({}),
    Permission.deleteMany({}),
    PermissionField.deleteMany({}),
    RoleAssignment.deleteMany({}),
  ]);

  // ── Roles ──────────────────────────────────────────────────────────────────
  const [admin, manager, editor, viewer] = await Role.insertMany([
    { name: "Admin" },
    { name: "Manager" },
    { name: "Editor" },
    { name: "Viewer" },
  ]);

  // ── Entities ───────────────────────────────────────────────────────────────
  const [usersEntity, ordersEntity] = await Entity.insertMany([
    { name: "Users", order: 1 },
    { name: "Orders", order: 2 },
  ]);

  // ── Permissions ────────────────────────────────────────────────────────────
  const [viewPerm, createPerm, editPerm, deletePerm] =
    await Permission.insertMany([
      { name: "View", code: "view", entityId: usersEntity._id, order: 1 },
      { name: "Create", code: "create", entityId: usersEntity._id, order: 2 },
      { name: "Edit", code: "edit", entityId: usersEntity._id, order: 3 },
      { name: "Delete", code: "delete", entityId: usersEntity._id, order: 4 },
    ]);

  // ── Fields ─────────────────────────────────────────────────────────────────
  const [nameField, emailField, phoneField] = await PermissionField.insertMany([
    { name: "Name", code: "name", permissionId: viewPerm._id, order: 1 },
    { name: "Email", code: "email", permissionId: viewPerm._id, order: 2 },
    { name: "Phone", code: "phone", permissionId: viewPerm._id, order: 3 },
  ]);

  // ── Assignments (matching spec example) ────────────────────────────────────
  // Users Entity = [Admin, Manager]  → PARTIAL (because View is customized)
  await RoleAssignment.insertMany([
    {
      targetType: "ENTITY",
      targetId: usersEntity._id,
      roleId: admin._id,
      isInherited: false,
      isCustomized: true,
      source: "DIRECT",
    },
    {
      targetType: "ENTITY",
      targetId: usersEntity._id,
      roleId: manager._id,
      isInherited: false,
      isCustomized: true,
      source: "DIRECT",
    },

    // View Permission = [Admin] only → custom override
    {
      targetType: "PERMISSION",
      targetId: viewPerm._id,
      roleId: admin._id,
      isInherited: false,
      isCustomized: true, // ← customized! propagation must skip this
      source: "DIRECT",
    },

    // Create / Edit / Delete = [Admin, Manager] → inherited from entity
    ...[createPerm, editPerm, deletePerm].flatMap((perm) => [
      {
        targetType: "PERMISSION",
        targetId: perm._id,
        roleId: admin._id,
        isInherited: true,
        isCustomized: false,
        source: "ENTITY_PARENT",
      },
      {
        targetType: "PERMISSION",
        targetId: perm._id,
        roleId: manager._id,
        isInherited: true,
        isCustomized: false,
        source: "ENTITY_PARENT",
      },
    ]),

    // Fields under View = [Admin] inherited from viewPerm
    ...[nameField, emailField, phoneField].map((field) => ({
      targetType: "FIELD",
      targetId: field._id,
      roleId: admin._id,
      isInherited: true,
      isCustomized: false,
      source: "PERMISSION_PARENT",
    })),
  ]);

  console.log("✅  Seed complete");
  console.log("   Roles  :", [admin, manager, editor, viewer].map((r) => r.name).join(", "));
  console.log("   Entity : Users (PARTIAL – View is customized)");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
