// lib/services/roomType.js
import api from "../api";

export async function getRoomTypes(page = 1, filters = {}, pageSize = 10) {
  const params = new URLSearchParams({
    page,
    per_page: pageSize,
  });
  Object.entries(filters).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") return;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params.append(key, value.join(","));
      }
    } else {
      params.append(key, value.toString());
    }
  });
  const res = await api.get(`/room-types?${params.toString()}`);
  return {
    meta: {
      current_page: res.data.data.current_page,
      last_page: res.data.data.last_page,
      total: res.data.data.total,
      per_page: res.data.data.per_page,
    },
    roomTypes: res.data.data.data,
  };
}

export async function getRoomTypeById(id) {
  const res = await api.get(`/room-types/${id}`);
  return res.data.data;
}

export async function createRoomType(payload) {
  const res = await api.post("/room-types", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data
}


export async function updateRoomType(id, payload) {
  const res = await api.post(`/room-types/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
}

export async function deleteRoomType(id) {
  const res = await api.delete(`/room-types/${id}`);
  return res.data.data;
}