import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ✅ Removed unused 'user'
import { showToast } from '../common/ToastNotifications';

const PatientMedicalHistory = ({ patientId, onClose }) => {
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // ✅ Fixed: Added fetchPatientData to dependency array
  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  const fetchPatientData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/patients/${patientId}/medical-history`
      );
      setPatientData(res.data.data);
      setEditData(res.data.data.patient);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      showToast.error('Failed to load patient data');
    }
    setLoading(false);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSaveMedicalHistory = async () => {
    try {
      await axios.put(
        `http://localhost:5000/api/patients/${patientId}/medical-history`,
        editData
      );
      showToast.success('✅ Medical history updated!');
      setEditMode(false);
      fetchPatientData();
    } catch (error) {
      console.error('Error updating medical history:', error);
      showToast.error('Failed to update medical history');
    }
  };

  const handleAddVisitNote = async () => {
    if (!newNote.trim()) {
      showToast.error('Please enter a note');
      return;
    }
    
    setAddingNote(true);
    try {
      await axios.post(
        `http://localhost:5000/api/patients/${patientId}/visit-notes`,
        { note: newNote }
      );
      showToast.success('✅ Visit note added!');
      setNewNote('');
      fetchPatientData();
    } catch (error) {
      console.error('Error adding visit note:', error);
      showToast.error('Failed to add visit note');
    }
    setAddingNote(false);
  };

  if (loading) {
    return <div style={styles.loading}>Loading patient history...</div>;
  }

  if (!patientData) {
    return <div style={styles.error}>Patient not found</div>;
  }

  const { patient, statistics, appointments, prescriptions } = patientData;

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <div style={styles.patientInfo}>
            <h2 style={styles.patientName}>👤 {patient.name}</h2>
            <p style={styles.patientDetail}>📧 {patient.email}</p>
            <p style={styles.patientDetail}>📞 {patient.phone}</p>
            <p style={styles.patientDetail}>🎂 {patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'}</p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>✖</button>
        </div>

        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('overview')}
            style={activeTab === 'overview' ? styles.activeTab : styles.tab}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={activeTab === 'history' ? styles.activeTab : styles.tab}
          >
            📋 Medical History
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            style={activeTab === 'appointments' ? styles.activeTab : styles.tab}
          >
            📅 Appointments
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            style={activeTab === 'prescriptions' ? styles.activeTab : styles.tab}
          >
            💊 Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            style={activeTab === 'notes' ? styles.activeTab : styles.tab}
          >
            📝 Notes
          </button>
        </div>

        <div style={styles.tabContent}>
          {activeTab === 'overview' && (
            <div>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statNumber}>{statistics.totalAppointments}</div>
                  <div style={styles.statLabel}>Total Appointments</div>
                </div>
                <div style={{...styles.statCard, borderBottom: '3px solid #28a745'}}>
                  <div style={styles.statNumber}>{statistics.upcomingAppointments}</div>
                  <div style={styles.statLabel}>Upcoming</div>
                </div>
                <div style={{...styles.statCard, borderBottom: '3px solid #6f42c1'}}>
                  <div style={styles.statNumber}>{statistics.totalPrescriptions}</div>
                  <div style={styles.statLabel}>Prescriptions</div>
                </div>
                <div style={{...styles.statCard, borderBottom: '3px solid #17a2b8'}}>
                  <div style={styles.statNumber}>{statistics.activePrescriptions}</div>
                  <div style={styles.statLabel}>Active Prescriptions</div>
                </div>
              </div>

              <div style={styles.quickInfo}>
                <h4>Quick Health Info</h4>
                <div style={styles.infoGrid}>
                  <div style={styles.infoItem}>
                    <strong>Blood Group:</strong> {patient.bloodGroup || 'Unknown'}
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Allergies:</strong> {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None'}
                  </div>
                  <div style={styles.infoItem}>
                    <strong>Emergency Contact:</strong> {patient.emergencyContact?.name || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <div style={styles.sectionHeader}>
                <h3>📋 Medical History</h3>
                <button onClick={() => setEditMode(!editMode)} style={styles.editBtn}>
                  {editMode ? 'Cancel' : '✏️ Edit'}
                </button>
              </div>

              {editMode ? (
                <div style={styles.editForm}>
                  <div style={styles.formGroup}>
                    <label>Medical History</label>
                    <textarea
                      name="medicalHistory"
                      value={editData.medicalHistory || ''}
                      onChange={handleEditChange}
                      style={{...styles.input, minHeight: '100px'}}
                      placeholder="Enter patient's medical history..."
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Allergies (comma separated)</label>
                    <input
                      type="text"
                      name="allergies"
                      value={editData.allergies?.join(', ') || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        allergies: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      })}
                      style={styles.input}
                      placeholder="e.g., Penicillin, Dust, Peanuts"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label>Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={editData.bloodGroup || 'Unknown'}
                      onChange={handleEditChange}
                      style={styles.input}
                    >
                      <option value="Unknown">Unknown</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <button onClick={handleSaveMedicalHistory} style={styles.saveBtn}>
                    💾 Save Changes
                  </button>
                </div>
              ) : (
                <div style={styles.historyDisplay}>
                  <p><strong>Medical History:</strong></p>
                  <p style={styles.historyText}>{patient.medicalHistory || 'No medical history recorded.'}</p>
                  <p><strong>Allergies:</strong> {patient.allergies?.length > 0 ? patient.allergies.join(', ') : 'None'}</p>
                  <p><strong>Blood Group:</strong> {patient.bloodGroup || 'Unknown'}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'appointments' && (
            <div>
              <h3>📅 Appointment History</h3>
              {appointments.upcoming.length === 0 && appointments.past.length === 0 ? (
                <p>No appointments found.</p>
              ) : (
                <div>
                  <h4>Upcoming Appointments</h4>
                  {appointments.upcoming.length === 0 ? (
                    <p>No upcoming appointments</p>
                  ) : (
                    appointments.upcoming.map(apt => (
                      <div key={apt._id} style={styles.appointmentCard}>
                        <div><strong>👨‍⚕️ {apt.doctorId?.name}</strong></div>
                        <div>📅 {new Date(apt.dateTime).toLocaleDateString()}</div>
                        <div>⏰ {new Date(apt.dateTime).toLocaleTimeString()}</div>
                        <div>📝 {apt.reason}</div>
                        <span style={{...styles.statusBadge, backgroundColor: '#cce5ff', color: '#004085'}}>
                          {apt.status}
                        </span>
                      </div>
                    ))
                  )}

                  <h4>Past Appointments</h4>
                  {appointments.past.length === 0 ? (
                    <p>No past appointments</p>
                  ) : (
                    appointments.past.slice(0, 5).map(apt => (
                      <div key={apt._id} style={styles.appointmentCard}>
                        <div><strong>👨‍⚕️ {apt.doctorId?.name}</strong></div>
                        <div>📅 {new Date(apt.dateTime).toLocaleDateString()}</div>
                        <div>📝 {apt.reason}</div>
                        <span style={{...styles.statusBadge, backgroundColor: apt.status === 'completed' ? '#d4edda' : '#f8d7da', color: apt.status === 'completed' ? '#155724' : '#721c24'}}>
                          {apt.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'prescriptions' && (
            <div>
              <h3>💊 Prescription History</h3>
              {prescriptions.length === 0 ? (
                <p>No prescriptions found.</p>
              ) : (
                prescriptions.map(pres => (
                  <div key={pres._id} style={styles.prescriptionCard}>
                    <div style={styles.cardHeader}>
                      <span style={styles.medName}>💊 {pres.medications[0]?.name}</span>
                      <span style={{...styles.statusBadge, backgroundColor: pres.isActive ? '#d4edda' : '#f8d7da', color: pres.isActive ? '#155724' : '#721c24'}}>
                        {pres.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div><strong>Dosage:</strong> {pres.medications[0]?.dosage}</div>
                    <div><strong>Frequency:</strong> {pres.medications[0]?.frequency}</div>
                    <div><strong>Doctor:</strong> {pres.doctorId?.name}</div>
                    <div><strong>RX#:</strong> {pres.prescriptionNumber}</div>
                    <div><strong>Refills:</strong> {pres.refillsRemaining}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <div style={styles.noteSection}>
                <h3>📝 Visit Notes</h3>
                <div style={styles.noteInput}>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    style={{...styles.input, minHeight: '80px'}}
                    placeholder="Write your visit notes here..."
                  />
                  <button 
                    onClick={handleAddVisitNote} 
                    disabled={addingNote}
                    style={styles.addNoteBtn}
                  >
                    {addingNote ? 'Adding...' : '➕ Add Note'}
                  </button>
                </div>
              </div>

              <div style={styles.notesList}>
                {patientData.patient?.visitNotes?.length === 0 ? (
                  <p>No visit notes recorded.</p>
                ) : (
                  patientData.patient?.visitNotes?.map((note, index) => (
                    <div key={index} style={styles.noteCard}>
                      <div style={styles.noteHeader}>
                        <span style={styles.noteDoctor}>👨‍⚕️ {note.doctorName}</span>
                        <span style={styles.noteDate}>
                          {new Date(note.date).toLocaleDateString()} {new Date(note.date).toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={styles.noteText}>{note.note}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' },
  modalContent: { background: 'white', borderRadius: '8px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '25px', position: 'relative' },
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
  error: { textAlign: 'center', padding: '40px', color: '#dc3545' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '15px' },
  patientInfo: { flex: 1 },
  patientName: { margin: 0, color: '#333' },
  patientDetail: { margin: '5px 0', color: '#666' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#999' },
  tabs: { display: 'flex', gap: '5px', borderBottom: '2px solid #e0e0e0', marginBottom: '20px', overflowX: 'auto' },
  tab: { padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#666' },
  activeTab: { padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#1a73e8', borderBottom: '2px solid #1a73e8' },
  tabContent: { marginTop: '10px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' },
  statCard: { background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', borderBottom: '3px solid #1a73e8' },
  statNumber: { fontSize: '28px', fontWeight: 'bold', color: '#1a73e8' },
  statLabel: { color: '#666', fontSize: '14px' },
  quickInfo: { background: '#f8f9fa', padding: '15px', borderRadius: '8px' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginTop: '10px' },
  infoItem: { padding: '8px 0' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  editBtn: { background: '#1a73e8', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  editForm: { background: '#f8f9fa', padding: '20px', borderRadius: '8px' },
  formGroup: { marginBottom: '15px' },
  input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'inherit' },
  saveBtn: { background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' },
  historyDisplay: { background: '#f8f9fa', padding: '20px', borderRadius: '8px' },
  historyText: { background: 'white', padding: '15px', borderRadius: '4px', minHeight: '60px' },
  appointmentCard: { background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #1a73e8', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  prescriptionCard: { background: 'white', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #6f42c1', marginBottom: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  medName: { fontWeight: 'bold', fontSize: '16px' },
  statusBadge: { padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'capitalize' },
  noteSection: { marginBottom: '20px' },
  noteInput: { marginTop: '10px' },
  addNoteBtn: { background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', fontWeight: '600' },
  notesList: { marginTop: '20px' },
  noteCard: { background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '10px' },
  noteHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  noteDoctor: { fontWeight: 'bold' },
  noteDate: { color: '#666', fontSize: '12px' },
  noteText: { margin: 0, color: '#333' }
};

export default PatientMedicalHistory;