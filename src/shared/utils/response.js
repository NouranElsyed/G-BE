/**
 * Unified HTTP response helpers.
 * Every endpoint in this codebase uses exactly one of these.
 */

const ok = (res, result, message = '') =>
  res.json({
    success: 1,
    message: { type: 'success', texts: message ? [message] : [] },
    result,
  });

const created = (res, result, message = 'Created') =>
  res.status(201).json({
    success: 1,
    message: { type: 'success', texts: [message] },
    result,
  });

const notFound = (res, message = 'Not found') =>
  res.status(404).json({
    success: 0,
    message: { type: 'error', texts: [message] },
    result: null,
  });

const badRequest = (res, message = 'Bad request') =>
  res.status(400).json({
    success: 0,
    message: { type: 'error', texts: [message] },
    result: null,
  });

const serverError = (res, message = 'Internal server error') =>
  res.status(500).json({
    success: 0,
    message: { type: 'error', texts: [message] },
    result: null,
  });

module.exports = { ok, created, notFound, badRequest, serverError };
