const express = require("express");
const router = express.Router();
const Message = require("../models/message.model");
const CollectionMeta = require("../models/collectionMeta.model");
const { buildResponse } = require("../shared/utils/buildResponse");

// ── GET /api/messages ──────────────────────────────────────────────
// Query params: ?conversationId=  &status=  &senderId=  &receiverId=
router.get("/", async (req, res, next) => {
  try {
    const lang = req.lang;
    const filter = {};
    if (req.query.conversationId)
      filter.conversationId = Number(req.query.conversationId);
    if (req.query.status) filter.status = req.query.status;
    if (req.query.senderId) filter.senderId = Number(req.query.senderId);
    if (req.query.receiverId) filter.receiverId = Number(req.query.receiverId);

    const [meta, messages] = await Promise.all([
      CollectionMeta.findOne({ collection: "messages", lang }).lean(),
      Message.find(filter).sort({ sentAt: -1 }).lean(),
    ]);

    if (!meta)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Meta not found"] },
          result: null,
        });

    res.json(buildResponse(meta, messages));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/messages/:id ──────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const message = await Message.findOne({ id: Number(req.params.id) }).lean();
    if (!message)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Not found"] },
          result: null,
        });
    res.json({
      success: 1,
      message: { type: "string", texts: [] },
      result: message,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/messages ─────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const message = await Message.create({
      ...req.body,
      sentAt: req.body.sentAt ?? new Date(),
    });
    res
      .status(201)
      .json({
        success: 1,
        message: { type: "success", texts: ["Created"] },
        result: message,
      });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/messages/:id ──────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const message = await Message.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true },
    ).lean();
    if (!message)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Not found"] },
          result: null,
        });
    res.json({
      success: 1,
      message: { type: "success", texts: ["Updated"] },
      result: message,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/messages/:id ───────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const message = await Message.findOneAndDelete({
      id: Number(req.params.id),
    });
    if (!message)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Not found"] },
          result: null,
        });
    res.json({
      success: 1,
      message: { type: "success", texts: ["Deleted"] },
      result: null,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
