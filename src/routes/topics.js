const express = require("express");
const router = express.Router();
const Topic = require("../models/topic.model");
const CollectionMeta = require("../models/collectionMeta.model");
const { buildResponse } = require("../shared/utils/buildResponse");

// ── GET /api/topics ────────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const lang = req.lang;
    const isAr = lang === "ar";

    const [meta, topics] = await Promise.all([
      CollectionMeta.findOne({ collection: "topics", lang }).lean(),
      Topic.find({}).lean(),
    ]);

    if (!meta)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Meta not found"] },
          result: null,
        });

    const items = topics.map((t) => ({
      code: t.code,
      name: isAr ? t.name_ar || t.name : t.name,
      status: t.status,
      category: isAr ? t.category_ar || t.category : t.category,
      domain: t.domain,
      description: isAr ? t.description_ar || t.description : t.description,
      tags: isAr ? t.tags_ar || t.tags : t.tags,
    }));

    res.json(buildResponse(meta, items));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/topics/:code ──────────────────────────────────────────
router.get("/:code", async (req, res, next) => {
  try {
    const lang = req.lang;
    const isAr = lang === "ar";
    const topic = await Topic.findOne({ code: req.params.code }).lean();
    if (!topic)
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
      result: {
        code: topic.code,
        name: isAr ? topic.name_ar || topic.name : topic.name,
        status: topic.status,
        category: isAr ? topic.category_ar || topic.category : topic.category,
        domain: topic.domain,
        description: isAr
          ? topic.description_ar || topic.description
          : topic.description,
        tags: isAr ? topic.tags_ar || topic.tags : topic.tags,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/topics ───────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const topic = await Topic.create(req.body);
    res
      .status(201)
      .json({
        success: 1,
        message: { type: "success", texts: ["Created"] },
        result: topic,
      });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/topics/:code ──────────────────────────────────────────
router.put("/:code", async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndUpdate(
      { code: req.params.code },
      req.body,
      { new: true, runValidators: true },
    ).lean();
    if (!topic)
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
      result: topic,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/topics/:code ───────────────────────────────────────
router.delete("/:code", async (req, res, next) => {
  try {
    const topic = await Topic.findOneAndDelete({ code: req.params.code });
    if (!topic)
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
