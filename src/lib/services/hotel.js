import api from "../api";

// lib/services/hotel.js
export async function getHotels(page = 1, filters = {}, pageSize = 10) {
  const params = new URLSearchParams({
    page,
    per_page: pageSize,
  })

  // Loop semua filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return

    if (Array.isArray(value)) {
      if (value.length > 0) {
        // contoh: facilities=1,2,3
        params.append(key, value.join(","))
      }
    } else {
      params.append(key, value.toString())
    }
  })

  const res = await api.get(`/hotels?${params.toString()}`)

  return {
    meta: {
      current_page: res.data.data.current_page,
      last_page: res.data.data.last_page,
      total: res.data.data.total,
      per_page: res.data.data.per_page,
    },
    hotels: res.data.data.data,
  }
}

// Ambil hotel detail
export async function getHotelById(id) {
  const res = await api.get(`/hotels/${id}`);
  return res.data.data;
}

// Tambah hotel
export async function createHotel(payload) {
  const res = await api.post("/hotels", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data?.data;
}

// Update hotel
export async function updateHotel(id, payload) {
  const res = await api.post(`/hotels/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
}

// Hapus hotel
export async function deleteHotel(id) {
  const res = await api.delete(`/hotels/${id}`);
  return res.data.data;
}
