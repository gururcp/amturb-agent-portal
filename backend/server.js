// ============================================================
// AMRAVATI URBAN - BACKEND SERVER (FINAL VERSION)
// ============================================================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const app = express();
const PORT = process.env.PORT || 5000;
// ============================================================
// RATE LIMITING
// ============================================================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
const merchantCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  message: { error: 'Too many merchant registrations, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 200,
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});
// ============================================================
// MIDDLEWARE
// ============================================================
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);
// ============================================================
// MONGODB CONNECTION
// ============================================================
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully');
  console.log('📍 Database:', mongoose.connection.name);
})
.catch((err) => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});
// ============================================================
// IMPORT ROUTES
// ============================================================
const authRoutes = require('./routes/auth');
const merchantRoutes = require('./routes/merchants');
const servicesRoutes = require('./routes/services');
const agentsRoutes = require('./routes/agents');
const dashboardRoutes = require('./routes/dashboard');
const followupsRoutes = require('./routes/followups');
// ============================================================
// API ROUTES
// ============================================================
// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Amravati Urban Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
// Auth routes (with login rate limiting)
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
// Merchant routes (with creation rate limiting)
app.post('/api/merchants', merchantCreateLimiter);
app.use('/api/merchants', merchantRoutes);
// Services routes
app.use('/api/services', servicesRoutes);
// Agents routes (owner only)
app.use('/api/agents', agentsRoutes);
// Dashboard routes
app.use('/api/dashboard', dashboardRoutes);
// Follow-ups routes
app.use('/api/followups', followupsRoutes);
// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});
// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 AMRAVATI URBAN BACKEND SERVER');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📡 Port:', PORT);
  console.log('🌍 Environment:', process.env.NODE_ENV);
  console.log('');
  console.log('📍 Available Endpoints:');
  console.log('   GET  /api/health');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/me');
  console.log('   POST /api/merchants');
  console.log('   GET  /api/merchants');
  console.log('   GET  /api/services');
  console.log('   GET  /api/agents');
  console.log('   GET  /api/dashboard/agent');
  console.log('   GET  /api/dashboard/owner');
  console.log('   GET  /api/followups');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});
// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});