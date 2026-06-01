// lib/axios.ts
import axios from "axios";
import { removeToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bot.asuma.my.id";

// Fungsi getToken langsung dari cookie (lebih reliable)
function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/asuma_token=([^;]+)/);
  return match ? match[1] : null;
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getTokenFromCookie(); // langsung baca cookie
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Jangan hapus token dulu, cukup kirim event (tapi kita tidak ingin logout otomatis)
      // Biarkan dashboard menampilkan error, jangan redirect
      console.warn("401 Unauthorized - API mungkin bermasalah");
      // Hapus baris removeToken() dan dispatchEvent jika ingin tetap di dashboard
      // removeToken(); 
      // window.dispatchEvent(...);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
/*import axios from "axios";
import { getToken, removeToken } from "./auth";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://bot.asuma.my.id";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("asuma:unauthorized"));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
*/
