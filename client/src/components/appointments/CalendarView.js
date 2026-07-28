import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';


const CalendarView = () => {
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(res.data.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
    setLoading(false);
  };

  // Convert appointments to calendar events
  const getEvents = () => {
    return appointments.map(apt => ({
      id: apt._id,
      title: `${apt.patientId?.name || 'Unknown'}`,
      start: apt.dateTime,
      backgroundColor: getStatusColor(apt.status),
      borderColor: getStatusColor(apt.status),
      extendedProps: {
        status: apt.status,
        doctor: apt.doctorId?.name || 'N/A',
        patient: apt.patientId?.name || 'Unknown',
        reason: apt.reason
      }
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#1a73e8',
      arrived: '#ffc107',
      'in-progress': '#6f42c1',
      completed: '#28a745',
      cancelled: '#dc3545',
      'no-show': '#6c757d'
    };
    return colors[status] || '#1a73e8';
  };

  const handleEventClick = (clickInfo) => {
    const { status, doctor, patient, reason } = clickInfo.event.extendedProps;
    alert(
      `📋 Appointment Details\n\n` +
      `👤 Patient: ${patient}\n` +
      `👨‍⚕️ Doctor: ${doctor}\n` +
      `📝 Reason: ${reason}\n` +
      `📊 Status: ${status}`
    );
  };

  if (loading) {
    return <div style={styles.loading}>Loading calendar...</div>;
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>📅 Appointment Calendar</h3>
      <div style={styles.calendarWrapper}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          initialView="dayGridMonth"
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={getEvents()}
          eventClick={handleEventClick}
          height="auto"
        />
      </div>
      <div style={styles.legend}>
        <h4>Status Legend</h4>
        <div style={styles.legendItems}>
          <span style={{...styles.legendItem, backgroundColor: '#1a73e8'}}>Scheduled</span>
          <span style={{...styles.legendItem, backgroundColor: '#ffc107'}}>Arrived</span>
          <span style={{...styles.legendItem, backgroundColor: '#6f42c1'}}>In Progress</span>
          <span style={{...styles.legendItem, backgroundColor: '#28a745'}}>Completed</span>
          <span style={{...styles.legendItem, backgroundColor: '#dc3545'}}>Cancelled</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  title: {
    marginBottom: '20px',
    color: '#333'
  },
  calendarWrapper: {
    marginBottom: '20px'
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#666'
  },
  legend: {
    marginTop: '20px',
    padding: '15px',
    background: '#f8f9fa',
    borderRadius: '8px'
  },
  legendItems: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  legendItem: {
    padding: '4px 12px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: '500'
  }
};

export default CalendarView;
