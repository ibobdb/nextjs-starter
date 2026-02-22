import tsWorkerAxios from "../ts.worker.axios.config";
import { DataSource, DataSourceRun, PaginationParams, PaginatedResponse } from "../types";
import { ApiResponse } from "@/types/response";

export const dataSourcesApi = {
  listDataSources: () => 
    tsWorkerAxios.get<ApiResponse<DataSource[]>>('/api/datasources') as unknown as Promise<ApiResponse<DataSource[]>>,
  
  getDataSourceRuns: (id: string, params: PaginationParams = {}) => {
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = params;
    return tsWorkerAxios.get<ApiResponse<PaginatedResponse<DataSourceRun>>>(
      `/api/datasources/${id}/runs?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    ) as unknown as Promise<ApiResponse<PaginatedResponse<DataSourceRun>>>;
  },
};
