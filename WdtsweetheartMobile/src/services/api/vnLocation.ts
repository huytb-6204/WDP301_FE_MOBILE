export type ProvinceOption = {
  id: string;
  name: string;
};

export type DistrictOption = {
  id: string;
  name: string;
  provinceId: string;
};

export type WardOption = {
  id: string;
  name: string;
  districtId: string;
};

type ProvinceApiItem = {
  province_id: string | number;
  province_name: string;
};

type DistrictApiItem = {
  district_id: string | number;
  district_name: string;
  province_id: string | number;
};

type WardApiItem = {
  ward_id: string | number;
  ward_name: string;
  district_id: string | number;
};

const API_BASE = 'https://vapi.vnappmob.com/api/province';

const fetchJson = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return (await res.json()) as T;
};

export const getProvinces = async (): Promise<ProvinceOption[]> => {
  const res = await fetchJson<{ results?: ProvinceApiItem[] }>(API_BASE);
  return (res.results || []).map((item) => ({
    id: String(item.province_id),
    name: item.province_name,
  }));
};

export const getDistricts = async (provinceId: string): Promise<DistrictOption[]> => {
  const res = await fetchJson<{ results?: DistrictApiItem[] }>(`${API_BASE}/district/${provinceId}`);
  return (res.results || []).map((item) => ({
    id: String(item.district_id),
    name: item.district_name,
    provinceId: String(item.province_id),
  }));
};

export const getWards = async (districtId: string): Promise<WardOption[]> => {
  const res = await fetchJson<{ results?: WardApiItem[] }>(`${API_BASE}/ward/${districtId}`);
  return (res.results || []).map((item) => ({
    id: String(item.ward_id),
    name: item.ward_name,
    districtId: String(item.district_id),
  }));
};
