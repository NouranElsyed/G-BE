/**
 * System Routes
 *
 * GET  /api/system/modules          — Runtime module registry (frontend bootstrap)
 * GET  /api/system/flags            — Current feature flags state
 * PATCH /api/system/flags/:key      — Toggle a single feature flag at runtime
 * POST  /api/system/flags/bulk      — Bulk update feature flags
 */

const express   = require('express');
const router    = express.Router();
const registry  = require('./module-registry/registry');
const { ok, badRequest } = require('../shared/response/response.builder');

// ── GET /api/system/modules ───────────────────────────────────────────────────
// Critical bootstrap endpoint. Angular calls this once at startup.
router.get('/modules', (req, res) => {
  const lang = req.lang || 'en';
  ok(res, registry.buildRegistry(lang));
});

// ── GET /api/system/flags ─────────────────────────────────────────────────────
router.get('/flags', (_req, res) => {
  ok(res, registry.getFlags());
});

// ── PATCH /api/system/flags/:key ──────────────────────────────────────────────
// Toggle a single flag at runtime — no deployment needed.
// Body: { "enabled": true | false }
router.patch('/flags/:key', (req, res) => {
  const { key } = req.params;
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return badRequest(res, '"enabled" must be a boolean');
  }

  const flags = registry.getFlags();
  if (!(key in flags)) {
    return badRequest(res, `Unknown flag: ${key}`);
  }

  registry.setFlag(key, enabled);
  ok(res, { key, enabled });
});

// ── POST /api/system/flags/bulk ───────────────────────────────────────────────
// Bulk enable/disable multiple flags in one call.
// Body: { "flags": { "exchange": false, "transport.vessels": true } }
router.post('/flags/bulk', (req, res) => {
  const { flags } = req.body;

  if (!flags || typeof flags !== 'object' || Array.isArray(flags)) {
    return badRequest(res, '"flags" must be an object');
  }

  const current = registry.getFlags();
  const updated = {};

  for (const [key, value] of Object.entries(flags)) {
    if (!(key in current)) continue; // silently skip unknown keys
    if (typeof value !== 'boolean') continue;
    registry.setFlag(key, value);
    updated[key] = value;
  }

  ok(res, { updated });
});

module.exports = router;
