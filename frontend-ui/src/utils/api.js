import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

/* ---------- auto-refresh interceptor ---------- */
api.interceptors.response.use(
  (resp) => resp,
  async (err) => {
    const original = err.config;
    if (
      err.response?.status === 401 &&
      !original._retry &&
      localStorage.getItem("refresh")
    ) {
      original._retry = true;
      try {
        const r = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
          refresh: localStorage.getItem("refresh"),
        });
        localStorage.setItem("access", r.data.access);
        api.defaults.headers.common["Authorization"] = `Bearer ${r.data.access}`;
        original.headers["Authorization"]           = `Bearer ${r.data.access}`;
        return api(original);   // retry with new token
      } catch(e) {
        localStorage.clear();
        window.location = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;

