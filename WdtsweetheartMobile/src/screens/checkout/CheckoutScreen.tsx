import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Alert,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Check, LogOut, MapPin, Package, Search, TicketPercent, Truck, User, Wallet } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { colors } from '../../theme/colors';
import { formatPrice } from '../../utils';
import { useCart } from '../../context/CartContext';
import { createOrder, getOrderSuccess } from '../../services/api/order';
import { env } from '../../config';
import {
  geocodeAddress,
  reverseGeocodeCoords,
  resolveSuggestionToCoords,
  searchAddressSuggestions,
  type GeocodeSuggestion,
} from '../../services/api/geocode';
import { getAddresses, getProfile, type ProfileUser, type SavedAddress } from '../../services/api/dashboard';
import { logout as logoutApi } from '../../services/api/auth';
import { tokenStorage } from '../../services/auth/token';
import { checkCoupon, getClientCoupons, type PublicCoupon } from '../../services/api/coupon';

type ShippingOption = {
  id?: string | number;
  rate?: string | number;
  code?: string;
  carrier?: string;
  carrier_name?: string;
  carrier_short_name?: string;
  service?: string;
  fee?: number;
  total_fee?: number;
};

const getShippingMethodValue = (option?: ShippingOption | null) => {
  if (!option) return '';
  if (option.id !== undefined && option.id !== null && option.id !== '') return String(option.id);
  return String(option.rate || option.code || option.carrier_short_name || option.carrier || '');
};

const getShippingTitle = (option: ShippingOption, idx: number) =>
  option.carrier_name || option.carrier_short_name || option.carrier || ('G\u00f3i ' + (idx + 1));

const getShippingFee = (option: ShippingOption) => Number(option.total_fee ?? option.fee ?? 0);

const normalizeCoordinate = (value: unknown) => {
  const next = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(next) ? next : null;
};

