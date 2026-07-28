import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../common/ToastNotifications';

const RefillRequest = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [refillHistory, setRefillHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prescriptionsRes, historyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/prescriptions'),
        axios.get('http://localhost:5000/api/refills/history')
      ]);
      setPrescriptions(prescriptionsRes.data.data || []);
      setRefillHistory(historyRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast.error('Failed to load data');
    }
    setLoading(false);
  };

  const requestRefill = async (prescriptionId) => {
    try {
      await axios.post('http://localhost:5000/api/refills', { prescriptionId });
      showToast.success('✅ Refill request sent to doctor!');
      fetchData(); // Refresh data
    } catch (error) {
      showToast.error(error.response?.data?.message || 'Failed to request refill');
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>💊 Prescription Refills</h2>

      {/* Active Prescriptions */}
      <h3 style={styles.subtitle}>Your Active Prescriptions</h3>
      {prescriptions.length === 0 ? (
        <p style={styles.emptyState}>No active prescriptions found.</p>
      ) : (
        <div style={styles.grid}>
          {prescriptions.map(pres => (
            <div key={pres._id} style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.medName}>💊 {pres.medications[0]?.name}</span>
                <span style={styles.rxNumber}>{pres.prescriptionNumber}</span>
              </div>
              <div style={styles.cardDetails}>
                <div><strong>Dosage:</strong> {pres.medications[0]?.dosage}</div>
                <div><strong>Frequency:</strong> {pres.medications[0]?.frequency}</div>
                <div><strong>Refills Left:</strong> {pres.refillsRemaining}</div>
                <div><strong>Status:</strong> {pres.isActive ? '✅ Active' : '❌ Inactive'}</div>
              </div>
              {pres.isActive && pres.refillsRemaining > 0 && (
                <button 
                  onClick={() => requestRefill(pres._id)}
                  style={styles.refillBtn}
                >
                  📝 Request Refill
                </button>
              )}
              {pres.isActive && pres.refillsRemaining === 0 && (
                <p style={styles.noRefills}>⚠️ No refills remaining - Please contact your doctor</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Refill History */}
      <h3 style={styles.subtitle}>📋 Refill History</h3>
      {refillHistory.length === 0 ? (
        <p style={styles.emptyState}>No refill requests yet.</p>
      ) : (
        <div style={styles.historyGrid}>
          {refillHistory.map(req => (
            <div key={req._id} style={styles.historyCard}>
              <div style={styles.cardHeader}>
                <span>💊 {req.prescriptionId?.medications[0]?.name || 'Unknown'}</span>
                <span style={{
                  ...styles.statusBadge,
                  backgroundColor: req.status === 'approved' ? '#d4edda' :
                                  req.status === 'denied' ? '#f8d7da' : '#fff3cd',
                  color: req.status === 'approved' ? '#155724' :
                         req.status === 'denied' ? '#721c24' : '#856404'
                }}>
                  {req.status}
                </span>
              </div>
              <div style={styles.cardDetails}>
                <div><strong>Doctor:</strong> {req.doctorId?.name || 'N/A'}</div>
                <div><strong>Requested:</strong> {new Date(req.createdAt).toLocaleDateString()}</div>
                {req.notes && <div><strong>Note:</strong> {req.notes}</div>}
                {req.status !== 'pending' && (
                  <div><strong>Reviewed:</strong> {new Date(req.reviewedDate).toLocaleDateString()}</div>
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
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  title: {
    fontSize: '28px',
    margin: '0 0 20px 0',
    color: '#333'
  },
  subtitle: {
    color: '#333',
    marginTop: '30px',
    marginBottom: '15px',
    borderBottom: '2px solid #1a73e8',
    paddingBottom: '10px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  card: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #6f42c1'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  medName: {
    fontWeight: 'bold',
    fontSize: '18px',
    color: '#333'
  },
  rxNumber: {
    color: '#666',
    fontSize: '14px'
  },
  cardDetails: {
    fontSize: '14px',
    color: '#555'
  },
  refillBtn: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '10px',
    width: '100%'
  },
  noRefills: {
    color: '#dc3545',
    fontSize: '14px',
    marginTop: '10px',
    background: '#f8d7da',
    padding: '8px',
    borderRadius: '4px',
    textAlign: 'center'
  },
  emptyState: {
    color: '#666',
    textAlign: 'center',
    padding: '40px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  historyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '15px'
  },
  historyCard: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #17a2b8'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    textTransform: 'capitalize'
  }
};

export default RefillRequest;