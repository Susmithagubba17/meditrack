const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const User = require('../models/User');

// @desc    Export appointments as CSV
// @route   GET /api/export/appointments
// @access  Private
const exportAppointmentsCSV = async (req, res) => {
  try {
    let query = {};
    
    // Filter based on role
    if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    } else if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    }
    // Receptionists see all

    const appointments = await Appointment.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialty')
      .sort({ dateTime: -1 });

    // Create CSV header
    let csv = 'Date,Time,Patient,Patient Email,Patient Phone,Doctor,Doctor Specialty,Status,Reason,Notes\n';
    
    // Add rows
    appointments.forEach(apt => {
      const date = new Date(apt.dateTime);
      csv += `${date.toLocaleDateString()},`;
      csv += `${date.toLocaleTimeString()},`;
      csv += `"${apt.patientId?.name || 'N/A'}",`;
      csv += `"${apt.patientId?.email || 'N/A'}",`;
      csv += `"${apt.patientId?.phone || 'N/A'}",`;
      csv += `"${apt.doctorId?.name || 'N/A'}",`;
      csv += `"${apt.doctorId?.specialty || 'N/A'}",`;
      csv += `${apt.status},`;
      csv += `"${apt.reason || ''}",`;
      csv += `"${apt.notes || ''}"\n`;
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=appointments_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Export appointments error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Export prescriptions as CSV
// @route   GET /api/export/prescriptions
// @access  Private
const exportPrescriptionsCSV = async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctorId = req.user._id;
    } else if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    }

    const prescriptions = await Prescription.find(query)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name email specialty')
      .sort({ createdAt: -1 });

    let csv = 'RX#,Patient,Patient Email,Patient Phone,Doctor,Doctor Specialty,Medication,Dosage,Frequency,Duration,Refills Remaining,Status,Date Prescribed,Notes\n';
    
    prescriptions.forEach(pres => {
      pres.medications.forEach((med, index) => {
        csv += `${pres.prescriptionNumber},`;
        csv += `"${pres.patientId?.name || 'N/A'}",`;
        csv += `"${pres.patientId?.email || 'N/A'}",`;
        csv += `"${pres.patientId?.phone || 'N/A'}",`;
        csv += `"${pres.doctorId?.name || 'N/A'}",`;
        csv += `"${pres.doctorId?.specialty || 'N/A'}",`;
        csv += `"${med.name || ''}",`;
        csv += `"${med.dosage || ''}",`;
        csv += `"${med.frequency || ''}",`;
        csv += `"${med.duration || ''}",`;
        csv += `${pres.refillsRemaining},`;
        csv += `${pres.isActive ? 'Active' : 'Inactive'},`;
        csv += `${new Date(pres.createdAt).toLocaleDateString()},`;
        csv += `"${pres.notes || ''}"\n`;
      });
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=prescriptions_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Export prescriptions error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Export patients list as CSV (Admin/Receptionist only)
// @route   GET /api/export/patients
// @access  Private (Receptionist/Admin)
const exportPatientsCSV = async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' })
      .select('name email phone dob allergies medicalHistory createdAt')
      .sort({ createdAt: -1 });

    let csv = 'Name,Email,Phone,Date of Birth,Allergies,Medical History,Registered Date\n';
    
    patients.forEach(p => {
      csv += `"${p.name || ''}",`;
      csv += `"${p.email || ''}",`;
      csv += `"${p.phone || ''}",`;
      csv += `${p.dob ? new Date(p.dob).toLocaleDateString() : 'N/A'},`;
      csv += `"${(p.allergies || []).join('; ')}",`;
      csv += `"${p.medicalHistory || ''}",`;
      csv += `${new Date(p.createdAt).toLocaleDateString()}\n`;
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=patients_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('❌ Export patients error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Download prescription as PDF
// @route   GET /api/export/prescription/:id/pdf
// @access  Private
const exportPrescriptionPDF = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('patientId')
      .populate('doctorId');

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    // Authorization check
    if (req.user.role === 'patient' && prescription.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (req.user.role === 'doctor' && prescription.doctorId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=prescription_${prescription.prescriptionNumber}.pdf`);
    
    doc.pipe(res);

    // Hospital/Clinic Header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#1a73e8')
       .text('🏥 MediTrack', { align: 'center' })
       .moveDown(0.5);

    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text('PRESCRIPTION', { align: 'center' })
       .moveDown(0.5);

    // Prescription Number
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#666')
       .text(`RX Number: ${prescription.prescriptionNumber}`, { align: 'right' })
       .moveDown(1);

    // Doctor Information
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .fillColor('#333')
       .text('👨‍⚕️ DOCTOR INFORMATION')
       .moveDown(0.3);
       
    doc.font('Helvetica')
       .text(`Name: Dr. ${prescription.doctorId?.name || 'N/A'}`)
       .text(`Specialty: ${prescription.doctorId?.specialty || 'General'}`)
       .text(`Phone: ${prescription.doctorId?.phone || 'N/A'}`)
       .moveDown(0.5);

    // Patient Information
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('👤 PATIENT INFORMATION')
       .moveDown(0.3);
       
    doc.font('Helvetica')
       .text(`Name: ${prescription.patientId?.name || 'N/A'}`)
       .text(`Email: ${prescription.patientId?.email || 'N/A'}`)
       .text(`Phone: ${prescription.patientId?.phone || 'N/A'}`)
       .text(`DOB: ${prescription.patientId?.dob ? new Date(prescription.patientId.dob).toLocaleDateString() : 'N/A'}`)
       .moveDown(0.5);

    // Medications
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text('💊 MEDICATIONS')
       .moveDown(0.3);

    prescription.medications.forEach((med, index) => {
      doc.font('Helvetica-Bold')
         .text(`${index + 1}. ${med.name}`, { underline: true })
         .font('Helvetica')
         .text(`   Dosage: ${med.dosage}`)
         .text(`   Frequency: ${med.frequency}`)
         .text(`   Duration: ${med.duration}`)
         .text(`   Instructions: ${med.instructions || 'As directed'}`)
         .moveDown(0.3);
    });

    // Refills and Notes
    doc.moveDown(0.5)
       .font('Helvetica-Bold')
       .text(`🔄 Refills Remaining: ${prescription.refillsRemaining}`)
       .moveDown(0.3);

    if (prescription.notes) {
      doc.font('Helvetica-Bold')
         .text('📝 Notes:')
         .font('Helvetica')
         .text(prescription.notes);
    }

    // Footer
    doc.moveDown(2)
       .font('Helvetica')
       .fontSize(10)
       .fillColor('#999')
       .text('This is a computer-generated prescription.', { align: 'center' })
       .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' })
       .text('Please verify all information with your healthcare provider.', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('❌ Export prescription PDF error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  exportAppointmentsCSV,
  exportPrescriptionsCSV,
  exportPatientsCSV,
  exportPrescriptionPDF
};