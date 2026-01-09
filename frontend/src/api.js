import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // envia les cookies automàticament
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      console.warn("Sessió expirada o invàlida (api.js).");
    }
    return Promise.reject(err);
  }
);

export default api;
