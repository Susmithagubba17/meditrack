import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: '',
    dob: '',
    allergies: []
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        specialty: user.specialty || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        allergies: user.allergies || []
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await axios.put('http://localhost:5000/api/users/profile', formData);
      setMessage(res.data.message);
      // Update user in context
      setUser(res.data.data);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.put('http://localhost:5000/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to change password');
    }
    setLoading(false);
  };

  if (!user) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>👤 My Profile</h1>
        <p style={styles.subtitle}>Manage your account details</p>
      </div>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.card}>
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={user.email}
              style={{...styles.input, backgroundColor: '#f0f0f0'}}
              disabled
            />
            <small style={styles.hint}>Email cannot be changed</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </div>

          {user.role === 'doctor' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Specialization</label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                style={styles.input}
                required
              >
                <option value="General">General</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Orthopedic">Orthopedic</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Ophthalmologist">Ophthalmologist</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="Radiologist">Radiologist</option>
              </select>
            </div>
          )}

          {user.role === 'patient' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Allergies</label>
                <input
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  style={styles.input}
                  placeholder="e.g., Penicillin, Dust"
                />
                <small style={styles.hint}>Separate multiple allergies with commas</small>
              </div>
            </>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Role</label>
            <input
              type="text"
              value={user.role}
              style={{...styles.input, backgroundColor: '#f0f0f0', textTransform: 'capitalize'}}
              disabled
            />
          </div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Saving...' : '💾 Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password Section */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>🔐 Change Password</h3>
        {!showPasswordForm ? (
          <button 
            onClick={() => setShowPasswordForm(true)} 
            style={styles.secondaryButton}
          >
            Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                required
                minLength="6"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.buttonGroup}>
              <button type="submit" disabled={loading} style={styles.button}>
                {loading ? 'Updating...' : 'Update Password'}
              </button>
              <button 
                type="button" 
                onClick={() => setShowPasswordForm(false)} 
                style={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto'
  },
  header: {
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
  card: {
    background: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#333'
  },
  formGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  hint: {
    fontSize: '12px',
    color: '#666',
    marginTop: '5px'
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1a73e8',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    fontSize: '18px',
    color: '#666'
  }
};

export default Profile;