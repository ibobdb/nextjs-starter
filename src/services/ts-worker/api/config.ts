import tsWorkerAxios from "../ts.worker.axios.config";
import { SystemConfig } from "../types";
import { ApiResponse } from "@/types/response";

export const configApi = {
  getConfig: () => 
    tsWorkerAxios.get<ApiResponse<SystemConfig>>('/api/config') as unknown as Promise<ApiResponse<SystemConfig>>,
  
  updateConfig: (data: SystemConfig) => 
    tsWorkerAxios.post<ApiResponse>('/api/config', data) as unknown as Promise<ApiResponse>,
  
  clearCache: () => 
    tsWorkerAxios.post<ApiResponse>('/api/config/clear-cache') as unknown as Promise<ApiResponse>,
};
