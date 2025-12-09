import api from "../api";


export const getRoomTypes = async (page = 1, filters = {}, pageSize = 10) => {
  const params = new URLSearchParams({
    page,
    per_page: pageSize,
  });

  // Append filter jika ada
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, value);
    }
  });

  const res = await api.get(`/room-types?${params.toString()}`);

  // Struktur Laravel pagination:
  // {
  //   data: {
  //     data: [...],
  //     current_page: 1,
  //     last_page: 10,
  //     per_page: 10,
  //     total: 100
  //   }
  // }

  return {
    roomTypes: res.data.data.data,   // ← LIST DATA
    meta: {
      current_page: res.data.data.current_page,
      last_page: res.data.data.last_page,
      per_page: res.data.data.per_page,
      total: res.data.data.total,
    },
  };
};

export const getRoomTypeById = async (id) => {
  try {
    const res = await api.get(`/room-types/${id}`);
    return res.data.data;
  } catch (error) {
    console.error("Error fetching room type:", error);
    throw error;
  }
};

export const createRoomType = async (data) => {
  try {
    const res = await api.post('/room-types', data);
    return res.data.data;
  } catch (error) {
    console.error("Error creating room type:", error);
    throw error;
  }
};

export const updateRoomType = async (id, data) => {
  try {
    const res = await api.post(`/room-types/${id}`, data);
    return res.data.data;
  } catch (error) {
    console.error("Error updating room type:", error);
    throw error;
  }
};

export const deleteRoomType = async (id) => {
  try {
    await api.delete(`/room-types/${id}`);
  } catch (error) {
    console.error("Error deleting room type:", error);
    throw error;
  }
};