import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';

const subtitleIconXml = `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31.1 24">
<style type="text/css">.st0{fill:#F8721F;}</style>
<path class="st0" d="M8,11.1c0.7,0.5,1.6,1,2.4,1.4c0.5,0.3,1.1,0.6,1.7,0.9c-1.3,1.3-2.5,2.7-3.5,4.3
	c-0.4,0.6-0.8,1.3-1.2,2.1c-0.2,0.4,0.1,1.1,0.5,1.2c0.5,0.1,0.9-0.1,1.2-0.5c0.6-0.9,1.3-1.8,1.9-2.7
	c1.1-1.4,2.4-2.7,3.7-3.9c0.2,0.1,0.3,0.2,0.5,0.4c1.1,0.7,2.2,1.3,3.3,1.8c0.8,0.4,1.7,0.8,2.6,1.1c0.4,0.1,0.9,0.3,1.3,0.4
	c0.5,0.1,1-0.1,1.2-0.5c0.2-0.4,0.1-1.1-0.5-1.2c-0.8-0.2-1.6-0.5-2.4-0.8c-1.5-0.6-2.9-1.3-4.3-2.2
	c-0.3-0.2-0.5-0.4-0.8-0.6c0.8-0.8,1.6-1.6,2.5-2.3c1-0.8,2-1.6,3.1-2.3c0.4-0.3,0.6-0.9,0.3-1.3c-0.3-0.4-0.9-0.6-1.3-0.3
	c-0.5,0.3-1,0.7-1.5,1.1c-0.7,0.5-1.3,1.1-2,1.6c-0.9,0.8-1.7,1.6-2.5,2.4c-0.3,0.3-0.7,0.7-1,1
	c-0.3-0.2-0.7-0.4-1-0.6c-1.1-0.6-2.3-1.2-3.3-1.9c-0.8-0.5-1.6-1.1-2.4-1.7C8.5,8.7,8.3,8.4,8.2,8.2
	C7.8,7.7,7.1,7.6,6.8,8c-0.3,0.3-0.3,0.9,0,1.2C7.2,9.9,7.6,10.5,8,11.1z"/>
</svg>`;

import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { StatusMessage, Toast } from '../../components/common';
import {
  createBooking,
  createPet,
  getMyBookings,
  getMyPets,
  getServices,
  getTimeSlots,
} from '../../services/api/booking';
import { getProfile, type ProfileUser } from '../../services/api/dashboard';
import { getServiceDetail } from '../../services/api/service';
import type { Pet, ServiceItem, TimeSlot, ShiftSlotGroup, Service } from '../../types';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Booking'>;
type RouteProps = RouteProp<RootStackParamList, 'Booking'>;

const formatDateInput = (date: Date) => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const parseDateInput = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatDateLabel = (value: string) => {
  const date = parseDateInput(value);
  return date.toLocaleDateString('vi-VN');
};

const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const phoneRegex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

const serviceVisuals = {
  hero: require('../../../assets/service-hero.jpg'),
  shapeTop: require('../../../assets/service-shape-top.png'),
  shapeBottom: require('../../../assets/service-shape-bottom.png'),
};

