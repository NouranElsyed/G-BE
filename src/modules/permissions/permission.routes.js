
const express = require('express');

const router = express.Router();

const controller = require('./permission.controller');

// ── Tree ────────────────────────────────────────────────────────
router.get('/', controller.getTree);

// ── Generate ───────────────────────────────────────────────────
router.post('/generate', controller.generate);

// ── Bulk ───────────────────────────────────────────────────────
router.post('/bulk/status', controller.bulkSetStatus);

// ── Entity roles ───────────────────────────────────────────────
router.patch(
  '/:moduleName/:entityKey/roles',
  controller.assignRolesToEntity
);

// ── Permission roles ───────────────────────────────────────────
router.patch(
  '/:moduleName/:entityKey/:permKey/roles',
  controller.assignRolesToPermission
);

// ── Field roles ────────────────────────────────────────────────
router.patch(
  '/:moduleName/:entityKey/:permKey/fields/:fieldKey/roles',
  controller.assignRolesToField
);

// ── Delete permission ──────────────────────────────────────────
router.delete(
  '/:moduleName/:entityKey/:permKey',
  controller.deletePermission
);

module.exports = router;

