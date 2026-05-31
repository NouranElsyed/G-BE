/**
 * Application Entry Point
 *
 * Route structure mirrors the domain architecture:
 *
 *   /api/auth          — Authentication & user preferences
 *   /api/system        — Runtime module registry + feature flags (Frontend bootstrap)
 *   /api/dashboard     — Aggregated statistics
 *
 *   /api/messages      — Exchange domain
 *   /api/conversations
 *   /api/topics
 *   /api/schemas
 *
 *   /api/vessels       — Transport domain
 *   /api/visits
 *
 *   /api/users         — Identity domain
 *   /api/roles
 *   /api/permissions
 *
 *   /api/processes     — Operations domain
 *   /api/categories
 *
 *   /api/communities   — Community domain
 *   /api/organizations
 *   /api/contacts
 */

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const connectDB    = require('./core/config/db');
const auth         = require('./shared/middleware/auth');
const lang         = require('./shared/middleware/lang');
const errorHandler = require('./shared/middleware/errorHandler');

// ── Database ──────────────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Global Middleware ─────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://generic-frontend-zeta.vercel.app/',
    'http://localhost:4200',
  ],
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// ── Health Check (public, no auth) ───────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Public Routes (no auth required) ─────────────────────────────────────────
app.use('/api/auth', require('./modules/auth/auth.routes'));

// ── Auth + Language (applied to all protected routes) ────────────────────────
app.use(auth);
app.use(lang);

// ── System (Runtime Config Engine) ───────────────────────────────────────────
app.use('/api/system', require('./system/system.routes'));

// ── Dashboard ─────────────────────────────────────────────────────────────────
app.use('/api/dashboard', require('./modules/dashboard/dashboard.routes'));

// ── Exchange Domain ───────────────────────────────────────────────────────────
app.use('/api/messages',      require('./modules/exchange/messages/messages.routes'));
app.use('/api/conversations',  require('./modules/exchange/conversations/conversations.routes'));
app.use('/api/topics',         require('./modules/exchange/topics/topics.routes'));
app.use('/api/schemas',        require('./modules/exchange/schemas/schemas.routes'));

// ── Transport Domain ──────────────────────────────────────────────────────────
app.use('/api/vessels', require('./modules/transport/vessels/vessels.routes'));
app.use('/api/visits',  require('./modules/transport/visits/visits.routes'));

// ── Identity Domain ───────────────────────────────────────────────────────────
app.use('/api/users',       require('./modules/identity/users/users.routes'));
app.use('/api/roles',       require('./modules/identity/roles/roles.routes'));
app.use('/api/permissions', require('./modules/identity/permissions/permission.routes'));

// ── Operations Domain ─────────────────────────────────────────────────────────
app.use('/api/processes',  require('./modules/operations/processes/processes.routes'));
app.use('/api/categories', require('./modules/operations/categories/categories.routes'));

// ── Community Domain ──────────────────────────────────────────────────────────
app.use('/api/communities',  require('./modules/community/communities/communities.routes'));
app.use('/api/organizations',require('./modules/community/organizations/organizations.routes'));
app.use('/api/contacts',     require('./modules/community/contacts/contacts.routes'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: 0,
    messages: { type: 'error', texts: ['Route not found'] },
    result: null,
  });
});

// ── Error Handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
