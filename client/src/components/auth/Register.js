import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'patient',
    specialty: 'General', // ✅ Added for doctors
    dob: '',
    allergies: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Format data for API
    const apiData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      phone: formData.phone,
      specialty: formData.specialty || 'General',
      dob: formData.dob || null,
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : []
    };

    const result = await register(apiData);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏥 MediTrack</h1>
          <p style={styles.subtitle}>Create your account</p>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your full name"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your email"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              style={styles.input}
              placeholder="Min 6 characters"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Phone *</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Enter your phone number"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Role *</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </div>

          {/* ✅ Specialization Field - Only shows when Role is Doctor */}
          {formData.role === 'doctor' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Specialization *</label>
              <select
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
                style={styles.input}
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
                <option value="Surgeon">Surgeon</option>
                <option value="Urologist">Urologist</option>
                <option value="ENT Specialist">ENT Specialist</option>
              </select>
            </div>
          )}

          {/* ✅ Date of Birth - Only for Patients */}
          {formData.role === 'patient' && (
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
          )}

          {/* ✅ Allergies - Only for Patients */}
          {formData.role === 'patient' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Allergies (comma separated)</label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                style={styles.input}
                placeholder="e.g., Penicillin, Peanuts, Dust"
              />
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.linkText}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f0f2f5'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '450px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    color: '#1a73e8',
    fontSize: '28px',
    margin: 0
  },
  subtitle: {
    color: '#666',
    marginTop: '8px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: '500',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    boxSizing: 'border-box'
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
    cursor: 'pointer',
    marginTop: '10px'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '16px'
  },
  link: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#666'
  },
  linkText: {
    color: '#1a73e8',
    textDecoration: 'none',
    fontWeight: '600'
  }
};

export default Register;