/**
 * Generic CRUD Route Factory
 *
 * Generates a standard Express router with full CRUD for any Mongoose model
 * that has a CollectionMeta entry in MongoDB.
 *
 * Contract enforced:
 *   GET    /           → paged list  { paging, meta_data, items }
 *   GET    /:id        → single item { result }
 *   POST   /           → create      { result }
 *   PUT    /:id        → update      { result }
 *   DELETE /:id        → delete      { result: null }
 *
 * Usage:
 *   const router = createCrudRouter({
 *     collection:  'vessels',        // CollectionMeta collection key
 *     Model:       Vessel,           // Mongoose model
 *     idField:     'vessel_id',      // Primary key field on the document
 *     idType:      'number',         // 'number' | 'string'
 *     flatten:     (doc, lang) => ({ ... }),  // optional item transformer
 *   });
 */

const express   = require('express');
const CollectionMeta = require('../../models/collectionMeta.model');
const { buildPagedResult, buildFallbackPagedResult } = require('../paging/paging.builder');
const { ok, created, noContent, notFound, serverError } = require('../response/response.builder');

/**
 * @param {object}   opts
 * @param {string}   opts.collection   - CollectionMeta key
 * @param {object}   opts.Model        - Mongoose model
 * @param {string}   opts.idField      - primary key field name
 * @param {string}   [opts.idType]     - 'number' | 'string' (default: 'number')
 * @param {Function} [opts.flatten]    - (doc, lang) => plain object
 * @param {Function} [opts.buildFilter]- (req) => mongoose filter object
 * @param {Function} [opts.buildSort]  - (req) => mongoose sort object
 * @param {Function} [opts.normalizeId]- (raw) => normalized id (overrides idType casting)
 * @returns {express.Router}
 */
function createCrudRouter(opts) {
  const {
    collection,
    Model,
    idField,
    idType      = 'number',
    flatten     = (doc) => doc,
    buildFilter = () => ({}),
    buildSort   = () => ({}),
    normalizeId = null,
  } = opts;

  const router = express.Router();

  // ── Helpers ─────────────────────────────────────────────────────────────────

  function castId(raw) {
    if (normalizeId) return normalizeId(raw);
    return idType === 'number' ? Number(raw) : String(raw);
  }

  function stripMeta(doc) {
    if (!doc) return doc;
    const { _id, __v, ...rest } = doc;
    return rest;
  }

  // ── GET / ────────────────────────────────────────────────────────────────────
  router.get('/', async (req, res, next) => {
    try {
      const lang   = req.lang || 'en';
      const filter = buildFilter(req);
      const sort   = buildSort(req);

      const [meta, docs] = await Promise.all([
        CollectionMeta.findOne({ collection, lang }).lean(),
        Model.find(filter).sort(sort).lean(),
      ]);

      const items = docs.map(d => flatten(stripMeta(d), lang));

      const result = meta
        ? buildPagedResult(meta, items, { page: req.query.page, limit: req.query.limit })
        : buildFallbackPagedResult(collection, items, { page: req.query.page, limit: req.query.limit });

      ok(res, result);
    } catch (err) { next(err); }
  });

  // ── GET /:id ─────────────────────────────────────────────────────────────────
  router.get('/:id', async (req, res, next) => {
    try {
      const lang = req.lang || 'en';
      const doc  = await Model.findOne({ [idField]: castId(req.params.id) }).lean();
      if (!doc) return notFound(res);
      ok(res, flatten(stripMeta(doc), lang));
    } catch (err) { next(err); }
  });

  // ── POST / ───────────────────────────────────────────────────────────────────
  router.post('/', async (req, res, next) => {
    try {
      const doc = await Model.create(req.body);
      created(res, stripMeta(doc.toObject ? doc.toObject() : doc));
    } catch (err) { next(err); }
  });

  // ── PUT /:id ─────────────────────────────────────────────────────────────────
  router.put('/:id', async (req, res, next) => {
    try {
      const doc = await Model.findOneAndUpdate(
        { [idField]: castId(req.params.id) },
        req.body,
        { new: true, runValidators: true },
      ).lean();
      if (!doc) return notFound(res);
      ok(res, stripMeta(doc));
    } catch (err) { next(err); }
  });

  // ── DELETE /:id ──────────────────────────────────────────────────────────────
  router.delete('/:id', async (req, res, next) => {
    try {
      const doc = await Model.findOneAndDelete({ [idField]: castId(req.params.id) });
      if (!doc) return notFound(res);
      noContent(res);
    } catch (err) { next(err); }
  });

  return router;
}

module.exports = { createCrudRouter };
