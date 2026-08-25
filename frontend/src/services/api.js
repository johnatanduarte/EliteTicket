import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("eliteticket_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
