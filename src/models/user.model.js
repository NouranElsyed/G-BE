
const { Schema, model, models } = require('mongoose');

const UserSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: null,
    },

    // ── Organisation ─────────────────────────────────────────────
    organization: {
      org_id: {
        type: Number,
        default: null,
      },

      org_code: {
        type: String,
        default: null,
      },

      i18n: {
        en: {
          org_name: {
            type: String,
            default: null,
          },
        },

        ar: {
          org_name: {
            type: String,
            default: null,
          },
        },
      },
    },

    // ── Localized fields ────────────────────────────────────────
    i18n: {
      en: {
        name: {
          type: String,
          default: null,
        },

        role: {
          type: String,
          default: 'USER',
        },

        status: {
          type: String,
          default: 'Active',
        },
      },

      ar: {
        name: {
          type: String,
          default: null,
        },

        role: {
          type: String,
          default: null,
        },

        status: {
          type: String,
          default: null,
        },
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = models.User || model('User', UserSchema);

