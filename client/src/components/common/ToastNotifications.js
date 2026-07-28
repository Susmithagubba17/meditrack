import React from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Toast notification component
const ToastNotifications = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#363636',
          color: '#fff',
          padding: '16px',
          borderRadius: '8px',
        },
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#4ade80',
            secondary: '#fff',
          },
        },
        error: {
          duration: 4000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
        },
        loading: {
          duration: 2000,
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

// Helper functions for easy use
export const showToast = {
  success: (message) => toast.success(message),
  error: (message) => toast.error(message),
  loading: (message) => toast.loading(message),
  dismiss: () => toast.dismiss(),
  custom: (message, options) => toast(message, options),
};

export default ToastNotifications;