const normalizeCoords = (value?: { latitude?: unknown; longitude?: unknown } | null) => {
  const latitude = normalizeCoordinate(value?.latitude);
  const longitude = normalizeCoordinate(value?.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  return { latitude, longitude };
};

const normalizeShippingOptions = (value: unknown): ShippingOption[] => {
  if (Array.isArray(value)) return value as ShippingOption[];
  if (value && typeof value === 'object') {
    const candidate = value as { data?: unknown; rates?: unknown; shippingOptions?: unknown };
    if (Array.isArray(candidate.data)) return candidate.data as ShippingOption[];
    if (Array.isArray(candidate.rates)) return candidate.rates as ShippingOption[];
    if (Array.isArray(candidate.shippingOptions)) return candidate.shippingOptions as ShippingOption[];
  }
  return [];
};

const CheckoutScreen = () => {
  const navigation = useNavigation<any>();
  const {
    checkedCartItems,
    checkedCartTotal,
    cartDetailItems,
    cartDetailTotal,
    shippingOptions,
    fetchCartDetail,
    clearCart,
  } = useCart();

  const items = cartDetailItems.length > 0 ? cartDetailItems : checkedCartItems;
  const subTotal = cartDetailItems.length > 0 ? cartDetailTotal : checkedCartTotal;

  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('new');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'money' | 'vnpay'>('money');
  const [shippingMethod, setShippingMethod] = useState('');
  const [booting, setBooting] = useState(true);
  const [loadingShip, setLoadingShip] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [selectedSuggestionLabel, setSelectedSuggestionLabel] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<PublicCoupon | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<PublicCoupon[]>([]);
  const [canUsePoint, setCanUsePoint] = useState(0);
  const [pointToMoney, setPointToMoney] = useState(0);
  const [usedPoint, setUsedPoint] = useState(0);
  const [shippingCalculated, setShippingCalculated] = useState(false);
  const [resolvedShippingOptions, setResolvedShippingOptions] = useState<ShippingOption[]>([]);
  const [shippingDebug, setShippingDebug] = useState('');
  const [mapVisible, setMapVisible] = useState(false);
  const [mapError, setMapError] = useState('');
  const [mapSearchKeyword, setMapSearchKeyword] = useState('');
  const [mapSuggestions, setMapSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [mapSearching, setMapSearching] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const checkingPaymentRef = React.useRef(false);
  const mapWebRef = React.useRef<WebView>(null);
  const pendingMapTargetRef = React.useRef<{ latitude: number; longitude: number } | null>(null);

  // Ref để lưu thông tin đơn hàng đang chờ thanh toán online
  const pendingPaymentRef = useRef<{ orderCode: string; phone: string } | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Lắng nghe khi user quay lại app từ browser thanh toán
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        pendingPaymentRef.current
      ) {
        const { orderCode, phone: orderPhone } = pendingPaymentRef.current;
        pendingPaymentRef.current = null;

        try {
          // Đợi backend xử lý xong callback từ VNPay
          await new Promise((r) => setTimeout(r, 2000));
          const res = await getOrderSuccess(orderCode, orderPhone);

          if (res.code === 'success' && res.order) {
            const isPaid = (res.order as any).paymentStatus === 'paid';
            if (isPaid) {
              clearCart();
              navigation.replace('OrderSuccess', { orderCode, phone: orderPhone });
            } else {
              Alert.alert(
                'Thanh toán chưa hoàn tất',
                'Đơn hàng chưa được thanh toán. Vui lòng kiểm tra lại trong lịch sử đơn hàng.',
                [{ text: 'Về trang chủ', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }]
              );
            }
          } else {
            Alert.alert(
              'Thanh toán thất bại',
              'Đơn hàng không thành công hoặc đã bị hủy.',
              [{ text: 'Về trang chủ', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }]
            );
          }
        } catch {
          Alert.alert(
            'Không thể kiểm tra',
            'Không thể kiểm tra trạng thái thanh toán. Vui lòng kiểm tra trong lịch sử đơn hàng.',
            [{ text: 'Về trang chủ', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }]
          );
        }
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [clearCart, navigation]);

  const shippingTyped = useMemo(() => {
    if (resolvedShippingOptions.length > 0) return resolvedShippingOptions;
    return normalizeShippingOptions(shippingOptions);
  }, [resolvedShippingOptions, shippingOptions]);
  const currentAddress = useMemo(
    () => addresses.find((item) => item._id === selectedAddressId) || null,
    [addresses, selectedAddressId]
  );
  const hasResolvedLocation = useMemo(
    () => Boolean(normalizeCoords(currentAddress || coords || null)),
    [currentAddress, coords]
  );
  const shippingFee = useMemo(() => {
    const option = shippingTyped.find((item) => getShippingMethodValue(item) === shippingMethod);
    return option ? getShippingFee(option) : 0;
  }, [shippingMethod, shippingTyped]);
  const pointDiscount = usedPoint * pointToMoney;
  const total = Math.max(0, subTotal + shippingFee - couponDiscount - pointDiscount);

  const clearShippingSelection = () => {
    setResolvedShippingOptions([]);
    setShippingMethod('');
    setShippingCalculated(false);
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Home');
  };

  useEffect(() => {
    const load = async () => {
      try {
        const token = await tokenStorage.get();
        if (!token) {
          Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập để đặt hàng.', [
            {
              text: 'Đăng nhập',
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
            },
          ]);
          return;
        }

        const [profileResult, addressResult, couponResult] = await Promise.allSettled([
          getProfile(),
          getAddresses(),
          getClientCoupons(),
        ]);
        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value);
          setFullName(profileResult.value.fullName || '');
          setPhone(profileResult.value.phone || '');
        }
        if (addressResult.status === 'fulfilled' && addressResult.value.length > 0) {
          setAddresses(addressResult.value);
          const preferred = addressResult.value.find((item) => item.isDefault) || addressResult.value[0];
          setSelectedAddressId(preferred._id);
          setCoords(normalizeCoords({ latitude: preferred.latitude, longitude: preferred.longitude }));
          setSelectedSuggestionLabel('');
        }
        if (couponResult.status === 'fulfilled' && couponResult.value.success) {
          setAvailableCoupons(couponResult.value.data || []);
        }
      } finally {
        setBooting(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (selectedAddressId !== 'new') {
        setSuggestions([]);
        return;
      }
      if (searchKeyword.trim().length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        setSearchingAddress(true);
        const next = await searchAddressSuggestions(searchKeyword.trim());
        setSuggestions(next);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchingAddress(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchKeyword, selectedAddressId]);

  useEffect(() => {
    if (!mapVisible) {
      setMapSuggestions([]);
      setMapSearching(false);
      setMapSearchKeyword('');
      setMapReady(false);
      return;
    }

    const timer = setTimeout(async () => {
      const keyword = mapSearchKeyword.trim();
      if (keyword.length < 3) {
        setMapSuggestions([]);
        return;
      }
      try {
        setMapSearching(true);
        const next = await searchAddressSuggestions(keyword, 8);
        setMapSuggestions(next);
      } catch {
        setMapSuggestions([]);
      } finally {
        setMapSearching(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [mapSearchKeyword, mapVisible]);

  const syncCartExtras = (response: Awaited<ReturnType<typeof fetchCartDetail>>) => {
    if (!response) return;
    setCanUsePoint(response.canUsePoint || 0);
    setPointToMoney(response.POINT_TO_MONEY || 0);
    if (usedPoint > (response.canUsePoint || 0)) {
      setUsedPoint(response.canUsePoint || 0);
    }
  };

  const geocodeManualAddress = async (query: string) => {
    const keyword = query.trim();
    if (keyword.length < 3) return null;
    const next = await geocodeAddress(keyword);
    const normalized = normalizeCoords(next);
    setCoords(normalized);
    return normalized;
  };

  const resolveCoords = async () => {
    const currentAddressCoords = normalizeCoords(currentAddress || null);
    if (currentAddressCoords) {
      const selected = currentAddressCoords;
      setCoords(selected);
      return selected;
    }
    const manualCoords = normalizeCoords(coords);
    if (manualCoords) {
      return manualCoords;
    }

    const fallbackAddress = searchKeyword.trim() || address.trim();
    if (fallbackAddress) {
      const fallbackCoords = await geocodeManualAddress(fallbackAddress);
      if (fallbackCoords) {
        return fallbackCoords;
      }
    }

    throw new Error('Vui l\u00f2ng ch\u1ecdn \u0111\u1ecba ch\u1ec9 t\u1eeb g\u1ee3i \u00fd ho\u1eb7c nh\u1eadp \u0111\u1ecba ch\u1ec9 chi ti\u1ebft r\u1ed3i ch\u1edd l\u1ea5y t\u1ecda \u0111\u1ed9.');
  };

  const calculateShipping = async (silent = false) => {
    try {
      setLoadingShip(true);
      setShippingCalculated(true);
      setShippingDebug('');
      if (selectedAddressId === 'new' && !coords && (address.trim() || searchKeyword.trim())) {
        await geocodeManualAddress(address.trim() || searchKeyword.trim());
      }
      const nextCoords = await resolveCoords();
      const res = await fetchCartDetail(nextCoords);
      syncCartExtras(res);
      const nextOptions = normalizeShippingOptions(res?.shippingOptions);
      setResolvedShippingOptions(nextOptions);
      setShippingDebug(
        `lat=${nextCoords.latitude.toFixed(6)} | lon=${nextCoords.longitude.toFixed(6)} | raw=${
          res?.shippingOptions == null ? 'null' : Array.isArray(res?.shippingOptions) ? `array:${res.shippingOptions.length}` : typeof res?.shippingOptions
        } | normalized=${nextOptions.length}`
      );

      const first = nextOptions[0] || null;
      if (!first) {
        setShippingMethod('');
        return;
      }
      setShippingMethod(getShippingMethodValue(first));
    } catch (error) {
      setResolvedShippingOptions([]);
      setShippingDebug(error instanceof Error ? error.message : 'shipping_error');
      if (!silent) {
        Alert.alert('Kh\u00f4ng th\u1ec3 t\u00ednh ph\u00ed ship', error instanceof Error ? error.message : 'Vui l\u00f2ng th\u1eed l\u1ea1i.');
      }
    } finally {
      setLoadingShip(false);
    }
  };

  useEffect(() => {
    if (!currentAddress || checkedCartItems.length === 0) return;
    calculateShipping(true);
  }, [currentAddress, checkedCartItems.length]);

  useEffect(() => {
    if (selectedAddressId !== 'new' || !coords || checkedCartItems.length === 0) return;
    calculateShipping(true);
  }, [selectedAddressId, coords?.latitude, coords?.longitude, checkedCartItems.length]);

  useEffect(() => {
    if (shippingTyped.length === 0) {
      if (shippingMethod) setShippingMethod('');
      return;
    }

    const hasActiveSelection = shippingTyped.some((item) => getShippingMethodValue(item) === shippingMethod);
    if (!hasActiveSelection) {
      setShippingMethod(getShippingMethodValue(shippingTyped[0]));
    }
  }, [shippingTyped, shippingMethod]);

  useEffect(() => {
    if (resolvedShippingOptions.length > 0) return;
    const next = normalizeShippingOptions(shippingOptions);
    if (next.length > 0) {
      setResolvedShippingOptions(next);
    }
  }, [shippingOptions, resolvedShippingOptions.length]);

  useEffect(() => {
    if (checkedCartItems.length === 0) {
      handleBack();
    }
  }, [checkedCartItems.length, navigation]);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const checkPendingPaymentResult = async () => {
    const pending = pendingPaymentRef.current;
    if (!pending || checkingPaymentRef.current) return;

    checkingPaymentRef.current = true;
    try {
      for (let i = 0; i < 6; i += 1) {
        const result = await getOrderSuccess(pending.orderCode, pending.phone).catch(() => null);
        const status = String((result as any)?.order?.paymentStatus || '').toLowerCase();
        if (status === 'paid' || status === 'partial' || status === 'partially_paid') {
          pendingPaymentRef.current = null;
          navigation.replace('OrderSuccess', { orderCode: pending.orderCode, phone: pending.phone });
          return;
        }
        await wait(1200);
      }
    } finally {
      checkingPaymentRef.current = false;
    }
  };

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void checkPendingPaymentResult();
      }
    });
    return () => sub.remove();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      await tokenStorage.clear();
    } finally {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  };

  const handleApplyCoupon = async (code: string) => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;

    try {
      setLoadingCoupon(true);
      setCouponError('');
      const res = await checkCoupon({ code: normalized, orderValue: subTotal });
      if (!res.success || !res.data) {
        setCouponError(res.message || 'M\u00e3 kh\u00f4ng h\u1ee3p l\u1ec7.');
        return;
      }

      setAppliedCoupon({
        _id: normalized,
        code: res.data.code,
        name: res.data.code,
        typeDiscount: res.data.typeDiscount,
        value: res.data.value,
        maxDiscountValue: res.data.maxDiscountValue,
      });
      setCouponDiscount(res.data.discountAmount || 0);
      setCouponCode('');
    } catch (error) {
      setCouponError(error instanceof Error ? error.message : 'Kh\u00f4ng th\u1ec3 \u00e1p d\u1ee5ng m\u00e3.');
    } finally {
      setLoadingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    setCouponError('');
  };

  const handleSelectSuggestion = async (suggestion: GeocodeSuggestion) => {
    try {
      setSearchingAddress(true);
      const resolved = await resolveSuggestionToCoords(suggestion);
      setCoords(normalizeCoords(resolved));
      setSelectedSuggestionLabel(suggestion.displayName);
      setSearchKeyword(suggestion.displayName);
      setSuggestions([]);
      setResolvedShippingOptions([]);
      setShippingMethod('');
      setShippingCalculated(false);
      setTimeout(() => {
        calculateShipping(true);
      }, 0);
    } catch {
      Alert.alert('Khong the lay vi tri', 'Vui long chon goi y khac hoac nhap dia chi chi tiet hon.');
    } finally {
      setSearchingAddress(false);
    }
  };

  const mapCenter = useMemo(() => {
    const picked = normalizeCoords(coords);
    if (picked) return picked;
    const selected = normalizeCoords(currentAddress || null);
    if (selected) return selected;
    return { latitude: 10.7410688, longitude: 106.7164031 };
  }, [coords, currentAddress]);

  const mapHtml = useMemo(() => {
    const tileUrl = env.goongApiKey
      ? `https://tiles.goong.io/tile/{z}/{x}/{y}.png?api_key=${encodeURIComponent(env.goongApiKey)}`
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
    .hint { position: absolute; top: 10px; left: 10px; right: 10px; z-index: 1000; background: rgba(255,255,255,.95); border-radius: 10px; padding: 8px 10px; font: 12px Arial; }
  </style>
</head>
<body>
  <div class="hint">Chạm vào bản đồ để chọn vị trí giao hàng</div>
  <div id="map"></div>
  <script>
    window.onerror = function(message, source, lineno, colno) {
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_error', message: String(message || 'unknown'), source: String(source || ''), line: lineno || 0, col: colno || 0 }));
      } catch (e) {}
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var lat = ${mapCenter.latitude};
    var lng = ${mapCenter.longitude};
    var map = L.map('map').setView([lat, lng], 16);
    var primaryTiles = L.tileLayer('${tileUrl}', { maxZoom: 20, attribution: '&copy; OpenStreetMap' }).addTo(map);
    var fallbackTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 20, attribution: '&copy; OpenStreetMap' });
    var switched = false;
    primaryTiles.on('tileerror', function() {
      if (switched) return;
      switched = true;
      map.removeLayer(primaryTiles);
      fallbackTiles.addTo(map);
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_warn', message: 'primary_tile_error_fallback_to_osm' }));
      } catch (e) {}
    });
    var marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.bindPopup('Đang lấy tên vị trí...');
    function notify(lat, lng) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'picked', latitude: lat, longitude: lng }));
    }
    window.setPopupLabel = function(text) {
      var label = String(text || '').trim();
      marker.bindPopup(label || 'Vị trí đã chọn');
      marker.openPopup();
    };
    window.setMarkerFromApp = function(nextLat, nextLng) {
      if (!Number.isFinite(nextLat) || !Number.isFinite(nextLng)) return;
      marker.setLatLng([nextLat, nextLng]);
      map.setView([nextLat, nextLng], 17);
      marker.bindPopup('Đang lấy tên vị trí...');
      marker.openPopup();
      notify(nextLat, nextLng);
    };
    marker.on('dragend', function(e) {
      var p = e.target.getLatLng();
      marker.bindPopup('Đang lấy tên vị trí...');
      marker.openPopup();
      notify(p.lat, p.lng);
    });
    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      marker.bindPopup('Đang lấy tên vị trí...');
      marker.openPopup();
      notify(e.latlng.lat, e.latlng.lng);
    });
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'map_ready' }));
    } catch (e) {}
  </script>
