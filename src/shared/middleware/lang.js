const UserPreferences = require('../../models/userPreferences.model');

/**
 * langMiddleware — Resolves request language.
 *
 * Priority (highest → lowest):
 *  1. Accept-Language header  (Angular sets this on every request)
 *  2. ?lang query param       (manual testing)
 *  3. UserPreferences.language in MongoDB (2s timeout)
 *  4. DEFAULT_LANG env var
 *  5. 'en' hard default
 */

const VALID_LANGS = new Set(['ar', 'en']);

function parseLang(raw) {
  if (!raw) return null;
  const first = raw.split(',')[0].trim().toLowerCase().slice(0, 2);
  return VALID_LANGS.has(first) ? first : null;
}

const langMiddleware = async (req, res, next) => {
  // 1. Accept-Language header
  const headerLang = parseLang(req.headers['accept-language']);
  if (headerLang) { req.lang = headerLang; return next(); }

  // 2. ?lang query param
  const queryLang = parseLang(req.query.lang);
  if (queryLang) { req.lang = queryLang; return next(); }

  // 3. DB preference (2 second max — never block on slow/missing DB)
  if (req.user?.userId) {
    try {
      const prefs = await UserPreferences
        .findOne({ userId: req.user.userId })
        .select('language')
        .lean()
        .maxTimeMS(2000);
      const dbLang = parseLang(prefs?.language);
      if (dbLang) { req.lang = dbLang; return next(); }
    } catch { /* fall through */ }
  }

  // 4 & 5. Env / hard default
  req.lang = parseLang(process.env.DEFAULT_LANG) ?? 'en';
  next();
};

module.exports = langMiddleware;
