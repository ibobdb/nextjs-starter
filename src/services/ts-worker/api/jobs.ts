import tsWorkerAxios from "../ts.worker.axios.config";
import { JobStatus, DatasourceLog } from "../types";
import { ApiResponse } from "@/types/response";

export const jobsApi = {
  runFullPipeline: () => 
    tsWorkerAxios.post<ApiResponse>('/api/jobs/run-full') as unknown as Promise<ApiResponse>,
  
  getJobStatus: (id: string) => 
    tsWorkerAxios.get<ApiResponse<JobStatus>>(`/api/jobs/status/${id}`) as unknown as Promise<ApiResponse<JobStatus>>,
  
  getLogs: () => 
    tsWorkerAxios.get<ApiResponse<DatasourceLog[]>>('/api/jobs/logs') as unknown as Promise<ApiResponse<DatasourceLog[]>>,
};
