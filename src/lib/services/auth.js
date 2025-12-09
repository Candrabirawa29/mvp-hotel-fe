// lib/services/auth.js
import api from "../api"
import { clearAuth, setAuth } from "../storage/authStorage";

// Login
export async function login(email, password) {
  const res = await api.post("/login", { email, password });
  
  console.log("🔐 Full Login Response:", res.data);
  
  // ✅ Sesuai dengan struktur backend Laravel kamu
  const { token, user, hotel_id } = res.data.data;
  
  console.log("📦 Extracted Data:");
  console.log("  - Token:", token?.substring(0, 20) + "...");
  console.log("  - User:", user);
  console.log("  - Role:", user.role);
  console.log("  - Hotel ID:", hotel_id || user.hotel_id);

  // ✅ Simpan token + role (sesuai setAuth function kamu)
  setAuth(token, user.role);
  
  // ✅ TAMBAHAN: Simpan hotel_id dan user data lengkap
  if (hotel_id || user.hotel_id) {
    localStorage.setItem("hotel_id", hotel_id || user.hotel_id);
  }
  
  // Simpan user object lengkap untuk keperluan lain
  localStorage.setItem("user", JSON.stringify(user));
  
  console.log("✅ Data tersimpan di localStorage:");
  console.log("  - role:", localStorage.getItem("role"));
  console.log("  - hotel_id:", localStorage.getItem("hotel_id"));
  console.log("  - user:", localStorage.getItem("user"));
  
  return { user, role: user.role };
}

// Register
export async function register(name, email, password) {
  const res = await api.post("/register", { name, email, password });
  
  const { token, user, role } = res.data.data;
  
  // Simpan data setelah register
  setAuth(token, role);
  
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
  
  return res.data.data;
}

// Logout
export async function logout() {
  try {
    await api.post("/logout");
  } catch (e) {
    console.warn("Logout request failed:", e.message)
  } finally {
    clearAuth();
    // Clear additional data
    localStorage.removeItem("hotel_id");
    localStorage.removeItem("user");
  }
}

// Get Current User
export async function getCurrentUser() {
  try {
    const res = await api.get("/user");
    
    console.log("👤 Profile Response:", res.data);
    
    const userData = res.data.data;
    
    // Update localStorage dengan data terbaru
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      
      if (userData.role) {
        localStorage.setItem("role", userData.role);
      }
      
      if (userData.hotel_id) {
        localStorage.setItem("hotel_id", userData.hotel_id);
      }
    }
    
    return userData;
  } catch (error) {
    console.error("❌ Get user error:", error);
    return null;
  }
}

// ✅ HELPER FUNCTIONS TAMBAHAN
export function getHotelId() {
  return localStorage.getItem("hotel_id");
}

export function getUserRole() {
  return localStorage.getItem("role");
}

export function getStoredUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}