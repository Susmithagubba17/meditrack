import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { showToast } from '../common/ToastNotifications';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/payments/history');
      setPayments(res.data.data || []);
    } catch (error) {
      console.error('Error fetching payment history:', error);
      showToast.error('Failed to load payment history');
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={styles.loading}>Loading payment history...</div>;
  }

  if (payments.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyIcon}>💳</p>
        <h3>No Payment History</h3>
        <p style={styles.emptyText}>You haven't made any payments yet.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>💳 Payment History</h3>
      <div style={styles.paymentList}>
        {payments.map(payment => (
          <div key={payment._id} style={styles.paymentCard}>
            <div style={styles.cardHeader}>
              <span style={styles.doctorName}>👨‍⚕️ {payment.doctorId?.name || 'Doctor'}</span>
              <span style={styles.amount}>${payment.amount?.toFixed(2) || '50.00'}</span>
            </div>
            <div style={styles.cardDetails}>
              <div><strong>Date:</strong> {new Date(payment.paymentDate).toLocaleDateString()}</div>
              <div><strong>Time:</strong> {new Date(payment.paymentDate).toLocaleTimeString()}</div>
              <div><strong>Method:</strong> {payment.paymentMethod?.toUpperCase() || 'Card'}</div>
              <div><strong>Payment ID:</strong> {payment.paymentId || 'N/A'}</div>
              <div><strong>Status:</strong> <span style={styles.paid}>✅ Paid</span></div>
            </div>
            <div style={styles.appointmentInfo}>
              <strong>Appointment:</strong> {new Date(payment.dateTime).toLocaleDateString()} at {new Date(payment.dateTime).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  empty: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  emptyIcon: {
    fontSize: '48px',
    margin: 0
  },
  emptyText: {
    color: '#999'
  },
  title: {
    marginBottom: '20px',
    color: '#333'
  },
  paymentList: {
    display: 'grid',
    gap: '15px'
  },
  paymentCard: {
    background: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    borderLeft: '4px solid #28a745'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '10px'
  },
  doctorName: {
    fontWeight: 'bold',
    fontSize: '16px'
  },
  amount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#28a745'
  },
  cardDetails: {
    fontSize: '14px',
    color: '#555'
  },
  paid: {
    color: '#28a745',
    fontWeight: '600'
  },
  appointmentInfo: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px solid #f0f0f0',
    fontSize: '14px',
    color: '#555'
  }
};

export default PaymentHistory;