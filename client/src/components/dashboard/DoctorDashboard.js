import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import VideoCall from '../video/VideoCall';
import RefillRequests from '../refills/RefillRequests';
import ExportButton from '../common/ExportButton';
import PatientMedicalHistory from '../patients/PatientMedicalHistory';
import { showToast } from '../common/ToastNotifications';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: '',
    refillsRemaining: 0
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchPrescriptions();
  }, []);

  // Fetch all appointments for this doctor
  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(res.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showToast.error('Failed to load appointments');
    }
    setLoading(false);
  };

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/patients');
      setPatients(res.data.data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
      if (appointments.length > 0) {
        const uniquePatients = appointments
          .filter(apt => apt.patientId)
          .map(apt => apt.patientId)
          .filter((patient, index, self) => 
            patient && self.findIndex(p => p._id === patient._id) === index
          );
        setPatients(uniquePatients);
      }
    }
  };

  // Fetch all prescriptions for this doctor
  const fetchPrescriptions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/prescriptions');
      setPrescriptions(res.data.data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  };

  // Handle viewing patient history
  const handleViewHistory = (patientId) => {
    setSelectedPatient(patientId);
    setShowPatientHistory(true);
  };

  // Handle medication field changes
  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...formData.medications];
    newMedications[index][field] = value;
    setFormData({ ...formData, medications: newMedications });
  };

  // Add new medication row
  const handleAddMedication = () => {
    setFormData({
      ...formData,
      medications: [...formData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  // Remove medication row
  const handleRemoveMedication = (index) => {
    if (formData.medications.length > 1) {
      const newMedications = formData.medications.filter((_, i) => i !== index);
      setFormData({ ...formData, medications: newMedications });
    }
  };

  // Submit prescription
  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!formData.patientId) {
        showToast.error('Please select a patient.');
        setSubmitting(false);
        return;
      }

      for (let med of formData.medications) {
        if (!med.name || !med.dosage || !med.frequency || !med.duration) {
          showToast.error('Please fill in all medication fields.');
          setSubmitting(false);
          return;
        }
      }

      const loadingToast = showToast.loading('Creating prescription...');
      
      await axios.post('http://localhost:5000/api/prescriptions', formData);
      
      showToast.dismiss(loadingToast);
      setFormData({
        patientId: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        notes: '',
        refillsRemaining: 0
      });
      setShowPrescriptionForm(false);
      showToast.success('✅ Prescription created successfully!');
      fetchPrescriptions();
    } catch (error) {
      console.error('Error creating prescription:', error);
      showToast.error(error.response?.data?.message || 'Failed to create prescription.');
    }
    setSubmitting(false);
  };

  // Check-in patient
  const handleCheckIn = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, {
        status: 'arrived'
      });
      fetchAppointments();
      showToast.success('✅ Patient checked in successfully!');
    } catch (error) {
      console.error('Error checking in patient:', error);
      showToast.error('Failed to check in patient.');
    }
  };

  // Start appointment
  const handleStartAppointment = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, {
        status: 'in-progress'
      });
      fetchAppointments();
      showToast.success('✅ Appointment started!');
    } catch (error) {
      console.error('Error starting appointment:', error);
      showToast.error('Failed to start appointment.');
    }
  };

  // Complete appointment
  const handleCompleteAppointment = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, {
        status: 'completed'
      });
      fetchAppointments();
      showToast.success('✅ Appointment marked as completed!');
    } catch (error) {
      console.error('Error completing appointment:', error);
      showToast.error('Failed to complete appointment.');
    }
  };

  // Download Prescription PDF
  const downloadPrescriptionPDF = async (prescriptionId) => {
    try {
      const loadingToast = showToast.loading('Generating PDF...');
      
      const response = await axios.get(
        `http://localhost:5000/api/export/prescription/${prescriptionId}/pdf`,
        { responseType: 'blob' }
      );
      
      showToast.dismiss(loadingToast);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `prescription_${prescriptionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast.success('📄 Prescription PDF downloaded!');
    } catch (error) {
      console.error('PDF download error:', error);
      showToast.error('Failed to download PDF');
    }
  };

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    arrived: appointments.filter(a => a.status === 'arrived').length,
    inProgress: appointments.filter(a => a.status === 'in-progress').length,
    completed: appointments.filter(a => a.status === 'completed').length
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>👨‍⚕️ Welcome, Dr. {user?.name}</h2>
          <p style={styles.subtitle}>Doctor Dashboard</p>
          <p style={styles.specialty}>Specialty: {user?.specialty || 'General'}</p>
        </div>
        <button 
          onClick={() => setShowPrescriptionForm(!showPrescriptionForm)} 
          style={styles.prescriptionBtn}
        >
          {showPrescriptionForm ? '✖ Cancel' : '💊 Write Prescription'}
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Total Appointments</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #17a2b8'}}>
          <div style={styles.statNumber}>{stats.scheduled}</div>
          <div style={styles.statLabel}>Scheduled</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #ffc107'}}>
          <div style={styles.statNumber}>{stats.arrived}</div>
          <div style={styles.statLabel}>Arrived</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #6f42c1'}}>
          <div style={styles.statNumber}>{stats.inProgress}</div>
          <div style={styles.statLabel}>In Progress</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #28a745'}}>
          <div style={styles.statNumber}>{stats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
      </div>

      {/* Export Section */}
      <div style={styles.exportSection}>
        <h4 style={styles.exportTitle}>📊 Export Reports</h4>
        <div style={styles.exportButtons}>
          <ExportButton 
            type="appointments" 
            label="My Appointments" 
            variant="primary" 
            icon="📋" 
          />
          <ExportButton 
            type="prescriptions" 
            label="My Prescriptions" 
            variant="success" 
            icon="💊" 
          />
        </div>
      </div>

      {/* Pending Refill Requests Section */}
      {user?.role === 'doctor' && (
        <RefillRequests />
      )}

      {/* Prescription Form */}
      {showPrescriptionForm && (
        <div style={styles.formContainer}>
          <h3>💊 Write Prescription</h3>
          <form onSubmit={handleSubmitPrescription} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Select Patient *</label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                required
                style={styles.input}
              >
                <option value="">Select a patient...</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} - {p.email} {p.phone ? `(${p.phone})` : ''}
                  </option>
                ))}
              </select>
              {patients.length === 0 && (
                <p style={styles.hint}>No patients found. Make sure you have patients registered.</p>
              )}
            </div>

            <div style={styles.medicationsSection}>
              <h4>Medications</h4>
              {formData.medications.map((med, index) => (
                <div key={index} style={styles.medicationRow}>
                  <input
                    placeholder="Medication Name *"
                    value={med.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    required
                    style={styles.medicationInput}
                  />
                  <input
                    placeholder="Dosage * (e.g., 500mg)"
                    value={med.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    required
                    style={styles.medicationInput}
                  />
                  <input
                    placeholder="Frequency * (e.g., Twice daily)"
                    value={med.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    required
                    style={styles.medicationInput}
                  />
                  <input
                    placeholder="Duration * (e.g., 7 days)"
                    value={med.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    required
                    style={styles.medicationInput}
                  />
                  {formData.medications.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => handleRemoveMedication(index)}
                      style={styles.removeMedBtn}
                    >
                      ✖
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={handleAddMedication} style={styles.addMedBtn}>
                + Add Medication
              </button>
            </div>

            <div style={styles.formGroup}>
              <label>Notes (Optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                style={{...styles.input, minHeight: '80px'}}
                placeholder="Additional notes for the patient or pharmacy..."
              />
            </div>

            <div style={styles.formGroup}>
              <label>Refills Remaining</label>
              <input
                type="number"
                value={formData.refillsRemaining}
                onChange={(e) => setFormData({...formData, refillsRemaining: parseInt(e.target.value) || 0})}
                min="0"
                style={styles.input}
                placeholder="Number of refills (e.g., 2)"
              />
              <p style={styles.hint}>How many times can the patient refill this prescription?</p>
            </div>

            <div style={styles.formActions}>
              <button type="submit" disabled={submitting} style={styles.submitBtn}>
                {submitting ? 'Creating...' : '💊 Create Prescription'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowPrescriptionForm(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <h3 style={styles.sectionTitle}>📋 Today's Appointments</h3>
      {appointments.length === 0 ? (
        <p style={styles.emptyState}>No appointments scheduled for today.</p>
      ) : (
        <div style={styles.appointmentGrid}>
          {appointments.map((apt) => (
            <div key={apt._id} style={styles.appointmentCard}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.patientName}>👤 {apt.patientId?.name || 'Unknown Patient'}</span>
                  <span style={styles.patientEmail}>{apt.patientId?.email || ''}</span>
                  {/* ✅ HISTORY BUTTON */}
                  <button 
                    onClick={() => handleViewHistory(apt.patientId?._id)}
                    style={styles.historyBtn}
                    disabled={!apt.patientId}
                  >
                    📋 History
                  </button>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: apt.status === 'completed' ? '#d4edda' : 
                                  apt.status === 'cancelled' ? '#f8d7da' : 
                                  apt.status === 'in-progress' ? '#fff3cd' : 
                                  apt.status === 'arrived' ? '#cce5ff' : '#d4edda',
                  color: apt.status === 'completed' ? '#155724' : 
                         apt.status === 'cancelled' ? '#721c24' : 
                         apt.status === 'in-progress' ? '#856404' : 
                         apt.status === 'arrived' ? '#004085' : '#155724'
                }}>
                  {apt.status}
                </span>
              </div>
              <div style={styles.cardDetails}>
                <div style={styles.cardDetail}>
                  <strong>⏰ Time:</strong> {new Date(apt.dateTime).toLocaleTimeString()}
                </div>
                <div style={styles.cardDetail}>
                  <strong>📅 Date:</strong> {new Date(apt.dateTime).toLocaleDateString()}
                </div>
                <div style={styles.cardDetail}>
                  <strong>📝 Reason:</strong> {apt.reason}
                </div>
                <div style={styles.cardDetail}>
                  <strong>📞 Phone:</strong> {apt.patientId?.phone || 'N/A'}
                </div>
              </div>

              {/* Video Call Button */}
              {(apt.status === 'scheduled' || apt.status === 'arrived' || apt.status === 'in-progress') && (
                <div style={styles.videoCallContainer}>
                  <VideoCall 
                    appointmentId={apt._id}
                    patientName={apt.patientId?.name || 'Patient'}
                    doctorName={apt.doctorId?.name || user?.name || 'Doctor'}
                  />
                </div>
              )}

              <div style={styles.cardActions}>
                {apt.status === 'scheduled' && (
                  <button 
                    onClick={() => handleCheckIn(apt._id)}
                    style={styles.checkInBtn}
                  >
                    📋 Check In
                  </button>
                )}
                {apt.status === 'arrived' && (
                  <>
                    <button 
                      onClick={() => handleStartAppointment(apt._id)}
                      style={styles.startBtn}
                    >
                      ▶️ Start
                    </button>
                    <button 
                      onClick={() => handleCompleteAppointment(apt._id)}
                      style={styles.completeBtn}
                    >
                      ✅ Complete
                    </button>
                  </>
                )}
                {apt.status === 'in-progress' && (
                  <button 
                    onClick={() => handleCompleteAppointment(apt._id)}
                    style={styles.completeBtn}
                  >
                    ✅ Complete
                  </button>
                )}
                {apt.status === 'completed' && (
                  <span style={styles.completedLabel}>✅ Completed</span>
                )}
                {apt.status === 'cancelled' && (
                  <span style={styles.cancelledLabel}>❌ Cancelled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescriptions List */}
      <h3 style={styles.sectionTitle}>💊 Your Prescriptions</h3>
      {prescriptions.length === 0 ? (
        <p style={styles.emptyState}>No prescriptions written yet.</p>
      ) : (
        <div style={styles.prescriptionGrid}>
          {prescriptions.slice(0, 5).map((pres) => (
            <div key={pres._id} style={styles.prescriptionCard}>
              <div style={styles.cardHeader}>
                <span style={styles.patientName}>👤 {pres.patientId?.name || 'Unknown'}</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: pres.isActive ? '#d4edda' : '#f8d7da',
                  color: pres.isActive ? '#155724' : '#721c24'
                }}>
                  {pres.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={styles.cardDetail}>
                <strong>💊 {pres.medications[0]?.name}</strong> - {pres.medications[0]?.dosage}
              </div>
              <div style={styles.cardDetail}>
                <strong>Frequency:</strong> {pres.medications[0]?.frequency}
              </div>
              <div style={styles.cardDetail}>
                <strong>Refills:</strong> {pres.refillsRemaining}
              </div>
              <div style={styles.cardDetail}>
                <strong>RX#:</strong> {pres.prescriptionNumber}
              </div>
              <button 
                onClick={() => downloadPrescriptionPDF(pres._id)}
                style={styles.pdfBtn}
              >
                📄 Download PDF
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Patient Medical History Modal */}
      {showPatientHistory && selectedPatient && (
        <PatientMedicalHistory 
          patientId={selectedPatient}
          onClose={() => setShowPatientHistory(false)}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    fontSize: '18px',
    color: '#666'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  title: {
    fontSize: '28px',
    margin: 0,
    color: '#333'
  },
  subtitle: {
    color: '#666',
    margin: '5px 0 5px 0'
  },
  specialty: {
    color: '#1a73e8',
    fontWeight: '600'
  },
  prescriptionBtn: {
    background: '#6f42c1',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '10px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '30px'
  },
  statCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    borderBottom: '3px solid #1a73e8'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a73e8'
  },
  statLabel: {
    color: '#666',
    marginTop: '5px',
    fontSize: '14px'
  },
  exportSection: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  exportTitle: {
    margin: '0 0 15px 0',
    color: '#333'
  },
  exportButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  formContainer: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  form: {
    display: 'grid',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  hint: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0 0 0'
  },
  medicationsSection: {
    background: '#f8f9fa',
    padding: '15px',
    borderRadius: '4px'
  },
  medicationRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  medicationInput: {
    flex: '1',
    padding: '8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    minWidth: '120px'
  },
  removeMedBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  addMedBtn: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },
  submitBtn: {
    background: '#6f42c1',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  cancelBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  sectionTitle: {
    marginBottom: '20px',
    color: '#333',
    marginTop: '30px'
  },
  emptyState: {
    color: '#666',
    textAlign: 'center',
    padding: '40px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  appointmentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '20px'
  },
  appointmentCard: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #28a745'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px'
  },
  patientName: {
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'block'
  },
  patientEmail: {
    fontSize: '12px',
    color: '#666',
    display: 'block'
  },
  historyBtn: {
    background: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '4px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '5px',
    transition: 'background 0.3s'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap'
  },
  cardDetails: {
    marginBottom: '10px'
  },
  cardDetail: {
    marginBottom: '4px',
    fontSize: '14px',
    color: '#555'
  },
  videoCallContainer: {
    marginTop: '10px',
    marginBottom: '10px'
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
    flexWrap: 'wrap'
  },
  checkInBtn: {
    background: '#ffc107',
    color: '#333',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    flex: '1',
    minWidth: '80px'
  },
  startBtn: {
    background: '#17a2b8',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    flex: '1',
    minWidth: '80px'
  },
  completeBtn: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    flex: '1',
    minWidth: '80px'
  },
  completedLabel: {
    background: '#d4edda',
    color: '#155724',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    textAlign: 'center',
    flex: '1'
  },
  cancelledLabel: {
    background: '#f8d7da',
    color: '#721c24',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    textAlign: 'center',
    flex: '1'
  },
  prescriptionGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '15px'
  },
  prescriptionCard: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #6f42c1'
  },
  pdfBtn: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '10px',
    width: '100%'
  }
};

export default DoctorDashboard;