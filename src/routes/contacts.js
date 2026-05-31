const express = require("express");
const router = express.Router();
const Contact = require("../models/contact.model");
const CollectionMeta = require("../models/collectionMeta.model");
const { buildResponse } = require("../shared/utils/buildResponse");

// ── GET /api/contacts ──────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    const lang = req.lang;
    const [meta, contacts] = await Promise.all([
      CollectionMeta.findOne({ collection: "contacts", lang }).lean(),
      Contact.find({}).lean(),
    ]);

    if (!meta)
      return res
        .status(404)
        .json({
          success: 0,
          message: { type: "error", texts: ["Meta not found"] },
          result: null,
        });

    res.json(buildResponse(meta, contacts));
  } catch (err) {
    next(err);
  }
});

// ── GET /api/contacts/:id ──────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ id: Number(req.params.id) }).lean();
    if (!contact)
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
      result: contact,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/contacts ─────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const contact = await Contact.create(req.body);
    res
      .status(201)
      .json({
        success: 1,
        message: { type: "success", texts: ["Created"] },
        result: contact,
      });
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/contacts/:id ──────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndUpdate(
      { id: Number(req.params.id) },
      req.body,
      { new: true, runValidators: true },
    ).lean();
    if (!contact)
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
      result: contact,
    });
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/contacts/:id ───────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const contact = await Contact.findOneAndDelete({
      id: Number(req.params.id),
    });
    if (!contact)
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
