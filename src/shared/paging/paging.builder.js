/**
 * Paging Builder — builds the standard paginated result shape.
 *
 * The Angular GenericTableComponent depends on this exact shape:
 *
 * {
 *   paging:    { page_title, page_subtitle, total_items, ... }
 *   meta_data: [ { secondary_code, name, type, is_public, order, ... } ]
 *   items:     [ ... ]
 *   labels?:   { ... }
 * }
 *
 * Every list endpoint MUST return this shape — no exceptions.
 */

/**
 * Builds a paginated response result object.
 *
 * @param {object}   meta       - CollectionMeta document (from MongoDB)
 * @param {any[]}    allItems   - full unsliced items array
 * @param {object}   [opts]
 * @param {number}   [opts.page=1]
 * @param {number}   [opts.limit]  - overrides meta.paging.items_per_page
 * @returns {object} result object ready for successEnvelope
 */
function buildPagedResult(meta, allItems, opts = {}) {
  const page    = Math.max(1, parseInt(opts.page) || 1);
  const perPage = Math.max(1, parseInt(opts.limit) || meta?.paging?.items_per_page || 24);
  const total   = allItems.length;
  const pages   = Math.ceil(total / perPage) || 1;
  const start   = (page - 1) * perPage;
  const end     = Math.min(start + perPage, total);

  const result = {
    paging: {
      page_title:     meta?.paging?.page_title    ?? null,
      page_subtitle:  meta?.paging?.page_subtitle ?? null,
      total_items:    total,
      start_item:     total === 0 ? 0 : start + 1,
      end_item:       end,
      items_per_page: perPage,
      total_pages:    pages,
      current_page:   page,
    },
    meta_data: meta?.fields ?? [],
    items:     allItems.slice(start, end),
  };

  // Attach labels only when present (used by forms and dropdown lookups)
  if (meta?.labels && Object.keys(meta.labels).length > 0) {
    result.labels = meta.labels;
  }

  return result;
}

/**
 * Builds a minimal paging block when no CollectionMeta exists.
 * Allows graceful degradation — returns data without column metadata.
 *
 * @param {string}  pageTitle
 * @param {any[]}   items
 * @param {object}  [opts]
 */
function buildFallbackPagedResult(pageTitle, items, opts = {}) {
  return buildPagedResult(
    { paging: { page_title: pageTitle }, fields: [] },
    items,
    opts,
  );
}

module.exports = { buildPagedResult, buildFallbackPagedResult };
