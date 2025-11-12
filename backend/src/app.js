const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// ✅ Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];

// Handle CORS dynamically
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies or authorization headers if needed
  })
);

app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// ✅ Routes
const authRoutes = require('./routes/auth.routes');
const branchRoutes = require('./routes/branchRoutes');
const staffRoutes = require('./routes/staffRoutes');
const staffRoleRoutes = require('./routes/staffRoleRoutes');
const memberRoutes = require('./routes/memberRoutes');
const planRoutes = require('./routes/planRoutes');
const qrCheckRoutes = require('./routes/qrCheckRoutes');
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/branches', branchRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/staff-roles', staffRoleRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/qr-check', qrCheckRoutes);

// ✅ Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ✅ Centralized error handling
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
