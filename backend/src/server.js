const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const { startReminderWorker } = require('./workers/reminderWorker');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'MediTrack API is running' });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/refills', require('./routes/refillRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
// Add with other routes
app.use('/api/video', require('./routes/videoRoutes'));
app.use('/api/export', require('./routes/exportRoutes'));

// Add with other routes
app.use('/api/patients', require('./routes/patientRoutes'));

// Add this line
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err);
  res.status(500).json({ success: false, message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  
  // ✅ Start reminder worker
  startReminderWorker();
});