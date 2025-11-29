// lib/storage/authStorage.js
import { deleteCookie, getCookie, setCookie } from "cookies-next";

export const TOKEN_KEY = "token";
export const ROLE_KEY = "role";

export function setAuth(token, role) {
    // Cek dari env variable atau fallback ke NODE_ENV
    const useSecureCookie = process.env.NEXT_PUBLIC_COOKIE_SECURE === 'true' 
        || process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
        maxAge: 60 * 60 * 24 * 7, // 7 hari
        path: '/',
        secure: useSecureCookie, // false di development
        sameSite: 'lax',
        httpOnly: false,
    };
    
    setCookie(TOKEN_KEY, token, cookieOptions);
    setCookie(ROLE_KEY, role, cookieOptions);
    
    // Log untuk debugging (hapus di production)
    if (!useSecureCookie) {
        console.log('🔓 Development mode: cookies set without secure flag');
    }
}

export function clearAuth() {
    deleteCookie(TOKEN_KEY, { path: '/' });
    deleteCookie(ROLE_KEY, { path: '/' });
}

export function getToken() {
    return getCookie(TOKEN_KEY);
}

export function getRole() {
    return getCookie(ROLE_KEY);
}
