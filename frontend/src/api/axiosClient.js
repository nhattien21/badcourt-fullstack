import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://badcourt-fullstack.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Tự động gắn token nếu user đã đăng nhập
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;