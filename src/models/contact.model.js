const { Schema, model, models } = require('mongoose');

// Contacts — flat model, no i18n (اللي في الـ JSON مباشر بدون nested)
const ContactSchema = new Schema(
  {
    id:       { type: Number, required: true, unique: true },
    code:     { type: String, default: null, trim: true },
    name:     { type: String, required: true, trim: true },
    email:    { type: String, default: null, lowercase: true, trim: true },
    phone:    { type: String, default: null },
    landline: { type: String, default: null },
    role:     { type: String, default: null },
    status:   { type: String, default: 'Active' },
  },
  { timestamps: false, versionKey: false }
);

ContactSchema.index({ email: 1 });
ContactSchema.index({ status: 1 });

module.exports = models['Contact'] || model('Contact', ContactSchema);
