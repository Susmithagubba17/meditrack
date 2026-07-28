const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send appointment confirmation email
const sendAppointmentConfirmation = async (patientEmail, patientName, doctorName, dateTime, reason) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: 'Appointment Confirmation - MediTrack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a73e8;">🏥 Appointment Confirmation</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your appointment has been confirmed with:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>👨‍⚕️ Doctor:</strong> ${doctorName}</p>
            <p><strong>📅 Date:</strong> ${new Date(dateTime).toLocaleDateString()}</p>
            <p><strong>⏰ Time:</strong> ${new Date(dateTime).toLocaleTimeString()}</p>
            <p><strong>📝 Reason:</strong> ${reason}</p>
          </div>
          <p>Please arrive 15 minutes before your appointment.</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 14px;">This is an automated message from MediTrack.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to:', patientEmail);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

// Send prescription confirmation email
const sendPrescriptionEmail = async (patientEmail, patientName, medications, prescriptionNumber) => {
  try {
    const medList = medications.map(med => 
      `<li><strong>${med.name}</strong> - ${med.dosage}, ${med.frequency}, ${med.duration}</li>`
    ).join('');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patientEmail,
      subject: 'New Prescription - MediTrack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6f42c1;">💊 New Prescription</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>A new prescription has been created for you:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📋 Prescription Number:</strong> ${prescriptionNumber}</p>
            <p><strong>💊 Medications:</strong></p>
            <ul>${medList}</ul>
          </div>
          <p>Please visit your pharmacy to fill this prescription.</p>
          <hr style="margin: 20px 0;" />
          <p style="color: #666; font-size: 14px;">This is an automated message from MediTrack.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Prescription email sent to:', patientEmail);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

module.exports = { sendAppointmentConfirmation, sendPrescriptionEmail };