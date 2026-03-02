import axios from 'axios';
import { ApiResponse } from '@/hooks/use-data';

export interface SystemConfigItem {
  key: string;
  value: string;
  description: string | null;
  isSecret: boolean;
}

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
  withCredentials: true,
});

export const settingsApi = {
  getSettings: async (): Promise<ApiResponse<SystemConfigItem[]>> => {
    const res = await axiosClient.get('/api/settings');
    return res.data;
  },
  updateSettings: async (settings: { key: string; value: string }[]): Promise<ApiResponse<null>> => {
    const res = await axiosClient.put('/api/settings', { settings });
    return res.data;
  },
};
