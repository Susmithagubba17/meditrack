import React, { useState, useEffect } from 'react';
import axios from 'axios';
// ✅ Removed useAuth since user is not used
import { showToast } from '../common/ToastNotifications';

const RefillRequests = () => {
  const [refillRequests, setRefillRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchRefillRequests();
  }, []);

  const fetchRefillRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/refills');
      setRefillRequests(res.data.data || []);
    } catch (error) {
      console.error('Error fetching refill requests:', error);
      showToast.error('Failed to load refill requests');
    }
    setLoading(false);
  };

  const handleApprove = async (id) => {
    setProcessingId(id);
    try {
      await axios.put(`http://localhost:5000/api/refills/${id}/approve`);
      showToast.success('✅ Refill request approved!');
      fetchRefillRequests();
    } catch (error) {
      console.error('Error approving refill:', error);
      showToast.error(error.response?.data?.message || 'Failed to approve refill');
    }
    setProcessingId(null);
  };

  const handleDeny = async (id) => {
    const reason = prompt('Please provide a reason for denying this refill:');
    if (reason === null) return;
    
    setProcessingId(id);
    try {
      await axios.put(`http://localhost:5000/api/refills/${id}/deny`, { notes: reason });
      showToast.success('❌ Refill request denied');
      fetchRefillRequests();
    } catch (error) {
      console.error('Error denying refill:', error);
      showToast.error(error.response?.data?.message || 'Failed to deny refill');
    }
    setProcessingId(null);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading refill requests...</div>;
  }

  if (refillRequests.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <p style={styles.emptyIcon}>📋</p>
          <h3>No Pending Refill Requests</h3>
          <p style={styles.emptyText}>All refill requests have been processed.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>📋 Pending Refill Requests</h3>
        <span style={styles.badge}>{refillRequests.length} pending</span>
      </div>

      <div style={styles.requestGrid}>
        {refillRequests.map((request) => (
          <div key={request._id} style={styles.requestCard}>
            <div style={styles.patientInfo}>
              <div style={styles.avatar}>
                {request.patientId?.name?.charAt(0) || 'P'}
              </div>
              <div>
                <div style={styles.patientName}>{request.patientId?.name || 'Unknown Patient'}</div>
                <div style={styles.patientEmail}>{request.patientId?.email || ''}</div>
                <div style={styles.patientPhone}>📞 {request.patientId?.phone || 'N/A'}</div>
              </div>
            </div>

            <div style={styles.medicationInfo}>
              <div style={styles.medName}>
                💊 {request.prescriptionId?.medications[0]?.name || 'Unknown Medication'}
              </div>
              <div style={styles.medDetails}>
                <span>Dosage: {request.prescriptionId?.medications[0]?.dosage || 'N/A'}</span>
                <span>Frequency: {request.prescriptionId?.medications[0]?.frequency || 'N/A'}</span>
                <span>RX: {request.prescriptionId?.prescriptionNumber || 'N/A'}</span>
              </div>
            </div>

            <div style={styles.requestDetails}>
              <div style={styles.requestDate}>
                📅 Requested: {formatDate(request.createdAt)}
              </div>
              {request.notes && (
                <div style={styles.requestNote}>
                  📝 Note: "{request.notes}"
                </div>
              )}
            </div>

            <div style={styles.actionButtons}>
              <button
                onClick={() => handleApprove(request._id)}
                disabled={processingId === request._id}
                style={styles.approveBtn}
              >
                {processingId === request._id ? '⏳ Processing...' : '✅ Approve'}
              </button>
              <button
                onClick={() => handleDeny(request._id)}
                disabled={processingId === request._id}
                style={styles.denyBtn}
              >
                {processingId === request._id ? '⏳ Processing...' : '❌ Deny'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' },
  title: { margin: 0, color: '#333' },
  badge: { background: '#dc3545', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: '600' },
  loading: { textAlign: 'center', padding: '40px', color: '#666' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#666' },
  emptyIcon: { fontSize: '48px', margin: 0 },
  emptyText: { color: '#999' },
  requestGrid: { display: 'grid', gap: '15px' },
  requestCard: { background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' },
  patientInfo: { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' },
  avatar: { width: '50px', height: '50px', borderRadius: '50%', background: '#1a73e8', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' },
  patientName: { fontWeight: 'bold', fontSize: '18px', color: '#333' },
  patientEmail: { fontSize: '14px', color: '#666' },
  patientPhone: { fontSize: '14px', color: '#666' },
  medicationInfo: { background: 'white', padding: '12px', borderRadius: '6px', marginBottom: '12px' },
  medName: { fontWeight: 'bold', fontSize: '16px', color: '#333', marginBottom: '5px' },
  medDetails: { display: 'flex', gap: '15px', fontSize: '14px', color: '#666', flexWrap: 'wrap' },
  requestDetails: { marginBottom: '15px', fontSize: '14px', color: '#666' },
  requestDate: { marginBottom: '5px' },
  requestNote: { background: '#fff3cd', padding: '8px 12px', borderRadius: '4px', color: '#856404' },
  actionButtons: { display: 'flex', gap: '10px' },
  approveBtn: { background: '#28a745', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', flex: 1 },
  denyBtn: { background: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', flex: 1 }
};

export default RefillRequests;