//context/AuthContext.js

"use client";

import { createContext, useState, useEffect } from "react";
import { getCurrentUser, login as loginService, logout as logoutService } from "@/lib/services/auth";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cek token & fetch user saat pertama kali mount
  useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCurrentUser();
        if (data) {
          setUser(data.user);
          setRole(data.role);
        }
      } catch {
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  // Fungsi login
  async function login(email, password) {
    const { user, role } = await loginService(email, password);
    setUser(user);
    setRole(role);
  }

  // Fungsi logout
  async function logout() {
    await logoutService();
    setUser(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
