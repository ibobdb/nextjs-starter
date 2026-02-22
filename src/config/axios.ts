import axios from 'axios';
import { ApiResponse } from '@/types/response';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // You can add auth tokens here
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const apiError: ApiResponse = {
      success: false,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      error: error.response?.data?.error || error.code,
      status: error.response?.status || 500,
    };
    return Promise.reject(apiError);
  }
);

export default axiosInstance;
