const express = require("express");
const router = express.Router();
const Conversation = require("../models/conversation.model");
const CollectionMeta = require("../models/collectionMeta.model");
const { buildResponse } = require("../shared/utils/buildResponse");

// ── GET /api/conversations ─────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const lang = req.lang;
    const [meta, convs] = await Promise.all([
      CollectionMeta.findOne({ collection: "conversations", lang }).lean(),
      Conversation.find({}).lean(),
    ]);

    if (!meta)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Meta not found"] },
          result: null,
        });

    // Conversation fields are already flat (UPPER_CASE) — serve as-is
    const items = convs.map((c) => {
      const { _id, __v, ...rest } = c;
      return rest;
    });

    res.json(buildResponse(meta, items));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/conversations/:id ─────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const conv = await Conversation.findOne({
      ID: Number(req.params.id),
    }).lean();
    if (!conv)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Not found"] },
          result: null,
        });
    const { _id, __v, ...rest } = conv;
    res.json({
      success: 1,
      message: { type: "string", texts: [] },
      result: rest,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/conversations ────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const conv = await Conversation.create(req.body);
    res
      .status(201)
      .json({
        success: 1,
        message: { type: "success", texts: ["Created"] },
        result: conv,
      });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/conversations/:id ─────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const conv = await Conversation.findOneAndUpdate(
      { ID: Number(req.params.id) },
      { ...req.body, UPDATED_AT: new Date() },
      { new: true, runValidators: true },
    ).lean();
    if (!conv)
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
      result: conv,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/conversations/:id ─────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const conv = await Conversation.findOneAndDelete({
      ID: Number(req.params.id),
    });
    if (!conv)
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
