# 🗄️ MongoDB Local Setup Guide

## الخطوة 1 — تنصيب MongoDB

### Windows
1. روح على https://www.mongodb.com/try/download/community
2. اختار **Windows** → **MSI** → حمّل
3. شغّل الـ installer واختار **Complete**
4. ✅ MongoDB هيتنصب كـ Windows Service ويشتغل تلقائياً

### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

### Ubuntu / Debian
```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
  sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add repo
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] \
https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
  sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod   # يشتغل مع الـ boot
```

---

## الخطوة 2 — التحقق إن MongoDB شغال

```bash
mongosh
# لو فتح prompt اسمه > يبقى شغال ✅
# اكتب exit للخروج
```

---

## الخطوة 3 — إعداد الـ Project

```bash
# 1. انسخ ملف الـ environment
cp .env.example .env

# 2. افتح .env وتأكد من السطر ده
MONGODB_URI=mongodb://localhost:27017/marine_db
#           ─────────────────────────────────
#           ده هيعمل database اسمه marine_db تلقائياً
```

---

## الخطوة 4 — تنصيب الـ Dependencies

```bash
npm install
```

---

## الخطوة 5 — رفع الـ Data (Seed)

```bash
npm run seed
```

### المتوقع تشوفه:
```
🌱 Connecting to MongoDB…
✅ Connected

📦 Seeding Vessels…
  ✅ Vessels: 6 docs inserted
  ✅ meta [vessels/en] saved
  ✅ meta [vessels/ar] saved

👤 Seeding Users…
  ✅ Users: 8 docs inserted
  ...

🎉 Seed complete!
```

---

## الخطوة 6 — تشغيل السيرفر

```bash
# Development (مع auto-reload)
npm run dev

# Production
npm start
```

السيرفر هيشتغل على: **http://localhost:3000**

---

## الخطوة 7 — التحقق من الـ API

```bash
# Health check
curl http://localhost:3000/health

# Vessels بالإنجليزي
curl http://localhost:3000/api/vessels

# Vessels بالعربي
curl http://localhost:3000/api/vessels?lang=ar

# Meta data بتاع vessels
curl http://localhost:3000/api/vessels/meta?lang=en
```

---

## 🧰 MongoDB GUI (اختياري)

لو عايز تشوف الـ data بصرياً، نصّب **MongoDB Compass**:
- https://www.mongodb.com/try/download/compass
- اتصل بـ: `mongodb://localhost:27017`
- افتح database: `marine_db`

---

## ⚠️ أكثر مشاكل شائعة

| المشكلة | الحل |
|---------|------|
| `ECONNREFUSED 27017` | MongoDB مش شغال — شغّله بـ `sudo systemctl start mongod` |
| `MongoServerError: E11000` | الـ seed اتشغل قبل كده — الـ script بيعمل delete تلقائي |
| `Cannot find module` | عمل `npm install` الأول |
