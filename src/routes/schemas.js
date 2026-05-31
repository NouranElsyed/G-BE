const express = require("express");
const router = express.Router();
const MsgSchema = require("../models/schema.model");
const CollectionMeta = require("../models/collectionMeta.model");
const { buildResponse } = require("../shared/utils/buildResponse");

// ── GET /api/schemas ───────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const lang = req.lang;
    const [meta, schemas] = await Promise.all([
      CollectionMeta.findOne({ collection: "schemas", lang }).lean(),
      MsgSchema.find({}).lean(),
    ]);

    if (!meta)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Meta not found"] },
          result: null,
        });

    res.json(buildResponse(meta, schemas));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/schemas/:id ───────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const schema = await MsgSchema.findOne({
      id: Number(req.params.id),
    }).lean();
    if (!schema)
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
      result: schema,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/schemas ──────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const schema = await MsgSchema.create(req.body);
    res
      .status(201)
      .json({
        success: 1,
        message: { type: "success", texts: ["Created"] },
        result: schema,
      });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/schemas/:id ───────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const schema = await MsgSchema.findOneAndUpdate(
      { id: Number(req.params.id) },
      { ...req.body, updated_at: new Date() },
      { new: true, runValidators: true },
    ).lean();
    if (!schema)
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
      result: schema,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/schemas/:id ────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const schema = await MsgSchema.findOneAndDelete({
      id: Number(req.params.id),
    });
    if (!schema)
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
