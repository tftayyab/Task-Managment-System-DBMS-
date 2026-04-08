import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if ((status === 401 || status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        //console.log('🔁 Trying to refresh token...');

        // 🛠 Use plain axios here instead of api to avoid interceptor
        const refreshResponse = await axios.get(
          `${API_BASE_URL}/auth/refresh-token`,
          { withCredentials: true }
        );

        const newToken = refreshResponse.data.accessToken;
        if (!newToken) throw new Error("No token returned from refresh");

        localStorage.setItem('token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        //console.log('✅ Token refreshed via interceptor');

        return api(originalRequest); // retry original request
      } catch (err) {
        console.error("❌ Refresh failed in interceptor:", err.response?.data || err.message);
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
