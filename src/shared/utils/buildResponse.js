/**
 * buildResponse — constructs the paginated list response shape
 * the frontend rendering engine expects.
 *
 * shape:
 * {
 *   success: 1,
 *   message: { type: 'string', texts: [] },
 *   result: {
 *     paging:    { page_title, total_items, … },
 *     meta_data: [ { secondary_code, name, … } ],
 *     items:     [ … ],
 *     labels?:   { … }
 *   }
 * }
 */

/**
 * @param {object} meta   - CollectionMeta document (from Mongoose)
 * @param {any[]}  items  - items to return
 * @param {object} [opts]
 * @param {number} [opts.page=1]
 * @param {number} [opts.limit]  - overrides items_per_page
 */
function buildResponse(meta, items, opts = {}) {
  const page      = opts.page  ?? 1;
  const perPage   = opts.limit ?? meta.paging?.items_per_page ?? 24;
  const total     = items.length;
  const totalPages = Math.ceil(total / perPage) || 1;

  const start = (page - 1) * perPage;
  const end   = Math.min(start + perPage, total);
  const slice = items.slice(start, end);

  return {
    success: 1,
    message: { type: 'string', texts: [] },
    result: {
      paging: {
        page_title:     meta.paging?.page_title    ?? null,
        page_subtitle:  meta.paging?.page_subtitle ?? null,
        total_items:    total,
        start_item:     total === 0 ? 0 : start + 1,
        end_item:       end,
        items_per_page: perPage,
        total_pages:    totalPages,
        current_page:   page,
      },
      meta_data: meta.fields ?? [],
      ...(meta.labels && Object.keys(meta.labels).length ? { labels: meta.labels } : {}),
      items: slice,
    },
  };
}

module.exports = { buildResponse };
