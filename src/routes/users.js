
const express = require('express');

const router = express.Router();

const User = require('../models/user.model');
const CollectionMeta = require('../models/collectionMeta.model');

const { buildResponse } = require('../shared/utils/buildResponse');

// ── GET /api/users ───────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const lang = req.lang;

    const [meta, users] = await Promise.all([
      CollectionMeta.findOne({
        collection: 'users',
        lang,
      }).lean(),

      User.find({}).lean(),
    ]);

    if (!meta) {
      return res.status(404).json({
        success: 0,
        message: {
          type: 'error',
          texts: ['Meta not found'],
        },
        result: null,
      });
    }

    const listMeta = {
      ...meta,
      fields: (meta.fields ?? []).filter(
        (field) => field.is_public === 1
      ),
    };

    const items = users.map((user) => ({
      id: user.id,
      email: user.email,
      phone: user.phone,

      organization:
        user.organization?.i18n?.[lang]?.org_name ?? null,

      ...user.i18n?.[lang],
    }));

    return res.json(
      buildResponse(listMeta, items)
    );
  } catch (error) {
    next(error);
  }
});

// ── GET /api/users/:id ───────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const lang = req.lang;

    const [meta, user] = await Promise.all([
      CollectionMeta.findOne({
        collection: 'users',
        lang,
      }).lean(),

      User.findOne({
        id: Number(req.params.id),
      }).lean(),
    ]);

    if (!user) {
      return res.status(404).json({
        success: 0,
        message: {
          type: 'error',
          texts: ['User not found'],
        },
        result: null,
      });
    }

    const detailFields = (meta?.fields ?? []).filter(
      (field) => field.is_public >= 0
    );

    const item = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,

      organization:
        user.organization?.i18n?.[lang]?.org_name ?? null,

      organization_id:
        user.organization?.org_id ?? null,

      organization_code:
        user.organization?.org_code ?? null,

      createdAt: user.createdAt ?? null,
      updatedAt: user.updatedAt ?? null,

      ...user.i18n?.[lang],
    };

    return res.json({
      success: 1,

      message: {
        type: 'string',
        texts: [],
      },

      result: {
        meta_data: detailFields,
        labels: meta?.labels ?? {},
        item,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/users ──────────────────────────────────────────────
router.post('/', async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    return res.status(201).json({
      success: 1,

      message: {
        type: 'success',
        texts: ['Created'],
      },

      result: user,
    });
  } catch (error) {
    next(error);
  }
});

// ── PUT /api/users/:id ───────────────────────────────────────────
router.put('/:id', async (req, res, next) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        id: Number(req.params.id),
      },

      req.body,

      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!user) {
      return res.status(404).json({
        success: 0,

        message: {
          type: 'error',
          texts: ['Not found'],
        },

        result: null,
      });
    }

    return res.json({
      success: 1,

      message: {
        type: 'success',
        texts: ['Updated'],
      },

      result: user,
    });
  } catch (error) {
    next(error);
  }
});

// ── DELETE /api/users/:id ────────────────────────────────────────
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await User.findOneAndDelete({
      id: Number(req.params.id),
    });

    if (!user) {
      return res.status(404).json({
        success: 0,

        message: {
          type: 'error',
          texts: ['Not found'],
        },

        result: null,
      });
    }

    return res.json({
      success: 1,

      message: {
        type: 'success',
        texts: ['Deleted'],
      },

      result: null,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

