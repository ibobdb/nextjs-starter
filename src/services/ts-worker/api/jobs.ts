import tsWorkerAxios from "../ts.worker.axios.config";
import { JobStatus, JobLog, CleanupResult, PaginationParams } from "../types";
import { ApiResponse, PaginatedResponse } from "@/types/response";

export const jobsApi = {
  runFullPipeline: (lookbackDays?: number) =>
    tsWorkerAxios.post<ApiResponse>('/api/jobs/run-full', lookbackDays ? { lookbackDays } : {}) as unknown as Promise<ApiResponse>,

  getJobStatus: (id: string) =>
    tsWorkerAxios.get<ApiResponse<JobStatus>>(`/api/jobs/status/${id}`) as unknown as Promise<ApiResponse<JobStatus>>,

  getLogs: (params: PaginationParams = {}) => {
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = params;
    return tsWorkerAxios.get<PaginatedResponse<JobLog>>(
      `/api/jobs/logs?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    ) as unknown as Promise<PaginatedResponse<JobLog>>;
  },

  cleanup: (retentionDays?: number) =>
    tsWorkerAxios.post<ApiResponse<CleanupResult>>('/api/jobs/cleanup', retentionDays ? { retentionDays } : {}) as unknown as Promise<ApiResponse<CleanupResult>>,
};
