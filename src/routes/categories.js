const express = require("express");
const router = express.Router();
const Category = require("../models/category.model");
const CollectionMeta = require("../models/collectionMeta.model");
const { buildResponse } = require("../shared/utils/buildResponse");

// ── GET /api/categories ────────────────────────────────────────────
// Items are module-grouped (each item = one module + its entities tree)
router.get("/", async (req, res, next) => {
  try {
    const lang = req.lang;
    const [meta, modules] = await Promise.all([
      CollectionMeta.findOne({ collection: "categories", lang }).lean(),
      Category.find({}).lean(),
    ]);

    if (!meta)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Meta not found"] },
          result: null,
        });

    // Strip Mongoose internals, keep the module+entities structure
    const items = modules.map(({ _id, __v, ...rest }) => rest);

    res.json(buildResponse(meta, items));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/categories/:moduleCode ───────────────────────────────
router.get("/:moduleCode", async (req, res, next) => {
  try {
    const category = await Category.findOne({
      module_code: req.params.moduleCode.toUpperCase(),
    }).lean();
    if (!category)
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
      result: category,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/categories ───────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const category = await Category.create(req.body);
    res
      .status(201)
      .json({
        success: 1,
        message: { type: "success", texts: ["Created"] },
        result: category,
      });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/categories/:moduleCode ───────────────────────────────
router.put("/:moduleCode", async (req, res, next) => {
  try {
    const category = await Category.findOneAndUpdate(
      { module_code: req.params.moduleCode.toUpperCase() },
      req.body,
      { new: true, runValidators: true },
    ).lean();
    if (!category)
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
      result: category,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/categories/:moduleCode ────────────────────────────
router.delete("/:moduleCode", async (req, res, next) => {
  try {
    const category = await Category.findOneAndDelete({
      module_code: req.params.moduleCode.toUpperCase(),
    });
    if (!category)
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
