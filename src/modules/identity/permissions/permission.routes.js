/** Express router for the permissions module. */

const express    = require('express');
const router     = express.Router();
const controller = require('./permission.controller');

// ── Tree & generation ─────────────────────────────────────────────────────────
router.get('/',              controller.getTree);
router.post('/generate',     controller.generate);

// ── Effective assignments (authorization check) ───────────────────────────────
router.get('/effective',     controller.getEffective);

// ── Overrides ─────────────────────────────────────────────────────────────────
router.post('/overrides',              controller.setOverride);
router.delete('/overrides',            controller.removeOverride);
router.get('/overrides/:roleId',       controller.getOverridesForRole);

// ── Bulk operations ───────────────────────────────────────────────────────────
router.post('/bulk/status',  controller.bulkSetStatus);
router.post('/bulk/assign',  controller.bulkAssign);

// ── Node-level role assignments ───────────────────────────────────────────────
router.patch('/:moduleName/:entityKey/roles',                          controller.assignRolesToEntity);
router.patch('/:moduleName/:entityKey/:permKey/roles',                 controller.assignRolesToPermission);
router.patch('/:moduleName/:entityKey/:permKey/fields/:fieldKey/roles',controller.assignRolesToField);

// ── Node deletion ─────────────────────────────────────────────────────────────
router.delete('/:moduleName/:entityKey/:permKey', controller.deletePermission);

module.exports = router;
