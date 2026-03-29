import React from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Archive, Bell, CheckCheck, Trash2, X } from 'lucide-react-native';
import dayjs from 'dayjs';
import { getStaffThemeColors } from '../../theme/staffTheme';
import type { StaffNotification } from '../../services/api/notification';

type NotificationModalProps = {
  visible: boolean;
  isDarkMode: boolean;
  notifications: StaffNotification[];
  loading?: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onMarkAllRead: () => void;
  onArchiveAll: () => void;
  onDeleteOne: (id: string) => void;
  onMarkOneRead: (id: string) => void;
};

const NotificationModal = ({
  visible,
  isDarkMode,
  notifications,
  loading,
  onClose,
  onRefresh,
  onMarkAllRead,
  onArchiveAll,
  onDeleteOne,
  onMarkOneRead,
}: NotificationModalProps) => {
  const staffTheme = getStaffThemeColors(isDarkMode);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: staffTheme.surface }]}>
          <View style={[styles.header, { borderBottomColor: staffTheme.border }]}>
            <View>
              <Text style={[styles.title, { color: staffTheme.textStrong }]}>Thong bao</Text>
              <Text style={[styles.subtitle, { color: staffTheme.textMuted }]}>
                {notifications.length} muc hien co
              </Text>
            </View>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: staffTheme.iconSurface }]} onPress={onClose}>
              <X size={18} color={staffTheme.textMuted} />
            </TouchableOpacity>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: staffTheme.iconSurface }]} onPress={onRefresh}>
              <Bell size={16} color={staffTheme.textMuted} />
              <Text style={[styles.actionText, { color: staffTheme.textMuted }]}>Tai lai</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: staffTheme.iconSurface }]} onPress={onMarkAllRead}>
              <CheckCheck size={16} color={staffTheme.textMuted} />
              <Text style={[styles.actionText, { color: staffTheme.textMuted }]}>Doc het</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: staffTheme.iconSurface }]} onPress={onArchiveAll}>
              <Archive size={16} color={staffTheme.textMuted} />
              <Text style={[styles.actionText, { color: staffTheme.textMuted }]}>Luu tru</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerWrap}>
              <ActivityIndicator />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.centerWrap}>
              <Text style={[styles.emptyText, { color: staffTheme.textSoft }]}>Khong co thong bao</Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
              {notifications.map((item) => {
                const unread = item.status === 'unread';
                const title = item.title || item.type || 'Thong bao he thong';
                const message = item.message || item.content || 'Khong co noi dung';

                return (
                  <View
                    key={item._id}
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: unread ? (isDarkMode ? '#212B36' : '#FFF4F4') : staffTheme.iconSurface,
                        borderColor: staffTheme.border,
                      },
                    ]}
                  >
                    <View style={styles.itemMain}>
                      <Text style={[styles.itemTitle, { color: staffTheme.textStrong }]}>{title}</Text>
                      <Text style={[styles.itemMessage, { color: staffTheme.textMuted }]}>{message}</Text>
                      <Text style={[styles.itemMeta, { color: staffTheme.textSoft }]}>
                        {item.senderId?.fullName || 'He thong'} • {item.createdAt ? dayjs(item.createdAt).format('DD/MM/YYYY HH:mm') : 'Moi'}
                      </Text>
                    </View>
                    <View style={styles.itemActions}>
                      {unread && (
                        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#E7F5EF' }]} onPress={() => onMarkOneRead(item._id)}>
                          <CheckCheck size={14} color="#007B55" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#FFE7E6' }]} onPress={() => onDeleteOne(item._id)}>
                        <Trash2 size={14} color="#FF4842" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '900' },
  subtitle: { marginTop: 4, fontSize: 12, fontWeight: '600' },
  closeBtn: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 12,
  },
  actionText: { fontSize: 12, fontWeight: '800' },
  centerWrap: { paddingVertical: 48, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, fontWeight: '700' },
  list: { paddingTop: 10, gap: 10 },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  itemMain: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '800' },
  itemMessage: { marginTop: 4, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  itemMeta: { marginTop: 8, fontSize: 11, fontWeight: '700' },
  itemActions: { gap: 8 },
  iconBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

export default NotificationModal;
