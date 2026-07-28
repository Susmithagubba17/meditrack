import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import VideoCall from '../video/VideoCall';
import PaymentModal from '../payments/PaymentModal';
import { showToast } from '../common/ToastNotifications';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookForm, setShowBookForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: '',
    dateTime: '',
    reason: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

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

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/doctors');
      setDoctors(res.data.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      const loadingToast = showToast.loading('Booking appointment...');
      
      await axios.post('http://localhost:5000/api/appointments', {
        doctorId: formData.doctorId,
        dateTime: new Date(formData.dateTime).toISOString(),
        reason: formData.reason
      });
      
      showToast.dismiss(loadingToast);
      setShowBookForm(false);
      setFormData({ doctorId: '', dateTime: '', reason: '' });
      fetchAppointments();
      showToast.success('✅ Appointment booked successfully!');
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const handleCancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/appointments/${id}`);
        fetchAppointments();
        showToast.success('✅ Appointment cancelled!');
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        showToast.error('Failed to cancel appointment');
      }
    }
  };

  const handlePayment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (data) => {
    fetchAppointments(); // Refresh to update payment status
    showToast.success('✅ Payment successful! Appointment confirmed.');
  };

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Welcome, {user?.name} 👋</h2>
          <p style={styles.subtitle}>Patient Dashboard</p>
        </div>
        <button 
          onClick={() => setShowBookForm(!showBookForm)} 
          style={styles.bookBtn}
        >
          {showBookForm ? '✖ Cancel' : '+ Book Appointment'}
        </button>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{stats.total}</div>
          <div style={styles.statLabel}>Total Appointments</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #28a745'}}>
          <div style={styles.statNumber}>{stats.scheduled}</div>
          <div style={styles.statLabel}>Scheduled</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #17a2b8'}}>
          <div style={styles.statNumber}>{stats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #dc3545'}}>
          <div style={styles.statNumber}>{stats.cancelled}</div>
          <div style={styles.statLabel}>Cancelled</div>
        </div>
      </div>

      {/* Book Appointment Form */}
      {showBookForm && (
        <div style={styles.formContainer}>
          <h3>📅 Book New Appointment</h3>
          <form onSubmit={handleBookAppointment} style={styles.form}>
            <div style={styles.formGroup}>
              <label>Select Doctor</label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({...formData, doctorId: e.target.value})}
                required
                style={styles.input}
              >
                <option value="">Select a doctor...</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name} - {d.specialty || 'General'}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>Date & Time</label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({...formData, dateTime: e.target.value})}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Reason for Visit</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
                style={{...styles.input, minHeight: '80px'}}
                placeholder="Describe your symptoms or reason for visit..."
              />
            </div>
            <div style={styles.formActions}>
              <button type="submit" style={styles.submitBtn}>Book Appointment</button>
              <button 
                type="button" 
                onClick={() => setShowBookForm(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Appointments List */}
      <h3 style={styles.sectionTitle}>Your Appointments</h3>
      {appointments.length === 0 ? (
        <p style={styles.emptyState}>No appointments found. Book your first appointment!</p>
      ) : (
        <div style={styles.appointmentGrid}>
          {appointments.map((apt) => (
            <div key={apt._id} style={styles.appointmentCard}>
              <div style={styles.cardHeader}>
                <span style={styles.doctorName}>👨‍⚕️ {apt.doctorId?.name || 'Unknown Doctor'}</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: apt.status === 'completed' ? '#d4edda' : 
                                  apt.status === 'cancelled' ? '#f8d7da' : 
                                  apt.status === 'arrived' ? '#cce5ff' :
                                  apt.status === 'in-progress' ? '#fff3cd' : '#d4edda',
                  color: apt.status === 'completed' ? '#155724' : 
                         apt.status === 'cancelled' ? '#721c24' : 
                         apt.status === 'arrived' ? '#004085' :
                         apt.status === 'in-progress' ? '#856404' : '#155724'
                }}>
                  {apt.status}
                </span>
              </div>
              <div style={styles.cardDetail}>
                <strong>📅 Date:</strong> {new Date(apt.dateTime).toLocaleDateString()}
              </div>
              <div style={styles.cardDetail}>
                <strong>⏰ Time:</strong> {new Date(apt.dateTime).toLocaleTimeString()}
              </div>
              <div style={styles.cardDetail}>
                <strong>💊 Specialty:</strong> {apt.doctorId?.specialty || 'N/A'}
              </div>
              <div style={styles.cardDetail}>
                <strong>📝 Reason:</strong> {apt.reason}
              </div>

              {/* Payment Status */}
              <div style={styles.cardDetail}>
                <strong>💰 Payment:</strong>{' '}
                <span style={{
                  color: apt.paymentStatus === 'paid' ? '#28a745' : '#dc3545',
                  fontWeight: '600'
                }}>
                  {apt.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                </span>
                {apt.paymentMethod && apt.paymentStatus === 'paid' && (
                  <span style={styles.paymentMethodBadge}>
                    ({apt.paymentMethod.toUpperCase()})
                  </span>
                )}
              </div>

              {/* Video Call Button */}
              {(apt.status === 'scheduled' || apt.status === 'arrived' || apt.status === 'in-progress') && (
                <div style={styles.videoCallContainer}>
                  <VideoCall 
                    appointmentId={apt._id}
                    patientName={apt.patientId?.name || user?.name || 'Patient'}
                    doctorName={apt.doctorId?.name || 'Doctor'}
                  />
                </div>
              )}

              {/* Payment Button - Show only for scheduled appointments that are not paid */}
              {apt.status === 'scheduled' && apt.paymentStatus !== 'paid' && (
                <button 
                  onClick={() => handlePayment(apt)}
                  style={styles.payBtn}
                >
                  💳 Pay Now ${apt.amount || 50}
                </button>
              )}
              
              {apt.paymentStatus === 'paid' && (
                <span style={styles.paidLabel}>✅ Paid</span>
              )}

              {/* Cancel Button - Only for scheduled appointments */}
              {apt.status === 'scheduled' && (
                <button 
                  onClick={() => handleCancelAppointment(apt._id)}
                  style={styles.cancelAppointmentBtn}
                >
                  ❌ Cancel Appointment
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedAppointment && (
        <PaymentModal
          appointmentId={selectedAppointment._id}
          amount={selectedAppointment.amount || 50}
          doctorName={selectedAppointment.doctorId?.name || 'Doctor'}
          dateTime={selectedAppointment.dateTime}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
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
    alignItems: 'center',
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
    margin: '5px 0 0 0'
  },
  bookBtn: {
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
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
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a73e8'
  },
  statLabel: {
    color: '#666',
    marginTop: '5px'
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
  formActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  submitBtn: {
    background: '#28a745',
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
    color: '#333'
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
    gap: '20px'
  },
  appointmentCard: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #1a73e8'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  doctorName: {
    fontWeight: 'bold',
    fontSize: '16px'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    textTransform: 'capitalize'
  },
  cardDetail: {
    marginBottom: '5px',
    fontSize: '14px',
    color: '#555'
  },
  paymentMethodBadge: {
    fontSize: '11px',
    color: '#666',
    marginLeft: '5px',
    background: '#f0f0f0',
    padding: '2px 6px',
    borderRadius: '3px'
  },
  videoCallContainer: {
    marginTop: '10px',
    marginBottom: '10px'
  },
  payBtn: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '10px',
    width: '100%',
    fontWeight: '600'
  },
  paidLabel: {
    background: '#d4edda',
    color: '#155724',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    textAlign: 'center',
    display: 'block',
    marginTop: '10px',
    fontWeight: '600'
  },
  cancelAppointmentBtn: {
    marginTop: '10px',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    width: '100%'
  }
};

export default PatientDashboard;