</body>
</html>`;
  }, [mapCenter.latitude, mapCenter.longitude]);

  const handleMapMessage = async (event: any) => {
    try {
      const payload = JSON.parse(event?.nativeEvent?.data || '{}');
      if (payload?.type === 'map_error') {
        setMapError('Không tải được bản đồ. Hệ thống đã thử fallback.');
        return;
      }
      if (payload?.type === 'map_warn') {
        setMapError('Đã chuyển sang bản đồ dự phòng (OSM).');
        return;
      }
      if (payload?.type === 'map_ready') {
        setMapReady(true);
        setMapError('');
        if (pendingMapTargetRef.current) {
          const { latitude, longitude } = pendingMapTargetRef.current;
          pendingMapTargetRef.current = null;
          const js = `window.setMarkerFromApp && window.setMarkerFromApp(${latitude}, ${longitude}); true;`;
          mapWebRef.current?.injectJavaScript(js);
        }
        return;
      }
      if (payload?.type !== 'picked') return;
      const latitude = Number(payload.latitude);
      const longitude = Number(payload.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

      setSelectedAddressId('new');
      setCoords({ latitude, longitude });
      setResolvedShippingOptions([]);
      setShippingMethod('');
      setShippingCalculated(false);

      const reversed = await reverseGeocodeCoords(latitude, longitude).catch(() => null);
      const fallbackLabel = `Vi tri da chon (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
      const displayLabel = reversed?.address?.trim() || fallbackLabel;

      if (reversed?.address) {
        setAddress(reversed.address);
        setSearchKeyword(reversed.address);
        setSelectedSuggestionLabel(reversed.address);
        setMapSearchKeyword(reversed.address);
      } else {
        setSelectedSuggestionLabel(displayLabel);
      }

      const safeLabel = JSON.stringify(displayLabel);
      mapWebRef.current?.injectJavaScript(`window.setPopupLabel && window.setPopupLabel(${safeLabel}); true;`);
    } catch {
      // ignore map payload errors
    }
  };

  const handleSelectMapSuggestion = async (suggestion: GeocodeSuggestion) => {
    try {
      setMapSearching(true);
      const resolved = await resolveSuggestionToCoords(suggestion);
      const latitude = Number(resolved.latitude);
      const longitude = Number(resolved.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

      setSelectedAddressId('new');
      setCoords({ latitude, longitude });
      setResolvedShippingOptions([]);
      setShippingMethod('');
      setShippingCalculated(false);
      setMapSearchKeyword(suggestion.displayName);
      setMapSuggestions([]);
      setAddress(suggestion.displayName);
      setSearchKeyword(suggestion.displayName);
      setSelectedSuggestionLabel(suggestion.displayName);

      if (mapReady) {
        const js = `window.setMarkerFromApp && window.setMarkerFromApp(${latitude}, ${longitude}); true;`;
        mapWebRef.current?.injectJavaScript(js);
      } else {
        pendingMapTargetRef.current = { latitude, longitude };
      }
    } catch {
      setMapError('Không thể lấy tọa độ từ gợi ý này.');
    } finally {
      setMapSearching(false);
    }
  };

  const handleSubmit = async () => {
    const token = await tokenStorage.get();
    if (!token) {
      Alert.alert('Cần đăng nhập', 'Bạn cần đăng nhập để đặt hàng.', [
        {
          text: 'Đăng nhập',
          onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }),
        },
      ]);
      return;
    }

    if (items.length === 0) {
      Alert.alert('Gi\u1ecf h\u00e0ng tr\u1ed1ng', 'Vui l\u00f2ng th\u00eam s\u1ea3n ph\u1ea9m tr\u01b0\u1edbc khi thanh to\u00e1n.');
      return;
    }
    if (!currentAddress && !fullName.trim()) {
      Alert.alert('Thi\u1ebfu th\u00f4ng tin', 'Vui l\u00f2ng nh\u1eadp h\u1ecd v\u00e0 t\u00ean.');
      return;
    }
    if (!currentAddress && !phone.trim()) {
      Alert.alert('Thi\u1ebfu th\u00f4ng tin', 'Vui l\u00f2ng nh\u1eadp s\u1ed1 \u0111i\u1ec7n tho\u1ea1i.');
      return;
    }
    if (!currentAddress && !address.trim()) {
      Alert.alert('Thi\u1ebfu th\u00f4ng tin', 'Vui l\u00f2ng ghi chi ti\u1ebft \u0111\u1ecba ch\u1ec9 giao h\u00e0ng.');
      return;
    }
    if (!shippingMethod) {
      Alert.alert('Ch\u01b0a ch\u1ecdn v\u1eadn chuy\u1ec3n', 'Vui l\u00f2ng t\u00ednh v\u00e0 ch\u1ecdn ph\u01b0\u01a1ng th\u1ee9c v\u1eadn chuy\u1ec3n.');
      return;
    }

    let finalCoords = coords;
    if (!finalCoords) {
      try {
        finalCoords = await resolveCoords();
      } catch (error) {
        Alert.alert('L\u1ed7i \u0111\u1ecba ch\u1ec9', error instanceof Error ? error.message : 'Vui l\u00f2ng th\u1eed l\u1ea1i.');
        return;
      }
    }

    const receiver = currentAddress || {
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
    };

    try {
      setSubmitting(true);
      const res = await createOrder({
        fullName: receiver.fullName,
        phone: receiver.phone,
        address: receiver.address,
        latitude: finalCoords.latitude,
        longitude: finalCoords.longitude,
        note: note.trim() || undefined,
        coupon: appliedCoupon?.code,
        usedPoint: usedPoint || undefined,
        paymentMethod,
        shippingMethod,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          variant: item.variant,
        })),
      });

      if (res.code !== 'success' || !res.orderCode || !res.phone) {
        Alert.alert('Kh\u00f4ng th\u1ec3 \u0111\u1eb7t h\u00e0ng', res.message || 'Vui l\u00f2ng th\u1eed l\u1ea1i.');
        return;
      }

      clearCart();

      if (paymentMethod === 'vnpay') {
        const path = 'payment-vnpay';
        pendingPaymentRef.current = { orderCode: res.orderCode, phone: res.phone };
        await Linking.openURL(
          `${env.apiBaseUrl}/api/v1/client/order/${path}?orderCode=${res.orderCode}&phone=${res.phone}&source=mobile`
        );
        Alert.alert(
          'Dang cho xac nhan thanh toan',
          'Sau khi thanh toan xong, quay lai app. He thong se tu dong cap nhat ket qua.'
        );
        return;
      }

      clearCart();
      navigation.replace('OrderSuccess', { orderCode: res.orderCode, phone: res.phone });
    } catch (error) {
      Alert.alert('L\u1ed7i \u0111\u1eb7t h\u00e0ng', error instanceof Error ? error.message : 'Vui l\u00f2ng th\u1eed l\u1ea1i.');
    } finally {
      setSubmitting(false);
    }
  };

  if (booting) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.muted}>{'\u0110ang t\u1ea3i th\u00f4ng tin thanh to\u00e1n...'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#FFF7F6', '#FFFFFF']} style={styles.hero}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn}>
            <ArrowLeft size={20} color={colors.secondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{'Thanh to\u00e1n'}</Text>
          <View style={styles.iconSpacer} />
        </View>

        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>{'X\u00e1c nh\u1eadn th\u00f4ng tin giao h\u00e0ng'}</Text>
          <Text style={styles.bannerText}>{'Giao di\u1ec7n mobile \u0111ang \u0111\u1ed3ng b\u1ed9 theo lu\u1ed3ng thanh to\u00e1n c\u1ee7a web.'}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.accountRow}>
            <View style={styles.avatar}>
              <User size={18} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.labelTop}>{'T\u00e0i kho\u1ea3n \u0111\u1eb7t h\u00e0ng'}</Text>
              <Text style={styles.strong}>{profile?.fullName || fullName || 'Kh\u00e1ch h\u00e0ng'}</Text>
              <Text style={styles.muted}>{profile?.phone || phone || 'Ch\u01b0a c\u1eadp nh\u1eadt s\u1ed1 \u0111i\u1ec7n tho\u1ea1i'}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <LogOut size={16} color="#D64545" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <MapPin size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>{'Th\u00f4ng tin nh\u1eadn h\u00e0ng'}</Text>
          </View>

          {addresses.map((item) => {
            const active = selectedAddressId === item._id;
            return (
              <Pressable
                key={item._id}
                onPress={() => {
                  setSelectedAddressId(item._id);
                  setSelectedSuggestionLabel('');
                  setResolvedShippingOptions([]);
                  setShippingMethod('');
                  setShippingCalculated(false);
                }}
                style={[styles.addressItem, active && styles.addressItemActive]}
              >
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.flex}>
                  <Text style={styles.strong}>{item.fullName}</Text>
                  <Text style={styles.muted}>{item.phone}</Text>
                  <Text style={styles.muted}>{item.address}</Text>
                </View>
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => {
              setSelectedAddressId('new');
              setSelectedSuggestionLabel('');
              setCoords(null);
              setResolvedShippingOptions([]);
              setShippingMethod('');
              setShippingCalculated(false);
            }}
            style={styles.newAddressRow}
          >
            <View style={[styles.radio, selectedAddressId === 'new' && styles.radioActive]}>
              {selectedAddressId === 'new' ? <View style={styles.radioDot} /> : null}
            </View>
            <Text style={[styles.newAddressText, selectedAddressId === 'new' && styles.newAddressTextActive]}>
              {'S\u1eed d\u1ee5ng \u0111\u1ecba ch\u1ec9 kh\u00e1c'}
            </Text>
          </Pressable>

          {selectedAddressId === 'new' ? (
            <View style={styles.formBlock}>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder={'H\u1ecd v\u00e0 t\u00ean'}
                style={styles.input}
                keyboardType="default"
                autoCapitalize="words"
                autoCorrect={false}
                spellCheck={false}
              />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder={'S\u1ed1 \u0111i\u1ec7n tho\u1ea1i'}
                keyboardType="phone-pad"
                style={styles.input}
              />
              <View style={styles.searchWrap}>
                <Search size={16} color="#8A8A8A" />
                <TextInput
                  value={searchKeyword}
                  onChangeText={(value) => {
                    setSearchKeyword(value);
                    if (value.trim() !== selectedSuggestionLabel.trim()) {
                      setCoords(null);
                      setSelectedSuggestionLabel('');
                      setResolvedShippingOptions([]);
                      setShippingMethod('');
                      setShippingCalculated(false);
                    }
                  }}
                  placeholder={'T\u00ecm nhanh \u0111\u1ecba ch\u1ec9'}
                  style={styles.searchInput}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                />
              </View>
              <Text style={styles.helperText}>{'Bạn có thể nhập trực tiếp địa chỉ hoặc chọn từ gợi ý để hệ thống lấy vị trí giao hàng.'}</Text>
              {searchingAddress ? <Text style={styles.muted}>{'\u0110ang t\u00ecm g\u1ee3i \u00fd \u0111\u1ecba ch\u1ec9...'}</Text> : null}
              {suggestions.length > 0 ? (
                <View style={styles.suggestionList}>
                  {suggestions.map((item, index) => (
                    <Pressable key={`${item.displayName}-${index}`} onPress={() => handleSelectSuggestion(item)} style={styles.suggestionItem}>
                      <Text style={styles.suggestionText}>{item.displayName}</Text>
                    </Pressable>
                  ))}
                </View>
              ) : null}
              <TextInput
                value={address}
                onChangeText={(value) => {
                  setAddress(value);
                  setResolvedShippingOptions([]);
                  setShippingMethod('');
                  setShippingCalculated(false);
                }}
                placeholder={'S\u1ed1 nh\u00e0, t\u00f2a nh\u00e0, ghi ch\u00fa giao h\u00e0ng'}
                multiline
                style={[styles.input, styles.textarea]}
                keyboardType="default"
                autoCapitalize="sentences"
                autoCorrect={false}
                spellCheck={false}
              />
              <Text style={styles.helperText}>
                {'Vui lòng ghi đầy đủ số nhà, tên đường, hẻm, tầng hoặc mốc giao hàng để shipper giao chính xác hơn.'}
              </Text>
              <TouchableOpacity style={styles.mapBtn} onPress={() => setMapVisible(true)}>
                <MapPin size={16} color="#fff" />
                <Text style={styles.mapBtnText}>{'Chọn vị trí trên bản đồ'}</Text>
              </TouchableOpacity>
              <View style={[styles.statusPill, coords ? styles.statusPillReady : styles.statusPillPending]}>
                <Text style={[styles.statusPillText, coords ? styles.statusPillTextReady : styles.statusPillTextPending]}>
                  {coords
                    ? '\u0110\u00e3 x\u00e1c nh\u1eadn v\u1ecb tr\u00ed giao h\u00e0ng'
                    : 'Ch\u01b0a c\u00f3 v\u1ecb tr\u00ed \u0111\u1ec3 t\u00ednh ph\u00ed ship'}
                </Text>
              </View>
            </View>
          ) : currentAddress ? (
            <View style={styles.selectedBox}>
              <Check size={16} color={colors.primary} />
              <Text style={styles.selectedText}>{currentAddress.address}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={() => calculateShipping(false)} disabled={loadingShip}>
            {loadingShip ? <ActivityIndicator color="#fff" /> : <Truck size={16} color="#fff" />}
            <Text style={styles.primaryBtnText}>
              {hasResolvedLocation ? 'T\u00ednh l\u1ea1i ph\u00ed giao h\u00e0ng' : 'T\u00ednh ph\u00ed giao h\u00e0ng'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Package size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>{'T\u00f3m t\u1eaft \u0111\u01a1n h\u00e0ng'}</Text>
          </View>
          {items.map((item) => (
            <View key={item.lineId} style={styles.summaryRow}>
              <View style={styles.flex}>
                <Text style={styles.summaryName}>{item.product.title} x{item.quantity}</Text>
                {item.variant && item.variant.length > 0 ? (
                  <Text style={styles.summaryVariant}>{item.variant.map((variant) => variant.label || variant.value).join(' / ')}</Text>
                ) : null}
              </View>
              <Text style={styles.summaryValue}>{formatPrice(item.product.priceValue * item.quantity)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={[styles.shippingPanel, hasResolvedLocation && styles.shippingPanelReady]}>
            <Text style={styles.inlineSectionTitle}>{'Ph\u01b0\u01a1ng th\u1ee9c v\u1eadn chuy\u1ec3n'}</Text>
            <Text style={styles.inlineSectionCaption}>{'Kh\u00e1ch h\u00e0ng c\u00f3 th\u1ec3 ch\u1ecdn h\u00e3ng ship ph\u00f9 h\u1ee3p theo ph\u00ed giao h\u00e0ng b\u00ean d\u01b0\u1edbi.'}</Text>
            {loadingShip ? (
              <Text style={styles.inlineHint}>{'\u0110ang t\u00ednh ph\u00ed ship...'}</Text>
            ) : shippingTyped.length > 0 ? (
              shippingTyped.map((option, idx) => {
                const value = getShippingMethodValue(option);
                const active = value === shippingMethod;
                return (
                  <TouchableOpacity
                    key={`${value}-${idx}`}
                    onPress={() => setShippingMethod(value || '')}
                    style={styles.inlineOption}
                  >
                    <View style={styles.inlineOptionLeft}>
                      <View style={[styles.smallRadio, active && styles.smallRadioActive]}>
                        {active ? <View style={styles.smallRadioDot} /> : null}
                      </View>
                      <Text style={[styles.inlineOptionLabel, active && styles.inlineOptionLabelActive]}>
                        {getShippingTitle(option, idx)} {option.service ? `(${option.service})` : ''}
                      </Text>
                    </View>
                    <Text style={[styles.inlineOptionPrice, active && styles.inlineOptionPriceActive]}>
                      (+) {formatPrice(getShippingFee(option))}
                    </Text>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View>
                <Text style={styles.inlineHint}>
                  {hasResolvedLocation
                    ? 'H\u1ec7 th\u1ed1ng ch\u01b0a tr\u1ea3 v\u1ec1 b\u1ea3ng ph\u00ed c\u1ee7a c\u00e1c h\u00e3ng ship cho v\u1ecb tr\u00ed n\u00e0y.'
                    : selectedAddressId === 'new'
                      ? 'Ch\u1ecdn g\u1ee3i \u00fd ho\u1eb7c nh\u1eadp \u0111\u1ecba ch\u1ec9 chi ti\u1ebft \u0111\u1ec3 xem ph\u00ed ship.'
                      : 'Kh\u00f4ng c\u00f3 ph\u01b0\u01a1ng th\u1ee9c v\u1eadn chuy\u1ec3n.'}
                </Text>
                {shippingDebug ? <Text style={styles.debugText}>{shippingDebug}</Text> : null}
              </View>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>{'T\u1ea1m t\u00ednh'}</Text>
            <Text style={styles.summaryValue}>{formatPrice(subTotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.muted}>{'Ph\u00ed v\u1eadn chuy\u1ec3n'}</Text>
            <Text style={styles.summaryValue}>{!shippingMethod ? '__' : shippingFee === 0 ? 'Mi\u1ec5n ph\u00ed' : formatPrice(shippingFee)}</Text>
          </View>
          {couponDiscount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>{'Gi\u1ea3m gi\u00e1 coupon'}</Text>
              <Text style={styles.discountValue}>-{formatPrice(couponDiscount)}</Text>
            </View>
          ) : null}
          {pointDiscount > 0 ? (
            <View style={styles.summaryRow}>
              <Text style={styles.muted}>{'Gi\u1ea3m t\u1eeb \u0111i\u1ec3m'}</Text>
              <Text style={styles.discountValue}>-{formatPrice(pointDiscount)}</Text>
            </View>
          ) : null}
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>{'T\u1ed5ng c\u1ed9ng'}</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Wallet size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>{'Ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n'}</Text>
          </View>
          {[
            { key: 'money', label: 'Thanh to\u00e1n khi nh\u1eadn h\u00e0ng (COD)' },
            { key: 'vnpay', label: 'C\u1ed5ng thanh to\u00e1n VNPAY' },
          ].map((option) => {
            const active = paymentMethod === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => setPaymentMethod(option.key as 'money' | 'vnpay')}
                style={[styles.option, active && styles.optionActive]}
              >
                <Text style={styles.optionTitle}>{option.label}</Text>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>{'\u0110i\u1ec3m th\u01b0\u1edfng'}</Text>
          </View>
          <Text style={styles.muted}>{'C\u00f3 th\u1ec3 d\u00f9ng: ' + canUsePoint.toLocaleString('vi-VN') + ' \u0111i\u1ec3m'}</Text>
          {canUsePoint > 0 && pointToMoney > 0 ? (
            <View style={styles.pointRow}>
              <TextInput value={usedPoint ? String(usedPoint) : ''} onChangeText={(value) => { const parsed = Number(value.replace(/\\D/g, '')) || 0; setUsedPoint(Math.max(0, Math.min(parsed, canUsePoint))); }} placeholder={'Nh\u1eadp s\u1ed1 \u0111i\u1ec3m mu\u1ed1n d\u00f9ng'} keyboardType='number-pad' style={[styles.input, styles.flexInput]} />
              <TouchableOpacity style={styles.removeChip} onPress={() => setUsedPoint(0)}>
                <Text style={styles.removeChipText}>{'X\u00f3a'}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {pointDiscount > 0 ? <Text style={styles.pointHint}>{'Gi\u1ea3m t\u1eeb \u0111i\u1ec3m: ' + formatPrice(pointDiscount)}</Text> : null}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <TicketPercent size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>{'M\u00e3 gi\u1ea3m gi\u00e1'}</Text>
          </View>
          {appliedCoupon ? (
            <View style={styles.appliedCouponRow}>
              <View style={styles.flex}>
                <Text style={styles.strong}>{appliedCoupon.code}</Text>
                <Text style={styles.muted}>{'\u0110\u00e3 gi\u1ea3m ' + formatPrice(couponDiscount)}</Text>
              </View>
              <TouchableOpacity onPress={removeCoupon} style={styles.removeChip}>
                <Text style={styles.removeChipText}>{'B\u1ecf'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponInputRow}>
                <TextInput value={couponCode} onChangeText={(value) => setCouponCode(value.toUpperCase())} placeholder={'Nh\u1eadp m\u00e3 gi\u1ea3m gi\u00e1'} style={[styles.input, styles.flexInput]} />
                <TouchableOpacity style={[styles.applyBtn, (!couponCode.trim() || loadingCoupon) && styles.applyBtnDisabled]} onPress={() => handleApplyCoupon(couponCode)} disabled={!couponCode.trim() || loadingCoupon}>
                  <Text style={styles.applyBtnText}>{loadingCoupon ? '...' : '\u00c1p d\u1ee5ng'}</Text>
                </TouchableOpacity>
              </View>
              {couponError ? <Text style={styles.errorText}>{couponError}</Text> : null}
            </>
          )}
          {availableCoupons.length > 0 && !appliedCoupon ? (
            <View style={styles.availableCouponList}>
              {availableCoupons.slice(0, 4).map((coupon) => {
                const isUsable = !coupon.minOrderValue || subTotal >= coupon.minOrderValue;
                return (
                  <Pressable key={coupon._id} onPress={() => isUsable && handleApplyCoupon(coupon.code)} style={[styles.availableCouponItem, !isUsable && styles.availableCouponItemDisabled]}>
                    <Text style={styles.availableCouponCode}>{coupon.code}</Text>
                    <Text style={styles.availableCouponName}>{coupon.name}</Text>
                    {coupon.minOrderValue ? (
                      <Text style={styles.availableCouponHint}>
                        {isUsable ? '\u00c1p d\u1ee5ng \u0111\u01b0\u1ee3c' : 'C\u1ea7n th\u00eam ' + formatPrice(coupon.minOrderValue - subTotal)}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Pressable style={styles.noteHeader} onPress={() => setShowNote((prev) => !prev)}>
            <View style={[styles.checkbox, showNote && styles.checkboxActive]}>
              {showNote ? <Check size={12} color="#fff" /> : null}
            </View>
            <Text style={styles.sectionTitle}>{'Th\u00eam ghi ch\u00fa \u0111\u01a1n h\u00e0ng'}</Text>
          </Pressable>
          {showNote ? (
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={'V\u00ed d\u1ee5: g\u1ecdi tr\u01b0\u1edbc khi giao...'}
              multiline
              style={[styles.input, styles.textarea, styles.noteInput]}
              keyboardType="default"
              autoCapitalize="sentences"
              autoCorrect={false}
              spellCheck={false}
            />
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.labelTop}>{'T\u1ed5ng thanh to\u00e1n'}</Text>
          <Text style={styles.bottomTotal}>{formatPrice(total)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitText}>{submitting ? '\u0110ang x\u1eed l\u00fd...' : '\u0110\u1eb7t h\u00e0ng ngay'}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={mapVisible} transparent animationType="slide" onRequestClose={() => setMapVisible(false)}>
        <View style={styles.mapModalOverlay}>
          <View style={styles.mapModalCard}>
            <View style={styles.mapModalHeader}>
              <Text style={styles.mapModalTitle}>{'Chọn vị trí giao hàng'}</Text>
              <TouchableOpacity style={styles.mapCloseBtn} onPress={() => setMapVisible(false)}>
                <Text style={styles.mapCloseText}>{'Đóng'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.mapSearchWrap}>
              <Search size={16} color="#8A8A8A" />
              <TextInput
                value={mapSearchKeyword}
                onChangeText={setMapSearchKeyword}
                placeholder={'Tìm địa chỉ trên bản đồ'}
                style={styles.mapSearchInput}
                keyboardType="default"
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
              />
            </View>
            {mapSearching ? <Text style={styles.mapSearchingText}>{'Đang tìm gợi ý địa chỉ...'}</Text> : null}
            {mapSuggestions.length > 0 ? (
              <View style={styles.mapSuggestionList}>
                {mapSuggestions.map((item, index) => (
                  <Pressable
                    key={`${item.displayName}-${index}-map`}
                    style={styles.mapSuggestionItem}
                    onPress={() => handleSelectMapSuggestion(item)}
                  >
                    <Text style={styles.mapSuggestionText} numberOfLines={2}>
                      {item.displayName}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
            {mapError ? (
              <View style={styles.mapErrorBanner}>
                <Text style={styles.mapErrorText}>{mapError}</Text>
              </View>
            ) : null}
            <View style={styles.mapContainer}>
              <WebView
                ref={mapWebRef}
                originWhitelist={['*']}
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="always"
                startInLoadingState
                source={{ html: mapHtml }}
                onMessage={handleMapMessage}
                onError={() => setMapError('WebView map bị lỗi tải.')}
                onHttpError={() => setMapError('HTTP lỗi khi tải bản đồ.')}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F7' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#FFF8F7' },
  hero: { paddingBottom: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 14,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSpacer: { width: 36 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.secondary },
  banner: { marginHorizontal: 16, padding: 16, borderRadius: 22, backgroundColor: '#fff' },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: colors.secondary },
  bannerText: { fontSize: 12, color: '#6E6E6E', marginTop: 4, lineHeight: 18 },
  content: { padding: 16, paddingBottom: 144, gap: 16 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 16 },
  accountRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.softPink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: { flex: 1 },
  labelTop: { fontSize: 11, color: '#8A8A8A', textTransform: 'uppercase', letterSpacing: 0.5 },
  strong: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  muted: { fontSize: 12, color: '#707070', lineHeight: 18 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.secondary },
  addressItem: {
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0E6E6',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  addressItemActive: { borderColor: colors.primary, backgroundColor: '#FFF6F5' },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioActive: { borderColor: colors.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  newAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  newAddressText: { fontSize: 13, fontWeight: '600', color: '#7A7A7A' },
  newAddressTextActive: { color: colors.primary },
  formBlock: { gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#F1E7E7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: '#FFFCFC',
  },
  flexInput: { flex: 1 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#F1E7E7',
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: '#FFFCFC',
  },
  searchInput: { flex: 1, paddingVertical: 12, color: colors.text, fontSize: 14 },
  helperText: { fontSize: 12, color: '#8A7A7A', lineHeight: 18, marginTop: -2 },
  suggestionList: { borderWidth: 1, borderColor: '#F0E6E6', borderRadius: 16, overflow: 'hidden' },
  suggestionItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F7ECEC' },
  suggestionText: { color: colors.text, fontSize: 13 },
  textarea: { minHeight: 84, textAlignVertical: 'top' },
  statusPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, marginTop: -2 },
  statusPillReady: { backgroundColor: '#EEF9F1', borderWidth: 1, borderColor: '#CDEDD5' },
  statusPillPending: { backgroundColor: '#FFF6EE', borderWidth: 1, borderColor: '#F4D6B8' },
  statusPillText: { fontSize: 12, fontWeight: '600' },
  statusPillTextReady: { color: '#1F7A3E' },
  statusPillTextPending: { color: '#A25B15' },
  selectedBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderRadius: 16,
    padding: 12,
    backgroundColor: '#FFF8F7',
    marginBottom: 12,
  },
  selectedText: { flex: 1, fontSize: 12, color: '#666', lineHeight: 18 },
  selectedLocationRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#FFF8F7',
    borderWidth: 1,
    borderColor: '#F3E1DE',
  },
  selectedLocationText: { flex: 1, fontSize: 12, color: '#666', lineHeight: 18 },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  mapBtn: {
    marginTop: 2,
    backgroundColor: colors.secondary,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  mapBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  noteHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D8D8D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  noteInput: { marginTop: 14 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F0E6E6',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  optionActive: { borderColor: colors.primary, backgroundColor: '#FFF7F6' },
  optionTitle: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.text },
  priceNormal: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  priceActive: { fontSize: 12, fontWeight: '700', color: colors.primary },
  couponInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  applyBtn: { backgroundColor: colors.primary, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13 },
  applyBtnDisabled: { opacity: 0.5 },
  applyBtnText: { color: '#fff', fontWeight: '700' },
  appliedCouponRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#FFD8D8', borderRadius: 16, padding: 12, backgroundColor: '#FFF8F8' },
  removeChip: { borderRadius: 999, backgroundColor: '#FFF0F0', paddingHorizontal: 12, paddingVertical: 8 },
  removeChipText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  availableCouponList: { marginTop: 12, gap: 10 },
  availableCouponItem: { borderWidth: 1, borderColor: '#F0E6E6', borderRadius: 16, padding: 12 },
  availableCouponItemDisabled: { opacity: 0.45 },
  availableCouponCode: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  availableCouponName: { color: colors.secondary, fontSize: 13, fontWeight: '700', marginTop: 4 },
  availableCouponHint: { color: '#707070', fontSize: 11, marginTop: 4 },
  pointRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  pointHint: { marginTop: 10, color: colors.primary, fontWeight: '700' },
  errorText: { color: '#DC2626', fontSize: 12, marginTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  summaryName: { flex: 1, fontSize: 12, color: colors.text },
  summaryVariant: { fontSize: 11, color: '#8A7A7A', marginTop: 4 },
  summaryValue: { fontSize: 12, color: colors.text, fontWeight: '600' },
  discountValue: { fontSize: 12, color: '#DC2626', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  shippingPanel: {
    marginBottom: 4,
    borderRadius: 18,
    padding: 14,
    minHeight: 124,
    backgroundColor: '#FFF8F7',
    borderWidth: 1,
    borderColor: '#F3E1DE',
  },
  shippingPanelReady: {
    backgroundColor: '#FFF4F2',
    borderColor: '#F0C9C2',
  },
  inlineSectionTitle: { fontSize: 15, fontWeight: '700', color: colors.secondary, marginBottom: 12 },
  inlineSectionCaption: { fontSize: 12, color: '#8A7A7A', lineHeight: 18, marginTop: -6, marginBottom: 12 },
  inlineOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, gap: 12 },
  inlineOptionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  smallRadio: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#D7D7D7', alignItems: 'center', justifyContent: 'center' },
  smallRadioActive: { borderColor: colors.primary },
  smallRadioDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary },
  inlineOptionLabel: { flex: 1, fontSize: 13, color: '#6F6F6F' },
  inlineOptionLabelActive: { color: colors.secondary, fontWeight: '600' },
  inlineOptionPrice: { fontSize: 13, color: '#7B7B7B', fontWeight: '600' },
  inlineOptionPriceActive: { color: colors.primary },
  inlineHint: { fontSize: 13, color: '#7B7B7B', lineHeight: 20 },
  debugText: { fontSize: 11, color: '#9A3412', lineHeight: 16, marginTop: 8 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: colors.secondary },
  totalValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bottomTotal: { fontSize: 20, fontWeight: '800', color: colors.primary },
  submitBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 22,
    alignItems: 'center',
    minWidth: 170,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  mapModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  mapModalCard: {
    height: '78%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  mapModalHeader: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mapModalTitle: { fontSize: 16, fontWeight: '800', color: colors.secondary },
  mapCloseBtn: { backgroundColor: '#FFF1F1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  mapCloseText: { color: colors.primary, fontWeight: '700', fontSize: 12 },
  mapSearchWrap: {
    margin: 10,
    borderWidth: 1,
    borderColor: '#EADDDD',
    borderRadius: 12,
    paddingHorizontal: 10,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFCFC',
  },
  mapSearchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 8 },
  mapSearchingText: { marginHorizontal: 12, marginTop: -2, marginBottom: 6, fontSize: 12, color: '#8A7A7A' },
  mapSuggestionList: {
    marginHorizontal: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F0E6E6',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 140,
    backgroundColor: '#fff',
  },
  mapSuggestionItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F7ECEC' },
  mapSuggestionText: { fontSize: 12, color: colors.text, lineHeight: 18 },
  mapErrorBanner: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFF4F2', borderBottomWidth: 1, borderBottomColor: '#F3D4CF' },
  mapErrorText: { color: '#B45309', fontSize: 12, fontWeight: '600' },
  mapContainer: { flex: 1 },
});

export default CheckoutScreen;
