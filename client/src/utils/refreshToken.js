import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || '';

const refreshToken = async () => {
  try {
    const res = await axios.get(`${API_BASE_URL}/auth/refresh-token`, {
      withCredentials: true,
    });
    localStorage.setItem('accessToken', res.data.accessToken);
    return res.data.accessToken;
  } catch (err) {
    console.error("Refresh token failed:", err);
    return null;
  }
};

export default refreshToken;
