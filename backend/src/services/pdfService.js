const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generatePrescriptionPDF = async (prescription, patient, doctor) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const fileName = `prescription-${prescription.prescriptionNumber}.pdf`;
      const filePath = path.join(__dirname, '../temp', fileName);
      
      // Ensure temp directory exists
      if (!fs.existsSync(path.join(__dirname, '../temp'))) {
        fs.mkdirSync(path.join(__dirname, '../temp'));
      }
      
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#1a73e8')
         .text('🏥 MediTrack', { align: 'center' })
         .moveDown(0.5);

      // Prescription Title
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#333')
         .text('PRESCRIPTION', { align: 'center' })
         .moveDown(0.5);

      // Prescription Number
      doc.fontSize(12)
         .font('Helvetica')
         .text(`RX Number: ${prescription.prescriptionNumber}`, { align: 'right' })
         .moveDown(1);

      // Doctor Info
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Doctor Information:')
         .font('Helvetica')
         .text(`Name: Dr. ${doctor.name}`)
         .text(`Specialty: ${doctor.specialty || 'General'}`)
         .text(`Phone: ${doctor.phone}`)
         .moveDown(0.5);

      // Patient Info
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Patient Information:')
         .font('Helvetica')
         .text(`Name: ${patient.name}`)
         .text(`DOB: ${new Date(patient.dob).toLocaleDateString()}`)
         .text(`Phone: ${patient.phone}`)
         .moveDown(0.5);

      // Medications
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Medications:')
         .moveDown(0.3);

      prescription.medications.forEach((med, index) => {
        doc.font('Helvetica')
           .text(`${index + 1}. ${med.name} - ${med.dosage}`)
           .text(`   Frequency: ${med.frequency}`)
           .text(`   Duration: ${med.duration}`)
           .text(`   Instructions: ${med.instructions || 'As directed'}`)
           .moveDown(0.3);
      });

      // Refills and Notes
      doc.moveDown(0.5)
         .font('Helvetica-Bold')
         .text(`Refills Remaining: ${prescription.refillsRemaining}`)
         .moveDown(0.3);

      if (prescription.notes) {
        doc.font('Helvetica-Bold')
           .text('Notes:')
           .font('Helvetica')
           .text(prescription.notes);
      }

      // Footer
      doc.moveDown(2)
         .font('Helvetica')
         .fontSize(10)
         .fillColor('#666')
         .text('This is a computer-generated prescription.', { align: 'center' })
         .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generatePrescriptionPDF };