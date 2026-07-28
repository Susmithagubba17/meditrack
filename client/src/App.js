import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import PatientDashboard from './components/dashboard/PatientDashboard';
import DoctorDashboard from './components/dashboard/DoctorDashboard';
import ReceptionistDashboard from './components/dashboard/ReceptionistDashboard';
import PrivateRoute from './components/common/PrivateRoute';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';  // ✅ NEW
import CalendarView from './components/appointments/CalendarView'; // ✅ NEW
import ToastNotifications from './components/common/ToastNotifications';
import RefillRequest from './components/prescriptions/RefillRequest';

import PaymentHistory from './components/payments/PaymentHistory';
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  switch(user.role) {
    case 'doctor':
      return <DoctorDashboard />;
    case 'receptionist':
      return <ReceptionistDashboard />;
    default:
      return <PatientDashboard />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <ToastNotifications />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/analytics" element={
            <PrivateRoute>
              <Analytics />
            </PrivateRoute>
          } />
          <Route path="/calendar" element={
            <PrivateRoute>
              <CalendarView />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardRouter />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/refills" element={
  <PrivateRoute>
    <RefillRequest />
  </PrivateRoute>
} />
<Route path="/payments" element={
  <PrivateRoute>
    <PaymentHistory />
  </PrivateRoute>
} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;