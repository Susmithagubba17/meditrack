import React, { useState } from 'react';
import axios from 'axios';
import { showToast } from '../common/ToastNotifications';

const PaymentModal = ({
  appointmentId,
  amount = 50,
  doctorName,
  dateTime,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [showQR, setShowQR] = useState(false);

  const formatCardNumber = (value) => {
    const v = value.replace(/\s/g, '').replace(/\D/g, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  // ✅ FIXED: Added parentheses to fix mixed operators
// ✅ Fixed
const formatExpiry = (value) => {
  const v = value.replace(/\D/g, '');
  if ((v.length >= 2 && v.length <= 4) || v.length === 6) {
    return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
  }
  return v;
};

  const handleCardPayment = async () => {
    if (!cardNumber || !expiry || !cvc) {
      showToast.error('Please fill in all card details');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      showToast.error('Please enter a valid 16-digit card number');
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await axios.put(
        `http://localhost:5000/api/payments/appointments/${appointmentId}/pay`,
        {
          paymentMethod: 'card',
          amount: amount
        }
      );

      showToast.success('✅ Payment successful!');
      onSuccess(response.data.data);
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      showToast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    }
    setLoading(false);
  };

  const handleCashPayment = async () => {
    setLoading(true);

    try {
      const response = await axios.put(
        `http://localhost:5000/api/payments/appointments/${appointmentId}/pay`,
        {
          paymentMethod: 'cash',
          amount: amount
        }
      );

      showToast.success('✅ Appointment confirmed! Pay at clinic during your visit.');
      onSuccess(response.data.data);
      onClose();
    } catch (error) {
      console.error('Cash payment error:', error);
      showToast.error('Failed to confirm appointment. Please try again.');
    }
    setLoading(false);
  };

  const handleUpiPayment = async () => {
    if (!showQR) {
      setShowQR(true);
      return;
    }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await axios.put(
        `http://localhost:5000/api/payments/appointments/${appointmentId}/pay`,
        {
          paymentMethod: 'upi',
          amount: amount
        }
      );

      showToast.success('✅ UPI payment successful!');
      onSuccess(response.data.data);
      onClose();
    } catch (error) {
      console.error('UPI payment error:', error);
      showToast.error('UPI payment failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <div style={styles.header}>
          <h2 style={styles.title}>💳 Complete Payment</h2>
          <button onClick={onClose} style={styles.closeBtn}>✖</button>
        </div>

        <div style={styles.appointmentInfo}>
          <p><strong>👨‍⚕️ Doctor:</strong> {doctorName}</p>
          <p><strong>📅 Date:</strong> {new Date(dateTime).toLocaleDateString()}</p>
          <p><strong>⏰ Time:</strong> {new Date(dateTime).toLocaleTimeString()}</p>
          <p><strong>💰 Amount:</strong> ${amount.toFixed(2)}</p>
        </div>

        <div style={styles.methodSelector}>
          <button
            onClick={() => { setPaymentMethod('card'); setShowQR(false); }}
            style={paymentMethod === 'card' ? styles.activeMethod : styles.method}
          >
            💳 Card
          </button>
          <button
            onClick={() => { setPaymentMethod('cash'); setShowQR(false); }}
            style={paymentMethod === 'cash' ? styles.activeMethod : styles.method}
          >
            💵 Cash
          </button>
          <button
            onClick={() => { setPaymentMethod('upi'); setShowQR(false); }}
            style={paymentMethod === 'upi' ? styles.activeMethod : styles.method}
          >
            📱 UPI
          </button>
        </div>

        <div style={styles.paymentSection}>
          {paymentMethod === 'card' && (
            <div>
              <div style={styles.testCards}>
                <p style={styles.testLabel}>🔑 Test Cards (Simulated Mode)</p>
                <div style={styles.testCard}>
                  <span>💳 4242 4242 4242 4242</span>
                  <span>12/26 • 123</span>
                </div>
                <div style={styles.testCard}>
                  <span>💳 5555 5555 5555 4444</span>
                  <span>12/26 • 123</span>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="4242 4242 4242 4242"
                  style={styles.input}
                  maxLength="19"
                />
              </div>

              <div style={styles.row}>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    style={styles.input}
                    maxLength="5"
                  />
                </div>
                <div style={styles.formGroupHalf}>
                  <label style={styles.label}>CVC</label>
                  <input
                    type="password"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                    placeholder="123"
                    style={styles.input}
                    maxLength="3"
                  />
                </div>
              </div>

              <button
                onClick={handleCardPayment}
                disabled={loading}
                style={styles.payButton}
              >
                {loading ? '⏳ Processing...' : `💳 Pay $${amount.toFixed(2)}`}
              </button>
            </div>
          )}

          {paymentMethod === 'cash' && (
            <div>
              <div style={styles.cashInfo}>
                <p>💵 You will pay <strong>${amount.toFixed(2)}</strong> at the clinic during your visit.</p>
                <p>📋 Please bring cash or card for payment.</p>
              </div>
              <button
                onClick={handleCashPayment}
                disabled={loading}
                style={styles.cashButton}
              >
                {loading ? '⏳ Processing...' : '✅ Confirm Appointment'}
              </button>
            </div>
          )}

          {paymentMethod === 'upi' && (
            <div>
              <div style={styles.upiInfo}>
                {showQR ? (
                  <div>
                    <div style={styles.qrBox}>
                      <p style={styles.qrPlaceholder}>📱 QR CODE</p>
                      <p style={styles.qrSubtext}>Scan with PhonePe / Google Pay</p>
                    </div>
                    <p style={styles.upiId}>UPI ID: <strong>meditrack@paytm</strong></p>
                  </div>
                ) : (
                  <div>
                    <p>📱 Pay using any UPI app:</p>
                    <ul style={styles.upiList}>
                      <li>Google Pay</li>
                      <li>PhonePe</li>
                      <li>Paytm</li>
                    </ul>
                    <button
                      onClick={handleUpiPayment}
                      disabled={loading}
                      style={styles.upiButton}
                    >
                      {loading ? '⏳ Processing...' : '📱 Show QR Code'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button onClick={onClose} style={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </div>
  );
};

const styles = {
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modalContent: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '520px',
    width: '100%',
    padding: '30px',
    position: 'relative',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '2px solid #f0f0f0',
    paddingBottom: '15px'
  },
  title: { margin: 0, color: '#333' },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999' },
  appointmentInfo: { background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  methodSelector: { display: 'flex', gap: '10px', marginBottom: '20px' },
  method: { flex: 1, padding: '10px', border: '2px solid #ddd', borderRadius: '8px', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '500' },
  activeMethod: { flex: 1, padding: '10px', border: '2px solid #1a73e8', borderRadius: '8px', background: '#e8f0fe', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#1a73e8' },
  paymentSection: { marginBottom: '15px' },
  testCards: { background: '#e3f2fd', padding: '12px', borderRadius: '8px', marginBottom: '15px' },
  testLabel: { margin: '0 0 8px 0', fontWeight: 'bold', fontSize: '13px', color: '#1a73e8' },
  testCard: { background: 'white', padding: '6px 12px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' },
  formGroup: { marginBottom: '15px', textAlign: 'left' },
  formGroupHalf: { marginBottom: '15px', textAlign: 'left', width: '48%' },
  row: { display: 'flex', justifyContent: 'space-between', gap: '10px' },
  label: { display: 'block', marginBottom: '5px', fontWeight: '500', color: '#333', fontSize: '14px' },
  input: { width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: 'white' },
  payButton: { background: '#28a745', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '4px', fontSize: '18px', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '10px' },
  cashInfo: { background: '#fff3cd', padding: '15px', borderRadius: '8px', textAlign: 'left', marginBottom: '15px' },
  cashButton: { background: '#ffc107', color: '#333', border: 'none', padding: '14px 30px', borderRadius: '4px', fontSize: '18px', fontWeight: '600', cursor: 'pointer', width: '100%' },
  upiInfo: { textAlign: 'center' },
  upiList: { textAlign: 'left', listStyle: 'none', padding: 0 },
  upiButton: { background: '#6f42c1', color: 'white', border: 'none', padding: '14px 30px', borderRadius: '4px', fontSize: '18px', fontWeight: '600', cursor: 'pointer', width: '100%', marginTop: '10px' },
  qrBox: { background: 'white', padding: '30px', border: '2px dashed #ddd', borderRadius: '12px', margin: '15px 0', textAlign: 'center' },
  qrPlaceholder: { fontSize: '32px', margin: 0 },
  qrSubtext: { color: '#666', fontSize: '14px' },
  upiId: { background: '#f0f0f0', padding: '8px', borderRadius: '4px', margin: '5px 0' },
  cancelButton: { background: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px', width: '100%', marginTop: '10px' }
};

export default PaymentModal;
