import { env } from '../../config';

export type GeocodeResult = {
  latitude: number;
  longitude: number;
};

type NominatimResponseItem = {
  lat: string;
  lon: string;
  display_name?: string;
};

type GoongAutocompleteResponse = {
  predictions?: Array<{
    place_id?: string;
    description?: string;
  }>;
};

type GoongGeocodeResponse = {
  results?: Array<{
    geometry?: { location?: { lat?: number; lng?: number } };
    formatted_address?: string;
  }>;
};

type GoongPlaceDetailResponse = {
  result?: {
    geometry?: { location?: { lat?: number; lng?: number } };
    formatted_address?: string;
  };
};

export type GeocodeSuggestion = {
  displayName: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
  source?: 'goong' | 'osm';
};

export type ReverseGeocodeResult = GeocodeResult & {
  address: string;
};

const headers = {
  Accept: 'application/json',
  'User-Agent': 'WdtsweetheartMobile/1.0 (checkout geocode)',
};

const parseCoords = (latitude: unknown, longitude: unknown): GeocodeResult | null => {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { latitude: lat, longitude: lon };
};

const goongKey = (env.goongApiKey || env.openMapKey || '').trim();

const geocodeByNominatim = async (query: string): Promise<GeocodeResult> => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=vn&accept-language=vi&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error('Khong the chuyen dia chi thanh toa do. Vui long thu lai.');
  }

  const data = (await res.json()) as NominatimResponseItem[];
  const first = data?.[0];
  const coords = parseCoords(first?.lat, first?.lon);

  if (!coords) {
    throw new Error('Khong tim thay toa do tu dia chi da nhap.');
  }

  return coords;
};

export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  const query = address.trim();
  if (!query) {
    throw new Error('Vui long nhap dia chi de tinh phi giao hang.');
  }

  if (goongKey) {
    try {
      const goongUrl = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(query)}&api_key=${goongKey}`;
      const res = await fetch(goongUrl, { headers });
      if (res.ok) {
        const data = (await res.json()) as GoongGeocodeResponse;
        const first = data.results?.[0];
        const coords = parseCoords(first?.geometry?.location?.lat, first?.geometry?.location?.lng);
        if (coords) return coords;
      }
    } catch {
      // fallback OSM
    }
  }

  return geocodeByNominatim(query);
};

const searchByNominatim = async (query: string, limit: number): Promise<GeocodeSuggestion[]> => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&countrycodes=vn&accept-language=vi&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error('Khong the tim goi y dia chi. Vui long thu lai.');
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

export const searchAddressSuggestions = async (
  keyword: string,
  limit = 5
): Promise<GeocodeSuggestion[]> => {
  const query = keyword.trim();
  if (query.length < 3) return [];
  const goongPromise = goongKey
    ? fetch(
        `https://restapi.goong.io/place/autocomplete?api_key=${goongKey}&input=${encodeURIComponent(
          query
        )}&more_compound=true&limit=${limit}`,
        { headers }
      ).then((r) => (r.ok ? r.json() : Promise.reject(new Error(`goong_status_${r.status}`))))
    : Promise.reject(new Error('no_goong_key'));
  const osmPromise = searchByNominatim(query, limit);

  const [goongRes, osmRes] = await Promise.allSettled([goongPromise, osmPromise]);

  let combined: GeocodeSuggestion[] = [];

  if (goongRes.status === 'fulfilled') {
    const data = goongRes.value as GoongAutocompleteResponse;
    const goongMapped = (data.predictions || [])
      .map((item) => ({
        displayName: item.description || '',
        placeId: item.place_id || '',
        source: 'goong' as const,
      }))
      .filter((item) => item.displayName && item.placeId);
    combined = [...goongMapped];
  }

  if (osmRes.status === 'fulfilled') {
    const osmList = (osmRes.value || []).map((item) => ({ ...item, source: 'osm' as const }));
    osmList.forEach((osmItem) => {
      const itemName = String(osmItem.displayName || '')
        .split(',')[0]
        .trim()
        .toLowerCase();
      const duplicated = combined.some((gItem) =>
        String(gItem.displayName || '').toLowerCase().includes(itemName)
      );
      if (!duplicated) {
        combined.push(osmItem);
      }
    });
  }

  return combined;
};

export const resolveSuggestionToCoords = async (suggestion: GeocodeSuggestion): Promise<GeocodeResult> => {
  const direct = parseCoords(suggestion.latitude, suggestion.longitude);
  if (direct) return direct;

  if (goongKey && suggestion.placeId) {
    const url = `https://restapi.goong.io/place/detail?place_id=${encodeURIComponent(
      suggestion.placeId
    )}&api_key=${goongKey}`;
    const res = await fetch(url, { headers });
    if (res.ok) {
      const data = (await res.json()) as GoongPlaceDetailResponse;
      const coords = parseCoords(data.result?.geometry?.location?.lat, data.result?.geometry?.location?.lng);
      if (coords) return coords;
    }
  }

  return geocodeAddress(suggestion.displayName);
};

export const reverseGeocodeCoords = async (
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> => {
  const direct = parseCoords(latitude, longitude);
  if (!direct) {
    throw new Error('Toa do khong hop le.');
  }

  if (goongKey) {
    try {
      const url = `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${goongKey}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = (await res.json()) as GoongGeocodeResponse;
        const first = data.results?.[0];
        const next = parseCoords(first?.geometry?.location?.lat, first?.geometry?.location?.lng);
        if (next && first?.formatted_address) {
          return { ...next, address: first.formatted_address };
        }
      }
    } catch {
      // fallback OSM reverse below
    }
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&accept-language=vi&lat=${encodeURIComponent(
    String(latitude)
  )}&lon=${encodeURIComponent(String(longitude))}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error('Khong the lay dia chi tu toa do.');
  }

  const data = (await res.json()) as { display_name?: string };
  return {
    ...direct,
    address: data.display_name || '',
  };
};
