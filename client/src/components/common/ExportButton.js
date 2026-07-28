import React, { useState } from 'react';
import axios from 'axios';
import { showToast } from './ToastNotifications';

const ExportButton = ({ type, label, icon, variant = 'primary' }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    const toastId = showToast.loading(`Exporting ${label}...`);

    try {
      const response = await axios.get(`http://localhost:5000/api/export/${type}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename=([^;]+)/);
        if (match) filename = match[1];
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

      showToast.dismiss(toastId);
      showToast.success(`✅ ${label} exported successfully!`);
    } catch (error) {
      console.error(`Export error:`, error);
      showToast.dismiss(toastId);
      showToast.error(`❌ Failed to export ${label}. Please try again.`);
    }
    setLoading(false);
  };

  const getButtonStyle = () => {
    const styles = {
      primary: {
        background: '#1a73e8',
        color: 'white'
      },
      success: {
        background: '#28a745',
        color: 'white'
      },
      warning: {
        background: '#ffc107',
        color: '#333'
      },
      danger: {
        background: '#dc3545',
        color: 'white'
      }
    };
    return styles[variant] || styles.primary;
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      style={{
        ...styles.button,
        ...getButtonStyle(),
        opacity: loading ? 0.7 : 1
      }}
    >
      {loading ? '⏳' : icon || '📊'} {loading ? 'Exporting...' : label}
    </button>
  );
};

const styles = {
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  }
};

export default ExportButton;