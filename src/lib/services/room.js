// lib/services/room.js ← VERSI FINAL & ANTI-ERROR
import api from "../api";

export const getRooms = async (page = 1, filters = {}, pageSize = 10) => {
  const params = new URLSearchParams({
    page,
    per_page: pageSize,
  });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, value);
    }
  });

  const res = await api.get(`/rooms?${params.toString()}`);
  
  // Laravel paginated response → res.data.data
  return {
    rooms: res.data.data.data,           // ← INI YANG BENAR
    meta: {
      current_page: res.data.data.current_page,
      last_page: res.data.data.last_page,
      per_page: res.data.data.per_page,
      total: res.data.data.total,
    },
  };
};

export const getRoomById = async (id) => {
  const res = await api.get(`/rooms/${id}`);
  return res.data.data; // Laravel wrapper
};

export const createRoom = async (hotelId, data) => {
  const res = await api.post(`/hotel/${hotelId}/rooms`, data);
  return res.data;
};

export const updateRoom = async (id, payload) => {
  const res = await api.put(`/rooms/${id}`, payload);
  return res.data.data;
};

export const deleteRoom = async (id) => {
  await api.delete(`/rooms/${id}`);
};