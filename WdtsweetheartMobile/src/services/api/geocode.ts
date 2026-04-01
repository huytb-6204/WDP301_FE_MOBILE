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

  if (goongKey) {
    try {
      const url = `https://restapi.goong.io/place/autocomplete?api_key=${goongKey}&input=${encodeURIComponent(
        query
      )}&more_compound=true&limit=${limit}`;
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = (await res.json()) as GoongAutocompleteResponse;
        const mapped = (data.predictions || [])
          .map((item) => ({
            displayName: item.description || '',
            placeId: item.place_id || '',
          }))
          .filter((item) => item.displayName && item.placeId);
        if (mapped.length > 0) return mapped;
      }
    } catch {
      // fallback OSM
    }
  }

  return searchByNominatim(query, limit);
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
