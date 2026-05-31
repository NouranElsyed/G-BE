const { Schema, model, models } = require('mongoose');

// ── Must match the Angular UserPreferences interface exactly ──────
const UserPreferencesSchema = new Schema(
  {
    // Link to the user
    userId: { type: Number, required: true, unique: true },

    // ─── Appearance ───────────────────────────────────────────────
    language: {
      type: String,
      enum: ['en', 'ar'],
      default: 'en',
    },
    darkMode: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      enum: ['Aura', 'Lara', 'Nora'],
      default: 'Aura',
    },
    primaryColor: {
      type: String,
      enum: [
        'emerald', 'sky', 'violet', 'rose', 'amber',
        'cyan', 'pink', 'indigo', 'orange', 'teal',
        'green', 'blue',
      ],
      default: 'sky',
    },

    // ─── Typography ───────────────────────────────────────────────
    fontSize: {
      type: String,
      enum: ['sm', 'md', 'lg'],
      default: 'md',
    },

    // ─── Layout ───────────────────────────────────────────────────
    menuMode: {
      type: String,
      enum: ['static', 'overlay'],
      default: 'static',
    },
    layoutDensity: {
      type: String,
      enum: ['compact', 'comfortable', 'spacious'],
      default: 'comfortable',
    },
  },
  {
    timestamps: true,   // createdAt + updatedAt auto-managed
    versionKey: false,
  }
);

module.exports = models['UserPreferences'] || model('UserPreferences', UserPreferencesSchema);
