import React, { useState } from 'react';
import axios from 'axios';
import { showToast } from '../common/ToastNotifications';

const VideoCall = ({ appointmentId, patientName, doctorName }) => {
  const [loading, setLoading] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [roomUrl, setRoomUrl] = useState('');

  const startCall = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/video/create-room', {
        appointmentId
      });
      
      setRoomUrl(res.data.data.roomUrl);
      setCallStarted(true);
      showToast.success('📹 Video call started!');
      
      // Open video call in new window
      window.open(res.data.data.roomUrl, '_blank', 'width=1000,height=700');
    } catch (error) {
      console.error('Error starting call:', error);
      showToast.error('Failed to start video call');
    }
    setLoading(false);
  };

  const joinCall = () => {
    if (roomUrl) {
      window.open(roomUrl, '_blank', 'width=1000,height=700');
    }
  };

  return (
    <div style={styles.container}>
      {!callStarted ? (
        <button 
          onClick={startCall} 
          disabled={loading}
          style={styles.startButton}
        >
          {loading ? '⏳ Starting...' : '📹 Start Video Call'}
        </button>
      ) : (
        <div style={styles.callInfo}>
          <p style={styles.callStatus}>🟢 Call in progress...</p>
          <p style={styles.callDetails}>
            👤 {patientName} ↔️ 👨‍⚕️ {doctorName}
          </p>
          <button onClick={joinCall} style={styles.joinButton}>
            📹 Join Call
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginTop: '10px'
  },
  startButton: {
    background: '#28a745',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    width: '100%'
  },
  joinButton: {
    background: '#1a73e8',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    width: '100%'
  },
  callInfo: {
    background: '#e8f5e9',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  callStatus: {
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: '5px'
  },
  callDetails: {
    color: '#333',
    marginBottom: '10px'
  }
};

export default VideoCall;