const BookingScreen = () => {
  const navigation = useNavigation<Navigation>();
  const route = useRoute<RouteProps>();
  const isFromServiceDetail = !!route.params?.serviceId;
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [availableShifts, setAvailableShifts] = useState<ShiftSlotGroup[]>([]);
  const [activeShiftKey, setActiveShiftKey] = useState<string | null>(null);
  const [activeHour, setActiveHour] = useState<string | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petTypeFilter, setPetTypeFilter] = useState<'ALL' | 'DOG' | 'CAT'>('ALL');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [serviceDetail, setServiceDetail] = useState<Service | null>(null);
  const [loadingServiceDetail, setLoadingServiceDetail] = useState(false);

  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingPets, setLoadingPets] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [serviceId, setServiceId] = useState(route.params?.serviceId ?? '');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [selectedPetIds, setSelectedPetIds] = useState<string[]>([]);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [profile, setProfile] = useState<ProfileUser | null>(null);

  const [showPetModal, setShowPetModal] = useState(false);
  const [showCreatePetModal, setShowCreatePetModal] = useState(false);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [previousTimeOnOpen, setPreviousTimeOnOpen] = useState<string | null>(null);
  const [showRevertModal, setShowRevertModal] = useState(false);
  const [pendingRevertSlot, setPendingRevertSlot] = useState<TimeSlot | null>(null);
  const [currentMonth, setCurrentMonth] = useState(parseDateInput(date));
  const [bookingPreview, setBookingPreview] = useState<{
    totalDuration: number;
    endTime: string;
    timeline: Array<{ startTime: string; endTime: string; pets: string[] }>;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());

  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [petWeight, setPetWeight] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petColor, setPetColor] = useState('');
  const [petNotes, setPetNotes] = useState('');
  const [petGender, setPetGender] = useState<'male' | 'female' | 'unknown'>('unknown');

  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [showFullForm, setShowFullForm] = useState(!isFromServiceDetail);
  const scrollRef = React.useRef<ScrollView | null>(null);
  const petSectionY = React.useRef(0);
  const dateSectionY = React.useRef(0);

  const preselectedService = route.params?.service;
  const selectedService = useMemo(() => {
    return serviceDetail || services.find((item) => item._id === serviceId) || preselectedService;
  }, [serviceDetail, services, serviceId, preselectedService]);

  const serviceImages = useMemo(() => {
    if (!selectedService) return [];
    const images: string[] = [];
    const mainImage = (selectedService as any).image;
    if (mainImage) images.push(mainImage);
    const extraImages = (selectedService as any).images || [];
    if (Array.isArray(extraImages)) {
      extraImages.forEach((img: string) => {
        if (img && !images.includes(img)) images.push(img);
      });
    }
    return images;
  }, [selectedService]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [serviceId, serviceImages.length]);

  const selectedPetsLabel = useMemo(() => {
    if (selectedPetIds.length === 0) return 'Chưa chọn thú cưng';
    return pets
      .filter((pet) => selectedPetIds.includes(pet._id))
      .map((pet) => pet.name)
      .join(', ');
  }, [pets, selectedPetIds]);

  const monthMeta = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<number | null> = [];

    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

    return {
      label: currentMonth.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' }),
      year,
      month,
      cells,
    };
  }, [currentMonth]);

  const getShiftKey = (shift: ShiftSlotGroup, index: number, usedIds: Set<string>) => {
    if (shift._id && !usedIds.has(shift._id)) return shift._id;
    return `${shift.name || 'shift'}-${index}`;
  };

  const shiftKeyMap = useMemo(() => {
    const usedIds = new Set<string>();
    const entries = availableShifts.map((shift, index) => {
      const key = getShiftKey(shift, index, usedIds);
      if (shift._id) usedIds.add(shift._id);
      return { key, shift };
    });
    return entries;
  }, [availableShifts]);

  const activeShift = useMemo(() => {
    if (!shiftKeyMap.length) return null;
    if (activeShiftKey) {
      return shiftKeyMap.find((item) => item.key === activeShiftKey)?.shift || shiftKeyMap[0].shift;
    }
    return shiftKeyMap[0].shift;
  }, [shiftKeyMap, activeShiftKey]);

  const PAST_TIME_BUFFER_MINUTES = 10;

  const getMinutesFromTime = (time: string) => {
    const match = time.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
    const lower = time.toLowerCase();
    if (lower.includes('pm') && hours < 12) hours += 12;
    if (lower.includes('am') && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const isPastTimeSlot = (time: string) => {
    const today = formatDateInput(new Date());
    if (date !== today) return false;
    const minutes = getMinutesFromTime(time);
    if (minutes === null) return false;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    return minutes < nowMinutes - PAST_TIME_BUFFER_MINUTES;
  };

  const isSlotSelectable = (slot: TimeSlot) =>
    slot.status === 'available' && !isPastTimeSlot(slot.time) && !bookedTimes.has(slot.time);

  const hasAnyAvailableSlot = useMemo(() => {
    return availableShifts.some((shift) => shift.slots.some((slot) => isSlotSelectable(slot)));
  }, [availableShifts, date]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, TimeSlot[]> = {};
    if (!activeShift) return groups;
    activeShift.slots.forEach((slot) => {
      const hour = slot.time.split(':')[0];
      if (!groups[hour]) groups[hour] = [];
      groups[hour].push(slot);
    });
    return groups;
  }, [activeShift]);

  useEffect(() => {
    if (!shiftKeyMap.length) {
      setActiveShiftKey(null);
      setActiveHour(null);
      setSelectedTimeSlot(null);
      return;
    }
    if (!activeShiftKey || !shiftKeyMap.find((item) => item.key === activeShiftKey)) {
      setActiveShiftKey(shiftKeyMap[0].key);
    }
  }, [activeShiftKey, shiftKeyMap]);

  useEffect(() => {
    if (!activeShiftKey) return;
    setActiveHour(null);
    setSelectedTimeSlot(null);
    setBookingPreview(null);
  }, [activeShiftKey]);

  useEffect(() => {
    const hours = Object.keys(groupedSlots).sort((a, b) => Number(a) - Number(b));
    if (!hours.length) {
      setActiveHour(null);
      return;
    }
    const availableHours = hours.filter((hour) =>
      (groupedSlots[hour] || []).some((slot) => isSlotSelectable(slot))
    );
    if (!activeHour || !groupedSlots[activeHour] || !availableHours.includes(activeHour)) {
      setActiveHour((availableHours[0] || hours[0]) ?? null);
    }
  }, [groupedSlots, activeHour, date]);

  const pricingBreakdown = useMemo(() => {
    if (!selectedService || selectedPetIds.length === 0) return { total: 0, items: [] as any[] };
    const selectedPetList = pets.filter((pet) => selectedPetIds.includes(pet._id));
    if ((selectedService as any).pricingType === 'by-weight') {
      const list = ((selectedService as any).priceList || []).slice();
      const items = selectedPetList.map((pet) => {
        const weight = pet.weight || 0;
        let matched = list.find((item: any) => {
          const label = item.label || '';
          if (label.includes('<')) return weight < parseFloat(label.replace(/[^\d.]/g, ''));
          if (label.includes('>')) return weight > parseFloat(label.replace(/[^\d.]/g, ''));
          if (label.includes('-')) {
            const nums = label.match(/\d+\.?\d*/g);
            return nums && weight >= parseFloat(nums[0]) && weight <= parseFloat(nums[1]);
          }
          return weight <= parseFloat(label.replace(/[^\d.]/g, ''));
        });
        const price = matched ? matched.value : (selectedService as any).basePrice || 0;
        return {
          name: pet.name,
          weight,
          label: matched?.label || 'Mặc định',
          price,
        };
      });
      const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
      return { total, items };
    }
    const basePrice = (selectedService as any).basePrice || 0;
    const items = selectedPetList.map((pet) => ({
      name: pet.name,
      weight: pet.weight,
      label: 'Giá cố định',
      price: basePrice,
    }));
    return { total: basePrice * items.length, items };
  }, [selectedService, selectedPetIds, pets]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 1600);
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    setError(null);
    try {
      const res = await getServices({ petType: petTypeFilter });
      setServices(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dịch vụ');
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchPets = async () => {
    setLoadingPets(true);
    try {
      const res = await getMyPets();
      setPets(res.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thú cưng');
    } finally {
      setLoadingPets(false);
    }
  };

  const fetchSlots = async (nextServiceId: string, nextDate: string, petIds: string[]) => {
    if (!nextServiceId || !nextDate) return;
    setLoadingSlots(true);
    setError(null);
    try {
      const res = await getTimeSlots({
        serviceId: nextServiceId,
        date: nextDate,
        count: petIds.length > 0 ? petIds.length : 1,
        petIds,
      });
      const shifts = res.data?.shifts || [];
      if (__DEV__) {
        const sampleSlots = shifts.slice(0, 2).map((shift) => ({
          shiftId: shift._id,
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          sampleTimes: (shift.slots || []).slice(0, 5).map((slot) => slot.time),
        }));
        console.log('[Booking][getTimeSlots]', {
          date: nextDate,
          serviceId: nextServiceId,
          petCount: petIds.length > 0 ? petIds.length : 1,
          shiftCount: shifts.length,
          sampleSlots,
        });
      }
      setAvailableShifts(shifts);
      setSelectedTimeSlot((prev) => {
        if (!prev) return null;
        const exists = shifts.some((shift) =>
          shift.slots.some((slot) => slot.time === prev.time && isSlotSelectable(slot))
        );
        if (!exists) {
          setBookingPreview(null);
          return null;
        }
        return prev;
      });
    } catch (err) {
      setAvailableShifts([]);
      setError(err instanceof Error ? err.message : 'Không thể tải khung giờ');
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchPets();
  }, [petTypeFilter]);

  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      try {
        const data = await getProfile();
        if (!isMounted) return;
        setProfile(data);
        setCustomerName((prev) => prev.trim() ? prev : data.fullName || '');
        setCustomerPhone((prev) => prev.trim() ? prev : data.phone || '');
        setCustomerEmail((prev) => prev.trim() ? prev : data.email || '');
      } catch {
        // ignore when not logged in
      }
    };
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (route.params?.serviceId) {
      setServiceId(route.params.serviceId);
    }
  }, [route.params?.serviceId]);

  useEffect(() => {
    let isMounted = true;
    const fetchServiceDetail = async () => {
      if (!serviceId) {
        setServiceDetail(null);
        return;
      }
      setLoadingServiceDetail(true);
      try {
        const detail = await getServiceDetail(serviceId);
        if (isMounted) setServiceDetail(detail);
      } catch (err) {
        if (isMounted) setServiceDetail(null);
      } finally {
        if (isMounted) setLoadingServiceDetail(false);
      }
    };
    fetchServiceDetail();
    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  useEffect(() => {
    if (serviceId && date) {
      fetchSlots(serviceId, date, selectedPetIds);
    }
  }, [serviceId, date, selectedPetIds]);

  useEffect(() => {
    const today = formatDateInput(new Date());
    if (date < today) {
      setDate(today);
    }
  }, [date]);

  useEffect(() => {
    if (showTimeModal && serviceId && date) {
      fetchSlots(serviceId, date, selectedPetIds);
    }
  }, [showTimeModal, serviceId, date, selectedPetIds]);

  useEffect(() => {
    if (showTimeModal) {
      setPreviousTimeOnOpen(selectedTimeSlot?.time ?? null);
    } else {
      setPreviousTimeOnOpen(null);
      setShowRevertModal(false);
      setPendingRevertSlot(null);
    }
  }, [showTimeModal]);

  useEffect(() => {
    const fetchBookedTimes = async () => {
      try {
        const res = await getMyBookings({ page: 1, limit: 200 });
        const data = res.data || [];
        const targetDate = date;
        const times = data
          .filter((item: any) => item.start && formatDateInput(new Date(item.start)) === targetDate)
          .map((item: any) =>
            new Date(item.start).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
          );
        setBookedTimes(new Set(times));
      } catch {
        setBookedTimes(new Set());
      }
    };
    if (showTimeModal && date) fetchBookedTimes();
  }, [showTimeModal, date]);

  useEffect(() => {
    if (showTimeModal && selectedTimeSlot && selectedPetIds.length > 0 && !bookingPreview) {
      handleVerifySchedule();
    }
  }, [showTimeModal, selectedTimeSlot, selectedPetIds.length]);

  const togglePet = (id: string) => {
    setSelectedPetIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
    setBookingPreview(null);
  };

  const validate = () => {
    if (!serviceId) return 'Vui lòng chọn dịch vụ';
    if (!date) return 'Vui lòng chọn ngày';
    if (!selectedTimeSlot?.time) return 'Vui lòng chọn khung giờ';
    if (selectedPetIds.length === 0) return 'Vui lòng chọn ít nhất một thú cưng';
    if (!customerName.trim()) return 'Vui lòng nhập tên khách hàng';
    if (!customerPhone.trim()) return 'Vui lòng nhập số điện thoại';
    if (!phoneRegex.test(customerPhone.trim())) return 'Số điện thoại không đúng định dạng';
    if (customerEmail.trim() && !customerEmail.includes('@')) return 'Email không đúng định dạng';
    return null;
  };

  const handleCreatePet = async () => {
    if (!petName.trim()) {
      showToast('Vui lòng nhập tên thú cưng');
      return;
    }

    if (!petWeight.trim() || Number(petWeight) <= 0) {
      showToast('Vui lòng nhập cân nặng hợp lệ');
      return;
    }

    try {
      const res = await createPet({
        name: petName.trim(),
        type: petType,
        breed: petBreed.trim() || undefined,
        weight: Number(petWeight),
        color: petColor.trim() || undefined,
        gender: petGender,
        notes: petNotes.trim() || undefined,
      });
      setPets((prev) => [res.data, ...prev]);
      setSelectedPetIds((prev) => [...prev, res.data._id]);
      setPetName('');
      setPetWeight('');
      setPetBreed('');
      setPetColor('');
      setPetNotes('');
      setPetType('dog');
      setPetGender('unknown');
      setShowCreatePetModal(false);
      showToast('Tạo thú cưng thành công');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tạo thú cưng');
    }
  };

  const handleSelectDate = (day: number) => {
    const nextDate = formatDateInput(new Date(monthMeta.year, monthMeta.month, day));
    const today = formatDateInput(new Date());
    if (nextDate < today) {
      showToast('Không thể chọn ngày trong quá khứ');
      return;
    }
    setDate(nextDate);
    setShowDatePickerModal(false);
  };

  const handleVerifySchedule = () => {
    if (!selectedTimeSlot || selectedPetIds.length === 0 || !selectedService) return;
    setIsVerifying(true);
    setTimeout(() => {
      const duration = (selectedService as any).duration || 30;
      const freeStaff = selectedTimeSlot.freeStaff || 1;
      const petCount = selectedPetIds.length;
      const petNames = selectedPetIds.map((id) => pets.find((p) => p._id === id)?.name || 'Thú cưng');

      const timeline: Array<{ startTime: string; endTime: string; pets: string[] }> = [];
      const [h, m] = selectedTimeSlot.time.split(':').map((v) => Number(v));
      let current = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
      let idx = 0;
      while (idx < petCount) {
        const batchSize = Math.min(freeStaff, petCount - idx);
        const batchEnd = new Date(current.getTime() + duration * 60000);
        timeline.push({
          startTime: current.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          endTime: batchEnd.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          pets: petNames.slice(idx, idx + batchSize),
        });
        idx += batchSize;
        current = batchEnd;
      }

      setBookingPreview({
        totalDuration: duration * Math.ceil(petCount / freeStaff),
        endTime: current.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        timeline,
      });
      setIsVerifying(false);
    }, 400);
  };

  const handleCreateBooking = async () => {
    const message = validate();
    if (message) {
      setError(message);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createBooking({
        serviceId,
        petIds: selectedPetIds,
        startTime: `${date}T${selectedTimeSlot?.time || '00:00'}:00`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      showToast('Đặt lịch thành công');
      if (serviceId && date) {
        fetchSlots(serviceId, date, selectedPetIds);
      }
      setSelectedTimeSlot(null);
      setSelectedPetIds([]);
      setNotes('');
      navigation.navigate('MyBookings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo lịch đặt');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinueFromDate = () => {
    if (selectedPetIds.length === 0) {
      showToast('Vui lòng chọn thú cưng');
      return;
    }
    setShowFullForm(true);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: dateSectionY.current, animated: true });
    }, 120);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt lịch dịch vụ</Text>
        <TouchableOpacity style={styles.rightButton} onPress={() => navigation.navigate('MyBookings')}>
          <Text style={styles.rightButtonText}>Lịch của tôi</Text>
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        {error ? <StatusMessage message={error} /> : null}

        <ImageBackground
          source={serviceVisuals.hero}
          style={styles.heroBanner}
          imageStyle={styles.heroBannerImage}
        >
          <Image source={serviceVisuals.shapeTop} style={styles.heroShapeTop} />
          <View style={styles.heroOverlay}>
            <View style={styles.heroSubtitleRow}>
              <SvgXml xml={subtitleIconXml} width={18} height={18} />
              <Text style={styles.heroSubtitleTag}>Trải nghiệm tốt nhất</Text>
            </View>
            <Text style={styles.heroTitle}>Đặt lịch dịch vụ</Text>
            <Text style={styles.heroSubtitle}>
              Chọn loại dịch vụ phù hợp cho Cún hoặc Mèo, đặt lịch nhanh chỉ vài bước.
            </Text>
          </View>
          <Image source={serviceVisuals.shapeBottom} style={styles.heroShapeBottom} />
        </ImageBackground>

        <View style={styles.typeTabs}>
          {[
            { key: 'ALL', label: 'Tất cả' },
            { key: 'DOG', label: 'Chăm sóc chó' },
            { key: 'CAT', label: 'Chăm sóc mèo' },
          ].map((tab) => {
            const active = petTypeFilter === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.typeTab, active && styles.typeTabActive]}
                onPress={() => setPetTypeFilter(tab.key as 'ALL' | 'DOG' | 'CAT')}
              >
                <Text style={[styles.typeTabText, active && styles.typeTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.stepRow}>
          {[
            { key: 'service', label: '1 Dịch vụ', active: !!serviceId },
            { key: 'pet', label: '2 Thú cưng', active: selectedPetIds.length > 0 },
            { key: 'time', label: '3 Ngày & giờ', active: !!selectedTimeSlot?.time },
            { key: 'info', label: '4 Thông tin', active: !!customerName.trim() && !!customerPhone.trim() },
          ].map((step) => (
            <View key={step.key} style={[styles.stepPill, step.active && styles.stepPillActive]}>
              <Text style={[styles.stepText, step.active && styles.stepTextActive]}>{step.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Chọn dịch vụ</Text>
          {!isFromServiceDetail && (
            <>
              {loadingServices ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                services.map((item) => {
                  const active = serviceId === item._id;
                  return (
                    <TouchableOpacity
                      key={item._id}
                      style={[styles.selectItem, active && styles.selectItemActive]}
                      onPress={() => setServiceId(item._id)}
                    >
                      <View style={styles.selectMain}>
                        <Text style={[styles.selectTitle, active && styles.selectTitleActive]}>{item.name}</Text>
                        <Text style={styles.selectDesc}>
                          {item.duration ? `${item.duration} phút` : 'Không rõ thời lượng'}
                        </Text>
                      </View>
                      <Text style={styles.selectPrice}>
                        {item.basePrice ? `${item.basePrice.toLocaleString()}đ` : 'Liên hệ'}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          )}

          {selectedService ? (
            <View style={styles.serviceDetailWrap}>
              {loadingServiceDetail ? (
                <ActivityIndicator color={colors.primary} />
              ) : serviceImages.length > 0 ? (
                <ImageBackground
                  source={{ uri: serviceImages[currentImageIndex] }}
                  style={styles.serviceHero}
                  imageStyle={styles.serviceHeroImage}
                >
                  <View style={styles.serviceHeroOverlay}>
                    <Text style={styles.serviceHeroTag}>Dịch vụ đã chọn</Text>
                    <Text style={styles.serviceHeroTitle}>{selectedService.name}</Text>
                    <Text style={styles.serviceHeroSub}>
                      {selectedService.duration ? `${selectedService.duration} phút` : 'Thời lượng linh hoạt'}
                    </Text>
                  </View>
                </ImageBackground>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>Chưa có hình ảnh</Text>
                </View>
              )}

              {serviceImages.length > 1 ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailRow}
                  style={styles.thumbnailScroll}
                >
                  {serviceImages.map((img, index) => {
                    const active = index === currentImageIndex;
                    return (
                      <TouchableOpacity
                        key={`thumb-${img}-${index}`}
                        style={[styles.thumbnailItem, active && styles.thumbnailItemActive]}
                        onPress={() => setCurrentImageIndex(index)}
                      >
                        <Image source={{ uri: img }} style={styles.thumbnailImage} />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              ) : null}

              <View style={styles.serviceSummaryRow}>
                <View style={styles.serviceSummaryMain}>
                  <Text style={styles.serviceSummaryTitle}>{selectedService.name}</Text>
                  <Text style={styles.serviceSummaryDesc}>
                    {selectedService.duration ? `${selectedService.duration} phút` : 'Thời lượng linh hoạt'}
                  </Text>
                </View>
                <Text style={styles.serviceSummaryPrice}>
                  {selectedService.basePrice
                    ? `${selectedService.basePrice.toLocaleString()}đ`
                    : selectedService.price
                      ? `${Number(selectedService.price).toLocaleString()}đ`
                      : 'Liên hệ'}
                </Text>
              </View>

              {(selectedService as any).description ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Mô tả dịch vụ</Text>
                  <Text style={styles.detailText}>
                    {(selectedService as any).description.replace(/<[^>]*>/g, '').trim()}
                  </Text>
                </View>
              ) : null}

              {(selectedService as any).procedure ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Quy trình thực hiện</Text>
                  <Text style={styles.detailText}>
                    {(selectedService as any).procedure.replace(/<[^>]*>/g, '').trim()}
                  </Text>
                </View>
              ) : null}

              {Array.isArray((selectedService as any).priceList) &&
              (selectedService as any).priceList.length > 0 ? (
                <View style={styles.detailSection}>
                  <Text style={styles.detailTitle}>Bảng giá tham khảo</Text>
                  {((selectedService as any).priceList || []).map((item: any, idx: number) => (
                    <View key={`${item.label}-${idx}`} style={styles.priceRow}>
                      <Text style={styles.priceLabel}>{item.label}</Text>
                      <Text style={styles.priceValue}>{Number(item.value).toLocaleString()}đ</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>

        {(!isFromServiceDetail || showFullForm) && (
          <>
            <View
              style={styles.card}
              onLayout={(event) => {
                petSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              <Text style={styles.sectionTitle}>
                {isFromServiceDetail ? '2. Chọn thú cưng' : '2. Chọn thú cưng'}
              </Text>
              <Text style={styles.selectedPets}>{selectedPetsLabel}</Text>
              <View style={styles.row}>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowPetModal(true)}>
                  <Text style={styles.secondaryBtnText}>Chọn thú cưng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowCreatePetModal(true)}>
                  <Text style={styles.secondaryBtnText}>Thêm thú cưng</Text>
                </TouchableOpacity>
              </View>
            </View>

            {isFromServiceDetail && !showFullForm ? (
              <TouchableOpacity style={styles.primaryBtn} onPress={handleContinueFromDate}>
                <Text style={styles.primaryBtnText}>Tiếp tục</Text>
              </TouchableOpacity>
            ) : null}

            <View
              style={styles.card}
              onLayout={(event) => {
                dateSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              <Text style={styles.sectionTitle}>
                {isFromServiceDetail ? '3. Chọn ngày và khung giờ' : '3. Chọn ngày và khung giờ'}
              </Text>

              <View style={styles.pickerPanel}>
                <View style={styles.fieldCol}>
                  <Text style={styles.fieldLabel}>Ngày</Text>
                  <TouchableOpacity style={styles.triggerButton} onPress={() => setShowDatePickerModal(true)} activeOpacity={0.9}>
                    <Text style={styles.triggerText}>{formatDateLabel(date)}</Text>
                    <ChevronDown size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.fieldCol}>
                  <Text style={styles.fieldLabel}>Giờ hẹn</Text>
                  <TouchableOpacity
                    style={styles.triggerButton}
                    onPress={() => {
                      if (selectedPetIds.length === 0) {
                        showToast('Vui lòng chọn thú cưng trước');
                        return;
                      }
                      setShowTimeModal(true);
                    }}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.triggerText}>
                      {selectedTimeSlot?.time ? `${selectedTimeSlot.time}` : 'Chọn giờ hẹn'}
                    </Text>
                    <ChevronDown size={16} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {loadingSlots ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
                {!loadingSlots && serviceId && !hasAnyAvailableSlot ? (
                  <Text style={styles.emptyText}>Không có khung giờ khả dụng cho ngày đã chọn</Text>
                ) : null}
              </View>
            </View>

            {selectedPetIds.length > 0 && selectedService ? (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Bảng giá dự kiến</Text>
                {pricingBreakdown.items.map((item) => (
                  <View key={`${item.name}-${item.weight}`} style={styles.priceRow}>
                    <Text style={styles.priceLabel}>
                      {item.name} ({item.weight}kg) • {item.label}
                    </Text>
                    <Text style={styles.priceValue}>{Number(item.price).toLocaleString()}đ</Text>
                  </View>
                ))}
                <View style={styles.priceTotalRow}>
                  <Text style={styles.priceTotalLabel}>Tổng tạm tính</Text>
                  <Text style={styles.priceTotalValue}>{pricingBreakdown.total.toLocaleString()}đ</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                {isFromServiceDetail ? '4. Thông tin khách hàng' : '4. Thông tin khách hàng'}
              </Text>
              <TextInput
                style={styles.input}
                value={customerName}
                onChangeText={setCustomerName}
                placeholder="Họ và tên"
              />
              <TextInput
                style={styles.input}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                value={customerEmail}
                onChangeText={setCustomerEmail}
                placeholder="Email (tùy chọn)"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={[styles.input, styles.inputArea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Ghi chú"
                multiline
              />
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleCreateBooking} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Xác nhận đặt lịch</Text>}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <Modal visible={showDatePickerModal} animationType="fade" transparent>
        <View style={styles.centerModalBackdrop}>
          <View style={styles.calendarModalCard}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(monthMeta.year, monthMeta.month - 1, 1))}>
                <ChevronLeft size={18} color={colors.secondary} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>{monthMeta.label}</Text>
              <TouchableOpacity onPress={() => setCurrentMonth(new Date(monthMeta.year, monthMeta.month + 1, 1))}>
                <ChevronRight size={18} color={colors.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.weekHeaderRow}>
              {weekDays.map((label) => (
                <Text key={label} style={styles.weekHeaderText}>{label}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {monthMeta.cells.map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
                const thisDate = formatDateInput(new Date(monthMeta.year, monthMeta.month, day));
                const active = thisDate === date;
                const today = formatDateInput(new Date());
                const isPast = thisDate < today;
                return (
                  <TouchableOpacity
                    key={`${monthMeta.month}-${day}`}
                    style={[
                      styles.dayCell,
                      styles.dayButton,
                      active && styles.dayButtonActive,
                      isPast && styles.dayButtonDisabled,
                    ]}
                    onPress={() => !isPast && handleSelectDate(day)}
                    disabled={isPast}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        active && styles.dayTextActive,
                        isPast && styles.dayTextDisabled,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.secondaryCloseBtn} onPress={() => setShowDatePickerModal(false)}>
              <Text style={styles.secondaryBtnText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showTimeModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn giờ hẹn</Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Text style={styles.modalClose}>Đóng</Text>
              </TouchableOpacity>
            </View>

            {availableShifts.length === 0 ? (
              <Text style={styles.emptyText}>Chưa có ca làm việc cho ngày này.</Text>
            ) : !hasAnyAvailableSlot ? (
              <Text style={styles.emptyText}>Không có khung giờ khả dụng trong ngày này.</Text>
            ) : (
              <>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shiftTabs}>
                  {shiftKeyMap.map(({ key, shift }) => {
                    const active = activeShiftKey === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        style={[styles.shiftTab, active && styles.shiftTabActive]}
                        onPress={() => setActiveShiftKey(key)}
                      >
                        <Text style={[styles.shiftTabText, active && styles.shiftTabTextActive]}>
                          {shift.name}
                        </Text>
                        <Text style={styles.shiftTabSub}>{shift.startTime} - {shift.endTime}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourTabs}>
                  {Object.keys(groupedSlots)
                    .sort((a, b) => Number(a) - Number(b))
                    .map((hour) => {
                      const active = hour === activeHour;
                      return (
                        <TouchableOpacity
                          key={hour}
                          style={[styles.hourTab, active && styles.hourTabActive]}
                          onPress={() => setActiveHour(hour)}
                        >
                          <Text style={[styles.hourTabText, active && styles.hourTabTextActive]}>{hour}h</Text>
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>

                <View style={styles.timeGrid}>
                  {(groupedSlots[activeHour || ''] || []).map((slot) => {
                    const isAvailable = isSlotSelectable(slot);
                    const selected = selectedTimeSlot?.time === slot.time;
                    const isPreviousBlocked = !!previousTimeOnOpen &&
                      previousTimeOnOpen === slot.time &&
                      selectedTimeSlot?.time !== slot.time;
                    const isBookedByUser = bookedTimes.has(slot.time);
                    return (
                      <TouchableOpacity
                        key={slot.time}
                        disabled={!isAvailable}
                        onPress={() => {
                          if (isPreviousBlocked) {
                            setPendingRevertSlot(slot);
                            setShowRevertModal(true);
                            return;
                          }
                          setSelectedTimeSlot(slot);
                          setBookingPreview(null);
                        }}
                        style={[
                          styles.timeChip,
                          selected && styles.timeChipActive,
                          !isAvailable && styles.timeChipDisabled,
                          isPreviousBlocked && styles.timeChipPrevious,
                        ]}
                      >
                        <Text
                          style={[
                            styles.timeChipText,
                            selected && styles.timeChipTextActive,
                            !isAvailable && styles.timeChipTextDisabled,
                            isPreviousBlocked && styles.timeChipTextPrevious,
                          ]}
                        >
                          {slot.time}
                        </Text>
                        {isBookedByUser && (
                          <Text style={styles.timeChipTag}>Đã đặt</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {selectedTimeSlot ? (
                  <View style={styles.previewWrap}>
                    {!bookingPreview ? (
                      <TouchableOpacity
                        style={styles.previewButton}
                        onPress={handleVerifySchedule}
                        disabled={isVerifying}
                      >
                        {isVerifying ? (
                          <ActivityIndicator color={colors.primary} />
                        ) : (
                          <Text style={styles.previewButtonText}>Kiểm tra lộ trình</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.previewCard}>
                        <View style={styles.previewHeader}>
                          <Text style={styles.previewTitle}>Lộ trình chăm sóc</Text>
                          <TouchableOpacity
                            style={styles.previewChangeBtn}
                            onPress={() => {
                              setSelectedTimeSlot(null);
                              setBookingPreview(null);
                            }}
                          >
                            <Text style={styles.previewChangeText}>Đổi giờ khác</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.previewSub}>
                          Tổng thời gian: {bookingPreview.totalDuration} phút • Kết thúc: {bookingPreview.endTime}
                        </Text>
                        {bookingPreview.timeline.map((item, idx) => (
                          <View key={`${item.startTime}-${idx}`} style={styles.previewItem}>
                            <View style={styles.previewTime}>
                              <Text style={styles.previewTimeText}>{item.startTime} - {item.endTime}</Text>
                            </View>
                            <Text style={styles.previewPets}>{item.pets.join(', ')}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ) : null}
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, !selectedTimeSlot && styles.primaryBtnDisabled]}
              onPress={() => selectedTimeSlot && setShowTimeModal(false)}
              disabled={!selectedTimeSlot}
            >
              <Text style={styles.primaryBtnText}>Xác nhận giờ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showPetModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chọn thú cưng</Text>
            {loadingPets ? (
              <ActivityIndicator color={colors.primary} />
            ) : pets.length === 0 ? (
              <Text style={styles.emptyText}>Bạn chưa có thú cưng</Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {pets.map((pet) => {
                  const active = selectedPetIds.includes(pet._id);
                  return (
                    <TouchableOpacity
                      key={pet._id}
                      style={[styles.selectItem, active && styles.selectItemActive]}
                      onPress={() => togglePet(pet._id)}
                    >
                      <View style={styles.selectMain}>
                        <Text style={[styles.selectTitle, active && styles.selectTitleActive]}>
                          {pet.name} ({pet.type === 'dog' ? 'Chó' : 'Mèo'})
                        </Text>
                        <Text style={styles.selectDesc}>
                          {[pet.breed, pet.color].filter(Boolean).join(' | ') || 'Chưa có thêm thông tin'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowPetModal(false)}>
              <Text style={styles.primaryBtnText}>Xong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRevertModal} animationType="fade" transparent>
        <View style={styles.centerModalBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconWrap}>
              <Text style={styles.confirmIcon}>!</Text>
            </View>
            <Text style={styles.confirmTitle}>Chọn lại khung giờ cũ?</Text>
            <Text style={styles.confirmDesc}>
              Bạn đang đổi giờ. Bạn có muốn quay lại khung giờ đã chọn trước đó không?
            </Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                style={styles.confirmGhostBtn}
                onPress={() => {
                  setShowRevertModal(false);
                  setPendingRevertSlot(null);
                }}
              >
                <Text style={styles.confirmGhostText}>Giữ giờ mới</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmPrimaryBtn}
                onPress={() => {
                  if (pendingRevertSlot) {
                    setSelectedTimeSlot(pendingRevertSlot);
                    setBookingPreview(null);
                  }
                  setShowRevertModal(false);
                  setPendingRevertSlot(null);
                }}
              >
                <Text style={styles.confirmPrimaryText}>Chọn lại</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCreatePetModal} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Thêm thú cưng</Text>
            <TextInput style={styles.input} placeholder="Tên thú cưng" value={petName} onChangeText={setPetName} />
            <TextInput style={styles.input} placeholder="Giống thú cưng" value={petBreed} onChangeText={setPetBreed} />
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.chip, petType === 'dog' && styles.chipActive]}
                onPress={() => setPetType('dog')}
              >
                <Text style={[styles.chipText, petType === 'dog' && styles.chipTextActive]}>Chó</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, petType === 'cat' && styles.chipActive]}
                onPress={() => setPetType('cat')}
              >
                <Text style={[styles.chipText, petType === 'cat' && styles.chipTextActive]}>Mèo</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Cân nặng (kg)"
              keyboardType="numeric"
              value={petWeight}
              onChangeText={setPetWeight}
            />
            <TextInput style={styles.input} placeholder="Màu lông" value={petColor} onChangeText={setPetColor} />
            <TextInput
              style={[styles.input, styles.inputArea]}
              placeholder="Ghi chú thú cưng"
              value={petNotes}
              onChangeText={setPetNotes}
              multiline
            />
            <View style={styles.row}>
              {(['unknown', 'male', 'female'] as const).map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[styles.chip, petGender === gender && styles.chipActive]}
                  onPress={() => setPetGender(gender)}
                >
                  <Text style={[styles.chipText, petGender === gender && styles.chipTextActive]}>
                    {gender === 'unknown' ? 'Không rõ' : gender === 'male' ? 'Đực' : 'Cái'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowCreatePetModal(false)}>
                <Text style={styles.secondaryBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primarySmallBtn} onPress={handleCreatePet}>
                <Text style={styles.primaryBtnText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  rightButton: { minWidth: 68, alignItems: 'flex-end' },
  rightButtonText: { color: colors.primary, fontWeight: '600', fontSize: 12 },
  headerTitle: { color: colors.secondary, fontSize: 18, fontWeight: '700' },
  content: { padding: 16, paddingBottom: 30, gap: 12 },
  heroBanner: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 140,
    justifyContent: 'flex-end',
    width: '100%',
    alignSelf: 'center',
  },
  heroBannerImage: {
    borderRadius: 18,
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  heroShapeTop: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 38,
    height: 38,
    opacity: 0.75,
  },
  heroShapeBottom: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 42,
    height: 42,
    opacity: 0.8,
  },
  heroOverlay: {
    backgroundColor: 'rgba(16, 41, 55, 0.6)',
    padding: 14,
    gap: 6,
  },
  heroSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroSubtitleTag: {
    color: '#FFE8D5',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  heroSubtitle: { color: '#f6f6f6', fontSize: 12, lineHeight: 18 },
  typeTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  stepPillActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  stepText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  stepTextActive: {
    color: '#fff',
  },
  typeTab: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeTabText: { color: colors.secondary, fontSize: 12, fontWeight: '700' },
  typeTabTextActive: { color: '#fff' },
  card: {
    backgroundColor: colors.softPink,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryMain: { flex: 1 },
  summaryTitle: { color: colors.secondary, fontWeight: '700', fontSize: 14 },
  summaryDesc: { color: colors.text, fontSize: 12, marginTop: 4 },
  summaryPrice: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceDetailWrap: {
    marginTop: 8,
    gap: 10,
  },
  serviceHero: {
    width: '100%',
    height: 170,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  serviceHeroImage: {
    borderRadius: 14,
    resizeMode: 'cover',
  },
  serviceHeroOverlay: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  serviceHeroTag: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  serviceHeroTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  serviceHeroSub: {
    color: '#f3f3f3',
    fontSize: 12,
    marginTop: 2,
  },
  serviceSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  serviceSummaryMain: { flex: 1 },
  serviceSummaryTitle: { color: colors.secondary, fontWeight: '700', fontSize: 14 },
  serviceSummaryDesc: { color: colors.text, fontSize: 12, marginTop: 4 },
  serviceSummaryPrice: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  imageCarousel: {
    marginTop: 6,
    width: '100%',
  },
  carouselWrap: {
    width: '100%',
    alignItems: 'center',
  },
  carouselContent: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  carouselImage: {
    height: 180,
  },
  carouselImageInner: {
    borderRadius: 14,
    resizeMode: 'cover',
  },
  thumbnailRow: {
    paddingTop: 8,
    paddingBottom: 2,
    gap: 8,
    justifyContent: 'center',
    flexGrow: 1,
    paddingHorizontal: 4,
  },
  thumbnailScroll: {
    alignSelf: 'center',
  },
  thumbnailItem: {
    width: 64,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumbnailItemActive: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    color: colors.textLight,
    fontSize: 12,
  },
  detailSection: {
    gap: 6,
  },
  detailTitle: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
  detailText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  priceLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  priceValue: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  priceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  priceTotalLabel: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  priceTotalValue: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: { fontWeight: '700', color: colors.secondary, fontSize: 14 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.secondary,
  },
  inputArea: { minHeight: 74, textAlignVertical: 'top' },
  selectItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  selectItemActive: {
    borderColor: colors.primary,
    backgroundColor: '#fff9f9',
  },
  selectMain: { flex: 1 },
  selectTitle: { color: colors.secondary, fontWeight: '600', fontSize: 13 },
  selectTitleActive: { color: colors.primary },
  selectDesc: { color: colors.text, fontSize: 12, marginTop: 4 },
  selectPrice: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  pickerPanel: {
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    gap: 8,
  },
  fieldCol: { gap: 6 },
  fieldLabel: { color: colors.secondary, fontSize: 12, fontWeight: '600' },
  triggerButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: '#fff',
    minHeight: 42,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: { color: colors.secondary, fontSize: 12, fontWeight: '500' },
  slotChipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotChip: {
    minHeight: 40,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  slotChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  slotChipTextActive: {
    color: '#fff',
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    alignItems: 'center',
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  chipText: { color: colors.text, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 8 },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    paddingVertical: 10,
  },
  secondaryBtnText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  selectedPets: { color: colors.text, fontSize: 12 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 46,
  },
  primaryBtnDisabled: {
    backgroundColor: colors.lightGray,
  },
  primarySmallBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 42,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  loader: { marginTop: 6 },
  emptyText: { color: colors.text, fontSize: 12 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  centerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 10,
    minHeight: 240,
  },
  modalCardLarge: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 12,
    maxHeight: '85%',
  },
  confirmCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 20,
    width: '88%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  confirmIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff1f1',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f0c8c8',
    marginBottom: 10,
  },
  confirmIcon: {
    color: '#d35b5b',
    fontWeight: '800',
    fontSize: 20,
  },
  confirmTitle: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  confirmDesc: {
    textAlign: 'center',
    fontSize: 13,
    color: colors.textLight,
    lineHeight: 18,
    marginBottom: 16,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 10,
  },
  confirmGhostBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0c8c8',
    backgroundColor: '#fff7f7',
    alignItems: 'center',
  },
  confirmGhostText: {
    color: '#b55c5c',
    fontWeight: '700',
    fontSize: 13,
  },
  confirmPrimaryBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  confirmPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  calendarModalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: { color: colors.secondary, fontSize: 16, fontWeight: '700' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalClose: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '700',
  },
  modalList: { maxHeight: 260 },
  shiftTabs: {
    maxHeight: 54,
  },
  shiftTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  shiftTabActive: {
    borderColor: colors.primary,
    backgroundColor: colors.softPink,
  },
  shiftTabText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 12,
  },
  shiftTabTextActive: {
    color: colors.primary,
  },
  shiftTabSub: {
    color: colors.textLight,
    fontSize: 10,
    marginTop: 2,
  },
  hourTabs: {
    maxHeight: 40,
  },
  hourTab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  hourTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hourTabText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 11,
  },
  hourTabTextActive: {
    color: '#fff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
  },
  timeChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  timeChipDisabled: {
    borderColor: 'transparent',
    backgroundColor: colors.lightGray,
  },
  timeChipPrevious: {
    opacity: 0.6,
    borderColor: '#f0c8c8',
  },
  timeChipText: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 11,
  },
  timeChipTextActive: {
    color: '#fff',
  },
  timeChipTextDisabled: {
    color: colors.textLight,
  },
  timeChipTextPrevious: {
    color: '#b78b8b',
  },
  timeChipTag: {
    marginTop: 4,
    fontSize: 9,
    color: colors.textLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  previewWrap: {
    marginTop: 8,
  },
  previewButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewButtonText: {
    color: colors.secondary,
    fontWeight: '700',
  },
  previewCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTitle: {
    color: colors.secondary,
    fontWeight: '700',
    fontSize: 13,
  },
  previewChangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  previewChangeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  previewSub: {
    color: colors.text,
    fontSize: 12,
  },
  previewItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  previewTime: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewTimeText: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '700',
  },
  previewPets: {
    color: colors.text,
    fontSize: 11,
    flex: 1,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarTitle: { color: colors.secondary, fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  weekHeaderRow: { flexDirection: 'row' },
  weekHeaderText: {
    width: '14.2857%',
    textAlign: 'center',
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
  },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButton: { borderRadius: 8 },
  dayButtonDisabled: { backgroundColor: colors.lightGray },
  dayButtonActive: { backgroundColor: colors.primary },
  dayText: { color: colors.secondary, fontWeight: '500' },
  dayTextDisabled: { color: colors.textLight },
  dayTextActive: { color: '#fff', fontWeight: '700' },
  secondaryCloseBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    paddingVertical: 10,
    marginTop: 6,
  },
});

export default BookingScreen;
