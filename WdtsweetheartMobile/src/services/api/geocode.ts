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
    throw new Error('Vui long nhap dia chi de tinh phi giao hang.');
  }

  // Use Nominatim as a lightweight geocoding source for mobile client.
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    query
  )}`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Khong the chuyen dia chi thanh toa do. Vui long thu lai.');
  }

  const data = (await res.json()) as NominatimResponseItem[];
  const first = data?.[0];

  if (!first?.lat || !first?.lon) {
    throw new Error('Khong tim thay toa do tu dia chi da nhap.');
  }

  const latitude = Number(first.lat);
  const longitude = Number(first.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Toa do tra ve khong hop le.');
  }

  return { latitude, longitude };
};
