/**
 * seed_preferences.js
 * بيعمل UserPreferences document لكل user في الـ DB
 * بـ default values (language: 'en', darkMode: false, …)
 *
 * تشغيل: node seed/seed_preferences.js
 */

require('dotenv').config();
const mongoose        = require('mongoose');
const User            = require('../models/user.model');
const UserPreferences = require('../models/userPreferences.model');

// ── Default preferences per user ──────────────────────────────────
// User id=1 (Admin) → Arabic, User id=2 (Nora) → Arabic, الباقي → English
// غيّر حسب اللي تحتاجه
const LANG_OVERRIDES = {
  1: 'ar',
  2: 'ar',
};

async function main() {
  console.log('\n🌱 Connecting…');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected\n');

  const users = await User.find({}).lean();
  console.log(`👥 Found ${users.length} users\n`);

  let created = 0, skipped = 0;

  for (const user of users) {
    const exists = await UserPreferences.findOne({ userId: user.id });
    if (exists) {
      console.log(`  ⏭️  userId=${user.id} already has preferences — skipped`);
      skipped++;
      continue;
    }

    const language = LANG_OVERRIDES[user.id] ?? 'en';

    await UserPreferences.create({
      userId:        user.id,
      language,
      darkMode:      false,
      theme:         'Aura',
      primaryColor:  'sky',
      fontSize:      'md',
      menuMode:      'static',
      layoutDensity: 'comfortable',
    });

    console.log(`  ✅ userId=${user.id} → language=${language}`);
    created++;
  }

  console.log(`\n🎉 Done — created: ${created}, skipped: ${skipped}\n`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  mongoose.disconnect();
  process.exit(1);
});