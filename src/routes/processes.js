const express = require("express");
const router = express.Router();
const Process = require("../models/process.model");
const CollectionMeta = require("../models/collectionMeta.model");
const { buildResponse } = require("../shared/utils/buildResponse");

// ── GET /api/processes ─────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const lang = req.lang;
    const [meta, processes] = await Promise.all([
      CollectionMeta.findOne({ collection: "processes", lang }).lean(),
      Process.find({}).lean(),
    ]);

    if (!meta)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Meta not found"] },
          result: null,
        });

    // Process model ليس عنده i18n — الـ fields مباشرة
    const items = processes.map((p) => ({
      code: p.code,
      secondaryCode: p.secondaryCode,
      nameCode: p.nameCode,
      descriptionCode: p.descriptionCode,
      attachmentId: p.attachmentId,
      createdById: p.createdById,
      updatedById: p.updatedById,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.json(buildResponse(meta, items));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/processes/:code ───────────────────────────────────────
router.get("/:code", async (req, res, next) => {
  try {
    const process = await Process.findOne({ code: req.params.code }).lean();
    if (!process)
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
      result: process,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/processes ────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const process = await Process.create(req.body);
    res
      .status(201)
      .json({
        success: 1,
        message: { type: "success", texts: ["Created"] },
        result: process,
      });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/processes/:code ───────────────────────────────────────
router.put("/:code", async (req, res, next) => {
  try {
    const process = await Process.findOneAndUpdate(
      { code: req.params.code },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).lean();
    if (!process)
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
      result: process,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/processes/:code ────────────────────────────────────
router.delete("/:code", async (req, res, next) => {
  try {
    const process = await Process.findOneAndDelete({ code: req.params.code });
    if (!process)
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
