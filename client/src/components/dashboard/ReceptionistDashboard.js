import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import ExportButton from '../common/ExportButton';
const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(res.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
    setLoading(false);
  };

  const handleCheckIn = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, {
        status: 'arrived'
      });
      fetchAppointments();
      alert('✅ Patient checked in successfully!');
    } catch (error) {
      console.error('Error checking in patient:', error);
      alert('❌ Failed to check in patient.');
    }
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, {
        status: 'completed'
      });
      fetchAppointments();
      alert('✅ Appointment marked as completed!');
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('❌ Failed to complete appointment.');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/appointments/${id}`);
        fetchAppointments();
        alert('✅ Appointment cancelled!');
      } catch (error) {
        console.error('Error cancelling appointment:', error);
        alert('❌ Failed to cancel appointment.');
      }
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    apt.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.doctorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    arrived: appointments.filter(a => a.status === 'arrived').length,
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
          <h2 style={styles.title}>📋 Welcome, {user?.name}</h2>
          <p style={styles.subtitle}>Receptionist Dashboard</p>
        </div>
        <div style={styles.stats}>
          <span style={styles.statBadge}>📅 Today: {new Date().toLocaleDateString()}</span>
        </div>
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
        <div style={{...styles.statCard, borderBottom: '3px solid #28a745'}}>
          <div style={styles.statNumber}>{stats.completed}</div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #dc3545'}}>
          <div style={styles.statNumber}>{stats.cancelled}</div>
          <div style={styles.statLabel}>Cancelled</div>
        </div>
      </div>
      // Add this after the stats cards
<div style={styles.exportSection}>
  <h4 style={styles.exportTitle}>📊 Export Reports</h4>
  <div style={styles.exportButtons}>
    <ExportButton type="appointments" label="Appointments" variant="primary" icon="📋" />
    <ExportButton type="prescriptions" label="Prescriptions" variant="success" icon="💊" />
    <ExportButton type="patients" label="Patients" variant="warning" icon="👤" />
  </div>
</div>

      {/* Search Bar */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="🔍 Search by patient or doctor name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Appointments List */}
      <h3 style={styles.sectionTitle}>All Appointments</h3>
      {filteredAppointments.length === 0 ? (
        <p style={styles.emptyState}>
          {searchTerm ? 'No appointments match your search.' : 'No appointments found.'}
        </p>
      ) : (
        <div style={styles.appointmentGrid}>
          {filteredAppointments.map((apt) => (
            <div key={apt._id} style={styles.appointmentCard}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.patientName}>👤 {apt.patientId?.name || 'Unknown'}</span>
                  <span style={styles.doctorName}>👨‍⚕️ {apt.doctorId?.name || 'N/A'}</span>
                </div>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: apt.status === 'completed' ? '#d4edda' : 
                                  apt.status === 'cancelled' ? '#f8d7da' : 
                                  apt.status === 'arrived' ? '#fff3cd' : 
                                  apt.status === 'in-progress' ? '#cce5ff' : '#d4edda',
                  color: apt.status === 'completed' ? '#155724' : 
                         apt.status === 'cancelled' ? '#721c24' : 
                         apt.status === 'arrived' ? '#856404' : 
                         apt.status === 'in-progress' ? '#004085' : '#155724'
                }}>
                  {apt.status}
                </span>
              </div>
              <div style={styles.cardDetails}>
                <div style={styles.cardDetail}>
                  <strong>📅 Date:</strong> {new Date(apt.dateTime).toLocaleDateString()}
                </div>
                <div style={styles.cardDetail}>
                  <strong>⏰ Time:</strong> {new Date(apt.dateTime).toLocaleTimeString()}
                </div>
                <div style={styles.cardDetail}>
                  <strong>📝 Reason:</strong> {apt.reason}
                </div>
                <div style={styles.cardDetail}>
                  <strong>📞 Phone:</strong> {apt.patientId?.phone || 'N/A'}
                </div>
                <div style={styles.cardDetail}>
                  <strong>💊 Specialty:</strong> {apt.doctorId?.specialty || 'N/A'}
                </div>
              </div>
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
                  <button 
                    onClick={() => handleComplete(apt._id)}
                    style={styles.completeBtn}
                  >
                    ✅ Complete
                  </button>
                )}
                {(apt.status === 'scheduled' || apt.status === 'arrived') && (
                  <button 
                    onClick={() => handleCancel(apt._id)}
                    style={styles.cancelBtn}
                  >
                    ❌ Cancel
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
    marginBottom: '30px'
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
  stats: {
    display: 'flex',
    gap: '10px'
  },
  statBadge: {
    background: '#1a73e8',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a73e8'
  },
  statLabel: {
    color: '#666',
    marginTop: '5px',
    fontSize: '14px'
  },
  searchContainer: {
    marginBottom: '20px'
  },
  searchInput: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box'
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
    borderLeft: '4px solid #17a2b8'
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
  doctorName: {
    fontSize: '14px',
    color: '#555',
    display: 'block'
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
  cancelBtn: {
    background: '#dc3545',
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
  }
};

export default ReceptionistDashboard;