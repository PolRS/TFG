import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // 👈 molt important: envia les cookies automàticament
});

/*api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      console.warn("Sessió expirada o invàlida. Redirigint a login...");
      window.location.href = "/"; // ✅ torna al login
    }
    return Promise.reject(err);
  }
);*/

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      console.warn("Sessió expirada o invàlida (api.js).");
      // ❌ No redirigim aquí, només marquem com a invàlid
    }
    return Promise.reject(err);
  }
);

export default api;
