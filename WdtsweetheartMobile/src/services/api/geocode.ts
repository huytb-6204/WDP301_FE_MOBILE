export type GeocodeResult = {
  latitude: number;
  longitude: number;
};

type NominatimResponseItem = {
  lat: string;
  lon: string;
  display_name?: string;
};

export type GeocodeSuggestion = {
  latitude: number;
  longitude: number;
  displayName: string;
};

const headers = {
  Accept: 'application/json',
  'User-Agent': 'WdtsweetheartMobile/1.0 (checkout geocode)',
};

export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  const query = address.trim();
  if (!query) {
    throw new Error('Vui lòng nhập địa chỉ để tính phí giao hàng.');
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&accept-language=vi&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error('Không thể chuyển địa chỉ thành tọa độ. Vui lòng thử lại.');
  }

  const data = (await res.json()) as NominatimResponseItem[];
  const first = data?.[0];

  if (!first?.lat || !first?.lon) {
    throw new Error('Không tìm thấy tọa độ từ địa chỉ đã nhập.');
  }

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Tọa độ trả về không hợp lệ.');
  }

  return { latitude, longitude };
};

export const searchAddressSuggestions = async (
  keyword: string,
  limit = 5
): Promise<GeocodeSuggestion[]> => {
  const query = keyword.trim();
  if (query.length < 3) return [];

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&countrycodes=vn&accept-language=vi&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error('Không thể tìm gợi ý địa chỉ. Vui lòng thử lại.');
  }

  const data = (await res.json()) as NominatimResponseItem[];
  return (data || [])
    .map((item) => ({
      latitude: Number(item.lat),
      longitude: Number(item.lon),
      displayName: item.display_name || '',
    }))
    .filter((item) => item.displayName && Number.isFinite(item.latitude) && Number.isFinite(item.longitude));
};
