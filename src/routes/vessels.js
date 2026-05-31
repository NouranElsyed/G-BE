const express = require("express");
const router = express.Router();
const Vessel = require("../models/vessel.model");
const CollectionMeta = require("../models/collectionMeta.model");
const { buildResponse } = require("../shared/utils/buildResponse");

// ── GET /api/vessels ───────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const lang = req.lang; // 'en' | 'ar'
    const [meta, vessels] = await Promise.all([
      CollectionMeta.findOne({ collection: "vessels", lang }).lean(),
      Vessel.find({}).lean(),
    ]);

    if (!meta)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Meta not found"] },
          result: null,
        });

    // Flatten i18n into each item
    const items = vessels.map((v) => ({
      vessel_id: v.vessel_id,
      vessel_name: v.vessel_name,
      vessel_imo: v.vessel_imo,
      vessel_call_sign: v.vessel_call_sign,
      vessel_type: v.vessel_type,
      vessel_country: v.vessel_country,
      vessel_agency_code: v.vessel_agency_code,
      vessel_updated_at: v.vessel_updated_at,
      ...v.i18n?.[lang],
    }));

    res.json(buildResponse(meta, items));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/vessels/:id ───────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const lang = req.lang;
    const vessel = await Vessel.findOne({
      vessel_id: Number(req.params.id),
    }).lean();
    if (!vessel)
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
        vessel_id: vessel.vessel_id,
        vessel_name: vessel.vessel_name,
        vessel_imo: vessel.vessel_imo,
        vessel_call_sign: vessel.vessel_call_sign,
        vessel_type: vessel.vessel_type,
        vessel_country: vessel.vessel_country,
        vessel_agency_code: vessel.vessel_agency_code,
        vessel_updated_at: vessel.vessel_updated_at,
        ...vessel.i18n?.[lang],
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/vessels ──────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const vessel = await Vessel.create(req.body);
    res
      .status(201)
      .json({
        success: 1,
        message: { type: "success", texts: ["Created"] },
        result: vessel,
      });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/vessels/:id ───────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const vessel = await Vessel.findOneAndUpdate(
      { vessel_id: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true },
    ).lean();
    if (!vessel)
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
      result: vessel,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/vessels/:id ────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const vessel = await Vessel.findOneAndDelete({
      vessel_id: Number(req.params.id),
    });
    if (!vessel)
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
