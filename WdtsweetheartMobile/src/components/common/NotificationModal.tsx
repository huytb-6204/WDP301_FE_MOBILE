import React, { useState, useEffect, useCallback } from 'react';
import { 
  Modal, View, Text, StyleSheet, TouchableOpacity, 
  FlatList, ActivityIndicator, Dimensions 
} from 'react-native';
import { 
  X, CheckCheck, Trash2, Bell, 
  Home, ShoppingBag, AlertTriangle, Info,
} from 'lucide-react-native';
import { colors } from '../../theme/colors';
import * as notificationService from '../../services/api/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const NotificationModal = ({ visible, onClose }: NotificationModalProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all');
  const [notifications, setNotifications] = useState<notificationService.Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, fetchNotifications]);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return n.status === 'unread';
    if (activeTab === 'archived') return n.status === 'archived';
    return n.status !== 'archived';
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;
  const archivedCount = notifications.filter(n => n.status === 'archived').length;

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Mark all read failed', error);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Delete all failed', error);
    }
  };

  const handleRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as any } : n));
    } catch (error) {
      console.error('Mark as read failed', error);
    }
  };

  const renderIcon = (type?: string) => {
    const t = type?.toLowerCase();
    if (t?.includes('booking') || t?.includes('đặt')) return <Home size={18} color="#B78103" />;
    if (t?.includes('order') || t?.includes('đơn')) return <ShoppingBag size={18} color="#006C9C" />;
    if (t?.includes('warning') || t?.includes('cảnh báo')) return <AlertTriangle size={18} color="#FF4842" />;
    return <Info size={18} color="#637381" />;
  };

  const getIconBg = (type?: string) => {
    const t = type?.toLowerCase();
    if (t?.includes('booking') || t?.includes('đặt')) return '#FFF7CD';
    if (t?.includes('order') || t?.includes('đơn')) return '#D0F2FE';
    if (t?.includes('warning') || t?.includes('cảnh báo')) return '#FFE7E6';
    return '#F4F6F8';
  };

  const renderItem = ({ item }: { item: notificationService.Notification }) => (
    <TouchableOpacity 
      style={[styles.notiItem, item.status === 'unread' && styles.unreadItem]}
      onPress={() => item.status === 'unread' && handleRead(item._id)}
    >
      <View style={[styles.iconWrap, { backgroundColor: getIconBg(item.type || item.category) }]}>
        {renderIcon(item.type || item.category)}
      </View>
      <View style={styles.notiContent}>
        <View style={styles.notiHeader}>
          <Text style={styles.notiTitle} numberOfLines={1}>{item.title}</Text>
          {item.status === 'unread' && <View style={styles.readDot} />}
        </View>
        <Text style={styles.notiDesc} numberOfLines={2}>{item.content}</Text>
        <View style={styles.notiFooter}>
          <Text style={styles.notiTime}>{dayjs(item.createdAt).fromNow()}</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.notiCategory}>{item.category || (item.type?.includes('booking') ? 'Khách sạn' : 'Hệ thống')}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Thông báo</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleMarkAllRead}>
                <CheckCheck size={20} color="#00A76F" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleDeleteAll}>
                <Trash2 size={20} color="#637381" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={onClose}>
                <X size={20} color="#637381" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'all' && styles.activeTab]}
              onPress={() => setActiveTab('all')}
            >
              <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tất cả</Text>
              <View style={[styles.badge, { backgroundColor: '#212B36' }]}>
                <Text style={styles.badgeText}>{notifications.filter(n => n.status !== 'archived').length}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'unread' && styles.activeTab]}
              onPress={() => setActiveTab('unread')}
            >
              <Text style={[styles.tabText, activeTab === 'unread' && styles.activeTabText]}>Chưa đọc</Text>
              <View style={[styles.badge, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'archived' && styles.activeTab]}
              onPress={() => setActiveTab('archived')}
            >
              <Text style={[styles.tabText, activeTab === 'archived' && styles.activeTabText]}>Lưu trữ</Text>
              <View style={[styles.badge, { backgroundColor: '#00A76F' }]}>
                <Text style={styles.badgeText}>{archivedCount}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* List */}
          {loading ? (
             <View style={styles.loadingWrap}><ActivityIndicator color={colors.primary} /></View>
          ) : (
            <FlatList
                data={filteredNotifications}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                <View style={styles.emptyWrap}>
                    <Bell size={64} color="#F4F6F8" />
                    <Text style={styles.emptyText}>Không có thông báo nào</Text>
                </View>
                }
            />
          )}

          {/* Footer */}
          <TouchableOpacity style={styles.footer} onPress={onClose}>
            <Text style={styles.footerText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SCREEN_HEIGHT * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212B36',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionBtn: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F4F6F8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#637381',
  },
  activeTabText: {
    color: '#212B36',
  },
  badge: {
    paddingHorizontal: 6,
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
  },
  list: {
    paddingBottom: 20,
  },
  notiItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8',
  },
  unreadItem: {
    backgroundColor: '#F9FAFB',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notiContent: {
    flex: 1,
  },
  notiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#212B36',
    flex: 1,
  },
  readDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginLeft: 8,
  },
  notiDesc: {
    fontSize: 13,
    color: '#637381',
    marginTop: 4,
    lineHeight: 18,
  },
  notiFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  notiTime: {
    fontSize: 12,
    color: '#919EAB',
  },
  dotSeparator: {
    marginHorizontal: 8,
    fontSize: 12,
    color: '#919EAB',
  },
  notiCategory: {
    fontSize: 12,
    color: '#919EAB',
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F4F6F8',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#212B36',
  },
  emptyWrap: {
    padding: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#919EAB',
    fontWeight: '600',
  },
  loadingWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
  }
});

export default NotificationModal;
