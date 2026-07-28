import React, { useState, useEffect } from 'react';
import axios from 'axios';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const Analytics = () => {
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(res.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  // Prepare data for charts
  const getStatusData = () => {
    const statuses = ['scheduled', 'arrived', 'in-progress', 'completed', 'cancelled'];
    return statuses.map(status => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: appointments.filter(a => a.status === status).length
    }));
  };

  const getMonthlyData = () => {
    const months = {};
    appointments.forEach(apt => {
      const month = new Date(apt.dateTime).toLocaleString('default', { month: 'short' });
      months[month] = (months[month] || 0) + 1;
    });
    return Object.keys(months).map(key => ({
      month: key,
      appointments: months[key]
    }));
  };

  const getDoctorData = () => {
    const doctors = {};
    appointments.forEach(apt => {
      const name = apt.doctorId?.name || 'Unknown';
      doctors[name] = (doctors[name] || 0) + 1;
    });
    return Object.keys(doctors).map(key => ({
      doctor: key,
      appointments: doctors[key]
    }));
  };

  const COLORS = ['#1a73e8', '#ffc107', '#6f42c1', '#28a745', '#dc3545'];

  const statusData = getStatusData();
  const monthlyData = getMonthlyData();
  const doctorData = getDoctorData();

  if (loading) {
    return <div style={styles.loading}>Loading analytics...</div>;
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📊 Analytics Dashboard</h2>
      <p style={styles.subtitle}>Overview of your clinic's performance</p>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{appointments.length}</div>
          <div style={styles.statLabel}>Total Appointments</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #28a745'}}>
          <div style={styles.statNumber}>
            {appointments.filter(a => a.status === 'completed').length}
          </div>
          <div style={styles.statLabel}>Completed</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #ffc107'}}>
          <div style={styles.statNumber}>
            {appointments.filter(a => a.status === 'scheduled').length}
          </div>
          <div style={styles.statLabel}>Scheduled</div>
        </div>
        <div style={{...styles.statCard, borderBottom: '3px solid #dc3545'}}>
          <div style={styles.statNumber}>
            {appointments.filter(a => a.status === 'cancelled').length}
          </div>
          <div style={styles.statLabel}>Cancelled</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={styles.chartsGrid}>
        {/* Status Pie Chart */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>Appointment Status</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Bar Chart */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>Monthly Appointments</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="#1a73e8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Doctor Workload */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>Doctor Workload</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={doctorData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="doctor" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="appointments" fill="#6f42c1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trends Area Chart */}
        <div style={styles.chartCard}>
          <h4 style={styles.chartTitle}>Appointment Trends</h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="appointments" stroke="#28a745" fill="#28a745" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  title: {
    fontSize: '28px',
    margin: 0,
    color: '#333'
  },
  subtitle: {
    color: '#666',
    margin: '5px 0 20px 0'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
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
    marginTop: '5px'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
    gap: '20px'
  },
  chartCard: {
    background: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  chartTitle: {
    margin: '0 0 15px 0',
    color: '#333'
  }
};

export default Analytics;
