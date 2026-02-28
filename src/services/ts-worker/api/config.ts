import tsWorkerAxios from "../ts.worker.axios.config";
import { SystemConfig, ModelsResponse } from "../types";
import { ApiResponse } from "@/types/response";

export const configApi = {
  getConfig: () => 
    tsWorkerAxios.get<ApiResponse<SystemConfig>>('/api/config') as unknown as Promise<ApiResponse<SystemConfig>>,
  
  updateConfig: (data: SystemConfig) => 
    tsWorkerAxios.post<ApiResponse>('/api/config', data) as unknown as Promise<ApiResponse>,
  
  clearCache: () => 
    tsWorkerAxios.post<ApiResponse>('/api/config/clear-cache') as unknown as Promise<ApiResponse>,

  testConnection: (data: { provider: string; model: string; apiKey?: string }) =>
    tsWorkerAxios.post<ApiResponse<{ success: boolean; message: string }>>('/api/config/test-connection', data) as unknown as Promise<ApiResponse<{ success: boolean; message: string }>>,

  getModels: () =>
    tsWorkerAxios.get<ApiResponse<ModelsResponse>>('/api/config/models') as unknown as Promise<ApiResponse<ModelsResponse>>,
};
