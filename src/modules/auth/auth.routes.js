/**
 * Auth Routes
 *
 * POST  /api/auth/login
 * GET   /api/auth/me
 * GET   /api/auth/preferences
 * PUT   /api/auth/preferences
 * PATCH /api/auth/preferences/language
 * GET   /api/auth/menu
 */

const express         = require('express');
const jwt             = require('jsonwebtoken');
const User            = require('../../models/user.model');
const UserPreferences = require('../../models/userPreferences.model');
const auth            = require('../../shared/middleware/auth');
const langMiddleware  = require('../../shared/middleware/lang');
const { ok, badRequest, unauthorized, notFound } = require('../../shared/response/response.builder');

const router = express.Router();

const JWT_SECRET     = process.env.JWT_SECRET    || 'port_dashboard_super_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const ALLOWED_PREFS_KEYS = ['language', 'darkMode', 'theme', 'primaryColor', 'fontSize', 'menuMode', 'layoutDensity'];
const VALID_LANGUAGES    = ['ar', 'en'];

function pickPrefsFields(body) {
  return Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED_PREFS_KEYS.includes(k)));
}

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return badRequest(res, 'Username and password are required');
    }

    const user = await User.findOne({ username: username.trim() }).lean();
    if (!user) return unauthorized(res, 'Invalid username or password');

    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );

    ok(res, { token });
  } catch (err) { next(err); }
});

// ── Protected routes below ────────────────────────────────────────────────────
router.use(auth);
router.use(langMiddleware);

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', async (req, res, next) => {
  try {
    const rawId = req.user.userId;
    let user = null;

    const numericId = Number(rawId);
    if (!isNaN(numericId)) {
      user = await User.findOne({ id: numericId }).lean();
    }
    if (!user) {
      user = await User.findById(rawId).lean();
    }
    if (!user) return notFound(res, 'User not found');

    const lang = req.lang ?? 'en';
    const i18n = user.i18n?.[lang] ?? user.i18n?.en ?? {};

    ok(res, {
      id:           user.id,
      username:     user.username,
      email:        user.email,
      phone:        user.phone,
      organization: user.organization?.i18n?.[lang]?.org_name ?? null,
      name:         i18n.name   ?? null,
      role:         i18n.role   ?? null,
      status:       i18n.status ?? null,
    });
  } catch (err) { next(err); }
});

// ── GET /api/auth/preferences ─────────────────────────────────────────────────
router.get('/preferences', async (req, res, next) => {
  try {
    const prefs = await UserPreferences.findOne({ userId: req.user.userId }).lean();
    ok(res, prefs ?? {});
  } catch (err) { next(err); }
});

// ── PUT /api/auth/preferences ─────────────────────────────────────────────────
router.put('/preferences', async (req, res, next) => {
  try {
    const updates = pickPrefsFields(req.body);

    if (Object.keys(updates).length === 0) {
      return badRequest(res, 'No valid preference fields provided');
    }
    if (updates.language && !VALID_LANGUAGES.includes(updates.language)) {
      return badRequest(res, `Language must be one of: ${VALID_LANGUAGES.join(', ')}`);
    }

    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, upsert: true, lean: true },
    );

    ok(res, prefs);
  } catch (err) { next(err); }
});

// ── PATCH /api/auth/preferences/language ─────────────────────────────────────
router.patch('/preferences/language', async (req, res, next) => {
  try {
    const { language } = req.body;

    if (!VALID_LANGUAGES.includes(language)) {
      return badRequest(res, `Language must be one of: ${VALID_LANGUAGES.join(', ')}`);
    }

    // Fire-and-forget DB sync
    UserPreferences.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { language } },
      { upsert: true },
    ).catch(err => console.error('[lang-sync] DB update failed:', err.message));

    ok(res, { language });
  } catch (err) { next(err); }
});

module.exports = router;
