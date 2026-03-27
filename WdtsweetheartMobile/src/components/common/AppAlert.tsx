import React from 'react';
import { 
  Modal, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Dimensions, 
  Animated 
} from 'react-native';
import { 
  AlertCircle, 
  CheckCircle2, 
  XSquare, 
  Info,
  HelpCircle 
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'confirm';

type AppAlertProps = {
  visible: boolean;
  title: string;
  message: string;
  type?: AlertType;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
};

const AppAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', 
  onClose, 
  onConfirm,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy'
}: AppAlertProps) => {

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={48} color="#007B55" />;
      case 'error':
        return <XSquare size={48} color="#FF4842" />;
      case 'warning':
        return <AlertCircle size={48} color="#FFAB00" />;
      case 'confirm':
        return <HelpCircle size={48} color="#1890FF" />;
      case 'info':
      default:
        return <Info size={48} color="#1890FF" />;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertCard}>
          <View style={styles.header}>
            {getIcon()}
            <Text style={styles.title}>{title}</Text>
          </View>
          
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.actionRow}>
            {(type === 'confirm' || onConfirm) && (
              <TouchableOpacity 
                style={[styles.btn, styles.cancelBtn]} 
                onPress={onClose}
              >
                <Text style={styles.cancelText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.btn, 
                onConfirm ? styles.confirmBtn : styles.infoBtn,
                type === 'error' && { backgroundColor: '#FF4842' }
              ]} 
              onPress={onConfirm || onClose}
            >
              <Text style={styles.confirmText}>
                {onConfirm ? confirmText : 'Đóng'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212B36',
    marginTop: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#637381',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBtn: {
    backgroundColor: '#111827',
  },
  confirmBtn: {
    backgroundColor: '#1890FF',
  },
  cancelBtn: {
    backgroundColor: '#F4F6F8',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  cancelText: {
    color: '#637381',
    fontSize: 15,
    fontWeight: '700',
  }
});

export default AppAlert;
