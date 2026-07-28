const cron = require('node-cron');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { sendAppointmentConfirmation } = require('../services/emailService');

// Run every hour
const startReminderWorker = () => {
  cron.schedule('0 * * * *', async () => {
    console.log('🔄 Running appointment reminder check...');
    
    try {
      // Find appointments scheduled for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
      
      const appointments = await Appointment.find({
        dateTime: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        status: 'scheduled'
      }).populate('patientId doctorId');
      
      console.log(`📧 Found ${appointments.length} appointments for tomorrow`);
      
      for (const appointment of appointments) {
        const patient = appointment.patientId;
        const doctor = appointment.doctorId;
        
        // Send reminder email
        await sendAppointmentConfirmation(
          patient.email,
          patient.name,
          doctor.name,
          appointment.dateTime,
          appointment.reason
        );
        
        console.log(`✅ Reminder sent to ${patient.email}`);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('❌ Reminder worker error:', error);
    }
  });
  
  console.log('✅ Reminder worker started');
};

module.exports = { startReminderWorker };