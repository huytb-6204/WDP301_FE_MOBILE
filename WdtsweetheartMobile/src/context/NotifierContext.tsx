import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastType } from '../components/common/Toast';
import AppAlert, { AlertType } from '../components/common/AppAlert';

type NotifierContextType = {
  showToast: (message: string, type?: ToastType) => void;
  showAlert: (title: string, message: string, type?: AlertType, onConfirm?: () => void) => void;
};

const NotifierContext = createContext<NotifierContextType | undefined>(undefined);

export const NotifierProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' as ToastType });
  const [alert, setAlert] = useState({ 
    visible: false, 
    title: '', 
    message: '', 
    type: 'info' as AlertType,
    onConfirm: undefined as (() => void) | undefined
  });

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ visible: true, message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  const showAlert = useCallback((title: string, message: string, type: AlertType = 'info', onConfirm?: () => void) => {
    setAlert({ visible: true, title, message, type, onConfirm });
  }, []);

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <NotifierContext.Provider value={{ showToast, showAlert }}>
      {children}
      <Toast 
        visible={toast.visible} 
        message={toast.message} 
        type={toast.type} 
        onHide={hideToast} 
      />
      <AppAlert 
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
        onConfirm={alert.onConfirm ? () => {
            alert.onConfirm?.();
            hideAlert();
        } : undefined}
      />
    </NotifierContext.Provider>
  );
};

export const useNotifier = () => {
  const context = useContext(NotifierContext);
  if (!context) {
    throw new Error('useNotifier must be used within a NotifierProvider');
  }
  return context;
};
