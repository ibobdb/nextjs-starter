import axios from 'axios';
import { ApiResponse } from '@/types/response';
import 'dotenv/config';

const isBrowser = typeof window !== 'undefined';

const tsWorkerAxios = axios.create({
  baseURL: isBrowser 
    ? '/api/ts-worker' 
    : (process.env.TS_WORKER_URL || 'http://localhost:8000'),
  timeout: Number(process.env.TS_WORKER_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
    ...(isBrowser ? {} : { 'X-API-Key': process.env.TS_WORKER_KEY }),
  },
});
// Response Interceptor
tsWorkerAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Log error for debugging if needed
    console.error('[TS-Worker Axios Error]:', error.message || error);

    const apiError: ApiResponse = {
      success: false,
      message: error.response?.data?.message || 'TS-Worker error',
      error: error.response?.data?.error || error.message || 'Unknown error',
      status: error.response?.status || 500,
    };
    return Promise.reject(apiError);
  }
);

export default tsWorkerAxios;
