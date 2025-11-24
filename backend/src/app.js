const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

console.log("🚀 [Server] Starting application...");

// Load environment variables
dotenv.config();
console.log("📦 [Server] Environment variables loaded");

const app = express();

// ============================
// 🛡️ MIDDLEWARE DEBUG
// ============================
console.log("🔧 [Server] Applying global middlewares...");

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log(`🌍 [CORS] Incoming request from origin: ${origin}`);
      if (!origin || allowedOrigins.includes(origin)) {
        console.log("✔️ [CORS] Allowed origin");
        callback(null, true);
      } else {
        console.warn("⛔ [CORS] Blocked origin:", origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(helmet());
console.log("🛡️ [Helmet] Security headers applied");

app.use(morgan('combined'));
console.log("📊 [Morgan] HTTP logger enabled");

app.use(express.json());
console.log("📥 [JSON] Body parser enabled");

// ============================
// 🛣️ ROUTES DEBUG
// ============================
console.log("📌 [Routes] Mounting API routes...");

const authRoutes = require('./routes/auth.routes');
const branchRoutes = require('./routes/branchRoutes');
const staffRoutes = require('./routes/staffRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const staffRoleRoutes = require('./routes/staffRoleRoutes');
const memberRoutes = require('./routes/memberRoutes');
// const membershipRoutes = require('./routes/membershipRoutes');
const planRoutes = require('./routes/planRoutes');
const classScheduleRoutes = require('./routes/classScheduleRoutes');
const groupRoutes = require('./routes/groupRoutes');
const branchPlanRoutes = require('./routes/branchPlanRoutes');
const personalTrainingSessionRoutes = require('./routes/personalTrainingSessionRoutes');
const walkInRoutes = require('./routes/walkInRoutes');
const personalTrainingRoutes = require('./routes/personalTrainingRoutes');
const groupPlanRoutes = require('./routes/groupPlanRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/staff-roles', staffRoleRoutes);
app.use('/api/v1/salaries', salaryRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/classes', classScheduleRoutes);
app.use('/api/v1/groups', groupRoutes);
app.use('/api/v1/group-plans', groupPlanRoutes);
app.use('/api/v1/branch-plans', branchPlanRoutes);
app.use('/api/v1/sessions', personalTrainingSessionRoutes);
app.use('/api/v1/walk-ins', walkInRoutes);
app.use('/api/v1/personal-training', personalTrainingRoutes);

console.log("🎯 [Routes] All API routes mounted successfully");

// ============================
// ❤️ HEALTH CHECK
// ============================
app.get('/api/health', (req, res) => {
  console.log("💓 [Health Check] Request received");
  res.json({ status: 'OK', message: 'Server is running' });
});

// ============================
// ❗ ERROR HANDLER
// ============================
console.log("🛠️ [Error Handler] Initializing global error handler...");
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
