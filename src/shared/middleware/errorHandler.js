/**
 * Global Error Handler — must be the last app.use() in index.js.
 *
 * AppError  → operational error, use its status + message
 * Other     → programmer error, return 500
 */
const errorHandler = (err, req, res, _next) => {
  const status  = err.status ?? 500;
  const message = err.status ? err.message : 'Internal server error';

  if (!err.status) console.error('[UNHANDLED ERROR]', err);

  res.status(status).json({
    success: 0,
    messages: { type: 'error', texts: [message] },
    result: null,
  });
};

module.exports = errorHandler;
