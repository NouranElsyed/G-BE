const express = require("express");
const router = express.Router();
const Community = require("../models/community.model");
const CollectionMeta = require("../models/collectionMeta.model");
const { buildResponse } = require("../shared/utils/buildResponse");

// ── GET /api/communities ───────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const lang = req.lang;
    const [meta, items] = await Promise.all([
      CollectionMeta.findOne({ collection: "communities", lang }).lean(),
      Community.find({}).lean(),
    ]);

    if (!meta)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Meta not found"] },
          result: null,
        });

    res.json(buildResponse(meta, items));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/communities/:id ───────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const community = await Community.findOne({
      ID: Number(req.params.id),
    }).lean();
    if (!community)
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
      result: community,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/communities ──────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const community = await Community.create(req.body);
    res
      .status(201)
      .json({
        success: 1,
        message: { type: "success", texts: ["Created"] },
        result: community,
      });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/communities/:id ───────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const community = await Community.findOneAndUpdate(
      { ID: Number(req.params.id) },
      { ...req.body, UPDATED_AT: new Date() },
      { new: true, runValidators: true },
    ).lean();
    if (!community)
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
      result: community,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/communities/:id ────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const community = await Community.findOneAndDelete({
      ID: Number(req.params.id),
    });
    if (!community)
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
