import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  withCredentials: true,
});

let isRefreshing = false;
let queue: (() => void)[] = [];

const processQueue = () => {
  queue.forEach(cb => cb());
  queue = [];
};

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // If refresh already happening, wait
      if (isRefreshing) {
        return new Promise(resolve => {
          queue.push(() => resolve(api(originalRequest)));
        });
      }

      isRefreshing = true;

      try {
        // 🔁 refresh via cookie
        await api.post("/auth/refresh");

        processQueue();
        return api(originalRequest);
      } catch (err) {
        // 🚨 refresh failed = real logout
        window.location.href = "/signin";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
