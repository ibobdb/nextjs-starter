import tsWorkerAxios from "../ts.worker.axios.config";
import { DataSource, DataSourceRun, RunLog, PaginationParams } from "../types";
import { ApiResponse, PaginatedResponse } from "@/types/response";

export const dataSourcesApi = {
  listDataSources: () =>
    tsWorkerAxios.get<ApiResponse<DataSource[]>>('/api/datasources') as unknown as Promise<ApiResponse<DataSource[]>>,

  getDataSourceRuns: (id: string, params: PaginationParams = {}) => {
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = params;
    return tsWorkerAxios.get<PaginatedResponse<DataSourceRun>>(
      `/api/datasources/${id}/runs?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    ) as unknown as Promise<PaginatedResponse<DataSourceRun>>;
  },

  getRunLogs: (runId: string) =>
    tsWorkerAxios.get<ApiResponse<RunLog[]>>(`/api/datasources/runs/${runId}/logs`) as unknown as Promise<ApiResponse<RunLog[]>>,

  createDataSource: (data: Partial<DataSource>) =>
    tsWorkerAxios.post<ApiResponse<DataSource>>('/api/datasources', data) as unknown as Promise<ApiResponse<DataSource>>,

  updateDataSource: (id: string, data: Partial<DataSource>) =>
    tsWorkerAxios.patch<ApiResponse<DataSource>>(`/api/datasources/${id}`, data) as unknown as Promise<ApiResponse<DataSource>>,

  deleteDataSource: (id: string) =>
    tsWorkerAxios.delete<ApiResponse>(`/api/datasources/${id}`) as unknown as Promise<ApiResponse>,

  syncDataSource: (id: string) =>
    tsWorkerAxios.post<ApiResponse>(`/api/datasources/${id}/sync`) as unknown as Promise<ApiResponse>,
};
