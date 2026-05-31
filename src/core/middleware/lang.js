const UserPreferences = require('../../models/userPreferences.model');

/**
 * langMiddleware  (v2 — Accept-Language first)
 *
 * Priority (highest → lowest):
 *  1. Accept-Language request header      ← الفرونت بيبعته مع كل request لما يغير اللغة
 *  2. ?lang query param                   ← للـ testing يدوياً
 *  3. UserPreferences.language في MongoDB ← الـ saved preference
 *  4. process.env.DEFAULT_LANG            ← env fallback
 *  5. 'en'                                ← hard default
 *
 * ليه Accept-Language أولاً؟
 *   الفرونت (Angular LangSwitcher) بيستدعي updatePreference('language', lang)
 *   اللي بتبعت Accept-Language على كل request. لو الـ DB هو المصدر الوحيد،
 *   لازم نعمل PUT /auth/preferences قبل أي request تاني — وده race condition.
 *   بدل كده، نثق في الـ header اللي جاي من الـ request نفسه.
 */
const VALID_LANGS = new Set(['ar', 'en']);

function parseLang(raw) {
  if (!raw) return null;
  // Accept-Language can be "ar,en;q=0.9" — take the first tag
  const first = raw.split(',')[0].trim().toLowerCase().slice(0, 2);
  return VALID_LANGS.has(first) ? first : null;
}

const langMiddleware = async (req, res, next) => {
  // ── 1. Accept-Language header (highest priority) ──────────────────
  const headerLang = parseLang(req.headers['accept-language']);
  if (headerLang) {
    req.lang = headerLang;
    return next();
  }

  // ── 2. ?lang query param ──────────────────────────────────────────
  const queryLang = parseLang(req.query.lang);
  if (queryLang) {
    req.lang = queryLang;
    return next();
  }

  // ── 3. UserPreferences from DB (only if logged in) ────────────────
  if (req.user?.userId) {
    try {
      const prefs = await UserPreferences.findOne({ userId: req.user.userId })
        .select('language')
        .lean();
      const dbLang = parseLang(prefs?.language);
      if (dbLang) {
        req.lang = dbLang;
        return next();
      }
    } catch {
      // DB error → fall through to defaults
    }
  }

  // ── 4 & 5. Env / hard default ─────────────────────────────────────
  req.lang = parseLang(process.env.DEFAULT_LANG) ?? 'en';
  next();
};

module.exports = langMiddleware;
