/**
 * Communities Routes — Arabic & English support
 *
 * Endpoints:
 *   GET    /api/communities        → paged list  { paging, meta_data, items }
 *   GET    /api/communities/:id    → single flattened item
 *   POST   /api/communities        → create
 *   PUT    /api/communities/:id    → update
 *   DELETE /api/communities/:id    → delete
 *
 * Bilingual strategy:
 *   1. lang middleware sets req.lang ('ar' | 'en') from Accept-Language header
 *   2. GET / tries CollectionMeta in DB first (same as other routes)
 *   3. If no DB record found, falls back to INLINE_META below — no seed required
 *   4. flatten() maps UPPERCASE Mongoose keys → lowercase keys the frontend expects
 */

const express        = require('express');
const Community      = require('../../../models/community.model');
const CollectionMeta = require('../../../models/collectionMeta.model');
const { buildPagedResult, buildFallbackPagedResult } = require('../../../shared/paging/paging.builder');
const { ok, created, noContent, notFound } = require('../../../shared/response/response.builder');

const router = express.Router();

// ── Inline bilingual meta (fallback when CollectionMeta not seeded in DB) ─────

const INLINE_META = {
  ar: {
    paging:  { page_title: 'المجتمعات', page_subtitle: null, items_per_page: 24 },
    fields: [
      { secondary_code: 'id',            name: 'الرقم',   order: 1, type: 'NUMBER', is_public: -1 },
      { secondary_code: 'name',          name: 'الاسم',   order: 2, type: 'STRING', is_public:  1 },
      { secondary_code: 'code',          name: 'الكود',   order: 3, type: 'STRING', is_public:  1 },
      { secondary_code: 'status_name',   name: 'الحالة',  order: 4, type: 'STRING', is_public:  1 },
      { secondary_code: 'category_name', name: 'الفئة',   order: 5, type: 'STRING', is_public:  1 },
      { secondary_code: 'domain_name',   name: 'النطاق',  order: 6, type: 'STRING', is_public:  1 },
      { secondary_code: 'description',   name: 'الوصف',   order: 7, type: 'STRING', is_public:  1 },
    ],
    labels: {},
  },
  en: {
    paging:  { page_title: 'Communities', page_subtitle: null, items_per_page: 24 },
    fields: [
      { secondary_code: 'id',            name: 'ID',          order: 1, type: 'NUMBER', is_public: -1 },
      { secondary_code: 'name',          name: 'Name',        order: 2, type: 'STRING', is_public:  1 },
      { secondary_code: 'code',          name: 'Code',        order: 3, type: 'STRING', is_public:  1 },
      { secondary_code: 'status_name',   name: 'Status',      order: 4, type: 'STRING', is_public:  1 },
      { secondary_code: 'category_name', name: 'Category',    order: 5, type: 'STRING', is_public:  1 },
      { secondary_code: 'domain_name',   name: 'Domain',      order: 6, type: 'STRING', is_public:  1 },
      { secondary_code: 'description',   name: 'Description', order: 7, type: 'STRING', is_public:  1 },
    ],
    labels: {},
  },
};

// ── Flatten: UPPERCASE Mongoose doc → lowercase frontend-friendly object ──────

function flattenCommunity(doc) {
  return {
    id:            doc.ID,
    code:          doc.CODE,
    name:          doc.NAME,
    description:   doc.DESCRIPTION,
    status_id:     doc.STATUS_ID,
    status_code:   doc.STATUS_CODE,
    status_name:   doc.STATUS_NAME,
    status_color:  doc.STATUS_COLOR,
    category_id:   doc.CATEGORY_ID,
    category_code: doc.CATEGORY_CODE,
    category_name: doc.CATEGORY_NAME,
    domain_id:     doc.DOMAIN_ID,
    domain_code:   doc.DOMAIN_CODE,
    domain_name:   doc.DOMAIN_NAME,
    media_icon:    doc.MEDIA_ICON,
    media_image:   doc.MEDIA_IMAGE,
    created_by:    doc.CREATED_BY,
    created_by_id: doc.CREATED_BY_ID,
    created_at:    doc.CREATED_AT,
    updated_by:    doc.UPDATED_BY,
    updated_by_id: doc.UPDATED_BY_ID,
    updated_at:    doc.UPDATED_AT,
  };
}

// ── GET /api/communities ──────────────────────────────────────────────────────

router.get('/', async (req, res, next) => {
  try {
    const lang = req.lang ?? 'en';

    const [meta, docs] = await Promise.all([
      CollectionMeta.findOne({ collection: 'communities', lang }).lean(),
      Community.find({}).lean(),
    ]);

    const items  = docs.map(flattenCommunity);
    // Prefer DB meta; fall back to inline bilingual meta
    const source = meta ?? INLINE_META[lang] ?? INLINE_META.en;

    const result = buildPagedResult(source, items, {
      page:  req.query.page,
      limit: req.query.limit,
    });

    ok(res, result);
  } catch (err) { next(err); }
});

// ── GET /api/communities/:id ──────────────────────────────────────────────────

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Community.findOne({ ID: Number(req.params.id) }).lean();
    if (!doc) return notFound(res);
    ok(res, flattenCommunity(doc));
  } catch (err) { next(err); }
});

// ── POST /api/communities ─────────────────────────────────────────────────────

router.post('/', async (req, res, next) => {
  try {
    const doc = await Community.create(req.body);
    created(res, flattenCommunity(doc.toObject ? doc.toObject() : doc));
  } catch (err) { next(err); }
});

// ── PUT /api/communities/:id ──────────────────────────────────────────────────

router.put('/:id', async (req, res, next) => {
  try {
    const doc = await Community.findOneAndUpdate(
      { ID: Number(req.params.id) },
      { ...req.body, UPDATED_AT: new Date() },
      { new: true, runValidators: true },
    ).lean();
    if (!doc) return notFound(res);
    ok(res, flattenCommunity(doc));
  } catch (err) { next(err); }
});

// ── DELETE /api/communities/:id ───────────────────────────────────────────────

router.delete('/:id', async (req, res, next) => {
  try {
    const doc = await Community.findOneAndDelete({ ID: Number(req.params.id) });
    if (!doc) return notFound(res);
    noContent(res);
  } catch (err) { next(err); }
});

module.exports = router;