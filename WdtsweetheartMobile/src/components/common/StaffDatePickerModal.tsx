import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';

type StaffDatePickerModalProps = {
  visible: boolean;
  date: dayjs.Dayjs;
  onClose: () => void;
  onSelect: (date: dayjs.Dayjs) => void;
};

const StaffDatePickerModal = ({ visible, date, onClose, onSelect }: StaffDatePickerModalProps) => {
  const [currentMonth, setCurrentMonth] = useState(date.startOf('month'));

  useEffect(() => {
    if (visible) {
      setCurrentMonth(date.startOf('month'));
    }
  }, [visible, date]);

  const daysInMonth = currentMonth.daysInMonth();
  const firstDayOfMonth = currentMonth.day(); // 0 is Sunday

  const daysArray = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const handlePrevMonth = () => setCurrentMonth((prev) => prev.subtract(1, 'month'));
  const handleNextMonth = () => setCurrentMonth((prev) => prev.add(1, 'month'));

  const selectDate = (day: number) => {
    const newDate = currentMonth.date(day);
    onSelect(newDate);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.container} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>Chọn ngày làm việc</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#637381" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowBtn}>
              <ChevronLeft size={24} color="#637381" />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>Tháng {currentMonth.format('M/YYYY')}</Text>
            <TouchableOpacity onPress={handleNextMonth} style={styles.arrowBtn}>
              <ChevronRight size={24} color="#637381" />
            </TouchableOpacity>
          </View>

          <View style={styles.weekDays}>
            {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d, i) => (
              <Text key={i} style={styles.weekDayText}>{d}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} style={styles.dayCell} />;
              }
              const isSelected = date.isSame(currentMonth.date(day), 'day');
              const isToday = dayjs().isSame(currentMonth.date(day), 'day');
              
              return (
                <TouchableOpacity 
                  key={`day-${day}`} 
                  style={[
                    styles.dayCell, 
                    isSelected && styles.selectedCell,
                    !isSelected && isToday && styles.todayCell
                  ]}
                  onPress={() => selectDate(day)}
                >
                  <Text style={[
                    styles.dayNum, 
                    isSelected && styles.selectedNum,
                    !isSelected && isToday && styles.todayNum
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity 
            style={styles.todayBtn} 
            onPress={() => { onSelect(dayjs()); onClose(); }}
          >
            <Text style={styles.todayBtnText}>Trở về hôm nay</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  container: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8'
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827'
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  arrowBtn: {
    padding: 8
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#212B36'
  },
  weekDays: {
    flexDirection: 'row',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F4F6F8'
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#637381'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8
  },
  selectedCell: {
    backgroundColor: colors.primary
  },
  todayCell: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)'
  },
  dayNum: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212B36'
  },
  selectedNum: {
    color: '#fff',
    fontWeight: '800'
  },
  todayNum: {
    color: colors.primary,
    fontWeight: '800'
  },
  todayBtn: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F4F6F8',
    alignItems: 'center'
  },
  todayBtnText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15
  }
});

export default StaffDatePickerModal;
