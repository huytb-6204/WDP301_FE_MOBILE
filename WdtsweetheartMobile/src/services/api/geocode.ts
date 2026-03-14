export type GeocodeResult = {
  latitude: number;
  longitude: number;
};

type NominatimResponseItem = {
  lat: string;
  lon: string;
};

export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  const query = address.trim();
  if (!query) {
    throw new Error('Vui lòng nhập địa chỉ để tính phí giao hàng.');
  }

  // Bias geocoding to Vietnam for better shipping matching.
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&accept-language=vi&q=${encodeURIComponent(query)}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'WdtsweetheartMobile/1.0 (checkout geocode)',
    },
  });

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
