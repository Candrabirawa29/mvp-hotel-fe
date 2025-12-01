// lib/services/room.js
import api from "../api";

export async function getRooms(page = 1, filters = {}, pageSize = 10) {
  const params = new URLSearchParams({
    page,
    per_page: pageSize,
  });
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    if (Array.isArray(value)) {
      if (value.length > 0) params.append(key, value.join(","));
    } else {
      params.append(key, value.toString());
    }
  });

  const res = await api.get(`/rooms?${params.toString()}`);
  return {
    meta: {
      current_page: res.data.data.current_page,
      last_page: res.data.data.last_page,
      total: res.data.data.total,
      per_page: res.data.data.per_page,
    },
    rooms: res.data.data.data,
  };
}

export async function getRoomById(id) {
  const res = await api.get(`/rooms/${id}`);
  return res.data.data;
}

export async function createRoom(payload) {
  const res = await api.post("/rooms", payload);
  return res.data.data;
}

export async function updateRoom(id, payload) {
  const res = await api.put(`/rooms/${id}`, payload);
  return res.data.data;
}

export async function deleteRoom(id) {
  const res = await api.delete(`/rooms/${id}`);
  return res.data.data;
}

// Bulk create
export async function bulkCreateRooms(roomTypeId, payload) {
  const res = await api.post(`/room-types/${roomTypeId}/rooms/bulk`, payload);
  return res.data.data;
}

// Auto generate
export async function autoGenerateRooms(roomTypeId, payload) {
  const res = await api.post(`/room-types/${roomTypeId}/rooms/auto-generate`, payload);
  return res.data.data;
}