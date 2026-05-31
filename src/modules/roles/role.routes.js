const { Router } = require('express');
const ctrl        = require('./role.controller');

const router = Router();

// GET    /api/roles       → paginated list (lang-resolved)
router.get('/',    ctrl.listRoles);
// GET    /api/roles/:id   → single role
router.get('/:id', ctrl.getRole);
// POST   /api/roles       → create
router.post('/',   ctrl.createRole);
// PUT    /api/roles/:id   → full replace
router.put('/:id', ctrl.replaceRole);
// DELETE /api/roles/:id   → delete
router.delete('/:id', ctrl.deleteRole);

module.exports = router;
