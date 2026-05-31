/**
 * Response Builder — Unified HTTP response factory.
 *
 * Every endpoint in the system MUST use these helpers.
 * The envelope shape is the contract the Angular frontend depends on:
 *
 *   { success: 1|0|2, messages: null | { type, texts[] }, result: any }
 *
 * success codes:
 *   1 = Success
 *   0 = Failure
 *   2 = Warning
 */

// ── Envelope helpers ──────────────────────────────────────────────────────────

const envelope = (success, messages, result) => ({ success, messages, result });

const successEnvelope  = (result)  => envelope(1, null, result);
const failureEnvelope  = (texts)   => envelope(0, { type: 'error',   texts: Array.isArray(texts) ? texts : [texts] }, null);
const warningEnvelope  = (result, texts) => envelope(2, { type: 'warning', texts: Array.isArray(texts) ? texts : [texts] }, result);

// ── HTTP response helpers ─────────────────────────────────────────────────────

const ok = (res, result) =>
  res.status(200).json(successEnvelope(result));

const created = (res, result) =>
  res.status(201).json(successEnvelope(result));

const noContent = (res) =>
  res.status(200).json(successEnvelope(null));

const notFound = (res, message = 'Not found') =>
  res.status(404).json(failureEnvelope(message));

const badRequest = (res, message = 'Bad request') =>
  res.status(400).json(failureEnvelope(message));

const unauthorized = (res, message = 'Unauthorized') =>
  res.status(401).json(failureEnvelope(message));

const forbidden = (res, message = 'Forbidden') =>
  res.status(403).json(failureEnvelope(message));

const serverError = (res, message = 'Internal server error') =>
  res.status(500).json(failureEnvelope(message));

module.exports = {
  envelope,
  successEnvelope,
  failureEnvelope,
  warningEnvelope,
  ok,
  created,
  noContent,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  serverError,
};
