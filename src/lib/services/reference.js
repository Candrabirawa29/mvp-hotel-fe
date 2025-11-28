import api from "../api";

// Get provinces
export async function getProvinces() {
  const res = await api.get('/references/provinces');
  return res.data.data;
}

// Get cities by province
export async function getCities(provinceId = null) {
  const params = provinceId ? `?province_id=${provinceId}` : '';
  const res = await api.get(`/references/cities${params}`);
  return res.data.data;
}

// Get districts by city
export async function getDistricts(cityId = null) {
  const params = cityId ? `?city_id=${cityId}` : '';
  const res = await api.get(`/references/districts${params}`);
  return res.data.data;
}

// Get sub districts by district
export async function getSubDistricts(districtId = null) {
  const params = districtId ? `?district_id=${districtId}` : '';
  const res = await api.get(`/references/sub-districts${params}`);
  return res.data.data;
}

// Get hotel facilities
export async function getFacilities() {
  const res = await api.get('/references/facilities');
  return res.data.data;
}

// Get roles (untuk user management)
export async function getRoles() {
  const res = await api.get('/roles');
  return res.data.data;
}

// === KHUSUS UNTUK ROOM TYPE MANAGEMENT ===

// Get all hotels (untuk dropdown di form room type)
export async function getHotels() {
  try {
    // Coba endpoint khusus dulu (lebih cepat & clean)
    const res = await api.get('/references/hotels');
    return res.data.data;
  } catch (error) {
    // Kalau endpoint belum ada, fallback ke /hotels dengan per_page besar
    console.warn('Endpoint /references/hotels belum ada, menggunakan fallback');
    const res = await api.get('/hotels?per_page=500 ');
    return res.data.data.data;
  }
}

// Get room type facilities (AC, TV, WiFi, Breakfast, dll untuk tipe kamar)
export async function getRoomTypeFacilities() {
  const res = await api.get('/references/room-type-facilities');
  return res.data.data;
}

// Get bed types (Single Bed, Double Bed, Queen, King, Bunk Bed, dll)
export async function getBedTypes() {
  const res = await api.get('/references/bed-types');
  return res.data.data;
}