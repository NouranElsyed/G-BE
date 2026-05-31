/**
 * Global error handler.
 * Must be the last app.use() in index.js.
 *
 * - AppError  → use its status and message (operational, expected)
 * - Other     → 500 (programmer error / unexpected)
 */
const errorHandler = (err, req, res, _next) => {
  const status  = err.status ?? 500;
  const message = err.status ? err.message : 'Internal server error';

  // Log unexpected errors (not operational AppErrors)
  if (!err.status) console.error('[ERROR]', err);

  res.status(status).json({
    success: 0,
    message: { type: 'error', texts: [message] },
    result:  null,
  });
};

module.exports = errorHandler;
