import axios from "axios";
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
