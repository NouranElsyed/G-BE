const express        = require('express');
const User           = require('../../../models/user.model');
const CollectionMeta = require('../../../models/collectionMeta.model');
const { buildPagedResult } = require('../../../shared/paging/paging.builder');
const { ok, created, noContent, notFound } = require('../../../shared/response/response.builder');

const router = express.Router();

function flattenUser(user, lang) {
  return {
    id:           user.id,
    email:        user.email,
    phone:        user.phone,
    organization: user.organization?.i18n?.[lang]?.org_name ?? null,
    ...user.i18n?.[lang],
  };
}

// ── GET /api/users ────────────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const lang = req.lang || 'en';
    const [meta, users] = await Promise.all([
      CollectionMeta.findOne({ collection: 'users', lang }).lean(),
      User.find({}).lean(),
    ]);

    // Only public fields in list view
    const listMeta = meta
      ? { ...meta, fields: (meta.fields ?? []).filter(f => f.is_public === 1) }
      : null;

    const items  = users.map(u => flattenUser(u, lang));
    const result = buildPagedResult(listMeta ?? { paging: { page_title: 'Users' }, fields: [] }, items, {
      page: req.query.page, limit: req.query.limit,
    });

    ok(res, result);
  } catch (err) { next(err); }
});

// ── GET /api/users/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const lang = req.lang || 'en';
    const [meta, user] = await Promise.all([
      CollectionMeta.findOne({ collection: 'users', lang }).lean(),
      User.findOne({ id: Number(req.params.id) }).lean(),
    ]);

    if (!user) return notFound(res);

    const detailFields = (meta?.fields ?? []).filter(f => f.is_public >= 0);

    ok(res, {
      meta_data: detailFields,
      labels:    meta?.labels ?? {},
      item: {
        id:                user.id,
        username:          user.username,
        email:             user.email,
        phone:             user.phone,
        organization:      user.organization?.i18n?.[lang]?.org_name ?? null,
        organization_id:   user.organization?.org_id ?? null,
        organization_code: user.organization?.org_code ?? null,
        createdAt:         user.createdAt ?? null,
        updatedAt:         user.updatedAt ?? null,
        ...user.i18n?.[lang],
      },
    });
  } catch (err) { next(err); }
});

// ── POST /api/users ───────────────────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    created(res, user.toObject());
  } catch (err) { next(err); }
});

// ── PUT /api/users/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      { id: Number(req.params.id) }, req.body,
      { new: true, runValidators: true },
    ).lean();
    if (!user) return notFound(res);
    ok(res, user);
  } catch (err) { next(err); }
});

// ── DELETE /api/users/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({ id: Number(req.params.id) });
    if (!user) return notFound(res);
    noContent(res);
  } catch (err) { next(err); }
});

module.exports = router;
