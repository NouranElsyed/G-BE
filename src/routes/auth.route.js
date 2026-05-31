const express          = require('express');
const jwt              = require('jsonwebtoken');
const auth           = require('../core/middleware/auth');
const langMiddleware = require('../core/middleware/lang');
const User             = require('../models/user.model');
const UserPreferences  = require('../models/userPreferences.model');

const router = express.Router();

const JWT_SECRET     = process.env.JWT_SECRET    || 'port_dashboard_super_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ── Helpers ────────────────────────────────────────────────────────────────────

const ALLOWED_PREFS_KEYS = [
  'language', 'darkMode', 'theme', 'primaryColor',
  'fontSize', 'menuMode', 'layoutDensity',
];

const VALID_LANGUAGES = ['ar', 'en'];

function pickPrefsFields(body) {
  return Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_PREFS_KEYS.includes(k))
  );
}

function buildMenu(lang) {
  const isAr = lang === 'ar';
  return [
    {
      label: isAr ? 'الهوية' : 'Identity',
      items: [
        { label: isAr ? 'المستخدمون' : 'Users',  icon: 'pi pi-users',  routerLink: '/users'  },
        { label: isAr ? 'الأدوار'    : 'Roles',   icon: 'pi pi-shield', routerLink: '/roles'  },
      ],
    },
    {
      label: isAr ? 'العمليات' : 'Operations',
      items: [
        { label: isAr ? 'السفن'    : 'Vessels',   icon: 'pi pi-compass',  routerLink: '/vessels'   },
        { label: isAr ? 'الزيارات' : 'Visits',    icon: 'pi pi-calendar', routerLink: '/visits'    },
        { label: isAr ? 'العمليات' : 'Processes', icon: 'pi pi-cog',      routerLink: '/processes' },
      ],
    },
    {
      label: isAr ? 'التواصل' : 'Communication',
      items: [
        { label: isAr ? 'المحادثات' : 'Conversations', icon: 'pi pi-comments', routerLink: '/conversations' },
        { label: isAr ? 'المواضيع'  : 'Topics',        icon: 'pi pi-tags',     routerLink: '/topics'        },
      ],
    },
  ];
}

// ── POST /auth/login ───────────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: 0,
        message: { type: 'error', texts: ['Username and password are required'] },
        result: null,
      });
    }

    const user = await User.findOne({ username: username.trim() }).lean();

    if (!user) {
      return res.status(401).json({
        success: 0,
        message: { type: 'error', texts: ['Invalid username or password'] },
        result: null,
      });
    }

    // ✅ نحفظ user.id (الـ numeric field) مش user._id (الـ ObjectId)
    const token = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      success: 1,
      message: { type: 'success', texts: ['Login successful'] },
      result: { token },
    });
  } catch (err) {
    next(err);
  }
});

// ── All routes below require authentication ────────────────────────────────────
router.use(auth);
router.use(langMiddleware);

// ── GET /auth/me ───────────────────────────────────────────────────────────────
router.get('/me', async (req, res, next) => {
  try {
    const rawId = req.user.userId;

    // ✅ الـ userId في التوكن القديم ممكن يكون ObjectId string — نبحث بالاتنين
    let user = null;

    const numericId = Number(rawId);
    if (!isNaN(numericId)) {
      // توكن جديد — userId هو الـ numeric id
      user = await User.findOne({ id: numericId }).lean();
    }

    if (!user) {
      // توكن قديم — userId هو الـ MongoDB _id (ObjectId string)
      user = await User.findById(rawId).lean();
    }

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: { type: 'error', texts: ['User not found'] },
        result: null,
      });
    }

    const lang = req.lang ?? 'en';
    const i18n = user.i18n?.[lang] ?? user.i18n?.en ?? {};

    return res.status(200).json({
      success: 1,
      message: { type: 'success', texts: ['User fetched successfully'] },
      result: {
        id:           user.id,
        username:     user.username,
        email:        user.email,
        phone:        user.phone,
        organization: user.organization?.i18n?.[lang]?.org_name ?? null,
        name:         i18n.name   ?? null,
        role:         i18n.role   ?? null,
        status:       i18n.status ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /auth/preferences ──────────────────────────────────────────────────────
router.get('/preferences', async (req, res, next) => {
  try {
    const prefs = await UserPreferences.findOne({ userId: req.user.userId }).lean();
    return res.status(200).json({
      success: 1,
      message: { type: 'success', texts: ['Preferences fetched successfully'] },
      result: prefs ?? {},
    });
  } catch (err) {
    next(err);
  }
});

// ── PUT /auth/preferences ──────────────────────────────────────────────────────
router.put('/preferences', async (req, res, next) => {
  try {
    const updates = pickPrefsFields(req.body);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: 0,
        message: { type: 'error', texts: ['No valid preference fields provided'] },
        result: null,
      });
    }

    if (updates.language && !VALID_LANGUAGES.includes(updates.language)) {
      return res.status(400).json({
        success: 0,
        message: { type: 'error', texts: [`Language must be one of: ${VALID_LANGUAGES.join(', ')}`] },
        result: null,
      });
    }

    const prefs = await UserPreferences.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: updates },
      { new: true, upsert: true, lean: true }
    );

    return res.status(200).json({
      success: 1,
      message: { type: 'success', texts: ['Preferences updated successfully'] },
      result: prefs,
    });
  } catch (err) {
    next(err);
  }
});

// ── PATCH /auth/preferences/language ──────────────────────────────────────────
router.patch('/preferences/language', async (req, res, next) => {
  try {
    const { language } = req.body;

    if (!VALID_LANGUAGES.includes(language)) {
      return res.status(400).json({
        success: 0,
        message: { type: 'error', texts: [`Language must be one of: ${VALID_LANGUAGES.join(', ')}`] },
        result: null,
      });
    }

    UserPreferences.findOneAndUpdate(
      { userId: req.user.userId },
      { $set: { language } },
      { upsert: true }
    ).catch(err => console.error('[lang-sync] DB update failed:', err.message));

    return res.status(200).json({
      success: 1,
      message: { type: 'success', texts: ['Language preference queued for sync'] },
      result: { language },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /auth/menu ─────────────────────────────────────────────────────────────
router.get('/menu', (req, res) => {
  const menu = buildMenu(req.lang ?? 'en');
  return res.status(200).json({
    success: 1,
    message: { type: 'success', texts: ['Menu fetched successfully'] },
    result: menu,
  });
});

module.exports = router;