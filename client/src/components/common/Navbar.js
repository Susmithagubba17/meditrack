import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🏥</span> MediTrack
        </Link>
        <div style={styles.navLinks}>
          {user ? (
            <>
              <Link to="/dashboard" style={styles.link}>Dashboard</Link>
              <Link to="/calendar" style={styles.link}>📅 Calendar</Link>  {/* ✅ NEW */}
            
<Link to="/refills" style={styles.link}>💊 Refills</Link>
              <Link to="/analytics" style={styles.link}>📊 Analytics</Link>  {/* ✅ NEW */}
              <Link to="/profile" style={styles.link}>👤 Profile</Link>
              <div style={styles.userInfo}>
                <span style={styles.userName}>{user.name}</span>
                <span style={styles.userRole}>({user.role})</span>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.link}>Register</Link>
              <Link to="/payments" style={styles.link}>💳 Payments</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: '#1a73e8',
    padding: '15px 0',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: 'white',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoIcon: {
    fontSize: '28px'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'background 0.3s'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginRight: '10px'
  },
  userName: {
    fontWeight: '600'
  },
  userRole: {
    fontSize: '14px',
    opacity: 0.8,
    textTransform: 'capitalize'
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid white',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '14px'
  }
};

export default Navbar;