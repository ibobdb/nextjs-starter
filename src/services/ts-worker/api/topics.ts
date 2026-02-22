import tsWorkerAxios from "../ts.worker.axios.config";
import { TrendKeyword, TopicCandidate, ClusteringRequest, PaginationParams, PaginatedResponse, ClusteringProcess } from "../types";
import { ApiResponse } from "@/types/response";

export const topicsApi = {
  getTrends: (limit: number = 20) => 
    tsWorkerAxios.get<ApiResponse<TrendKeyword[]>>(`/api/topics/trends?limit=${limit}`) as unknown as Promise<ApiResponse<TrendKeyword[]>>,
  
  getCandidates: (params: PaginationParams & { status?: string } = {}) => {
    const { status = 'generated', page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    return tsWorkerAxios.get<ApiResponse<PaginatedResponse<TopicCandidate>>>(
      `/api/topics/candidates?status=${status}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    ) as unknown as Promise<ApiResponse<PaginatedResponse<TopicCandidate>>>;
  },
  
  approveCandidate: (id: string) => 
    tsWorkerAxios.post<ApiResponse>(`/api/topics/approve/${id}`) as unknown as Promise<ApiResponse>,
  
  rejectCandidate: (id: string) => 
    tsWorkerAxios.post<ApiResponse>(`/api/topics/reject/${id}`) as unknown as Promise<ApiResponse>,
    
  evaluateAll: () =>
    tsWorkerAxios.post<ApiResponse>('/api/topics/evaluate-all') as unknown as Promise<ApiResponse>,
  
  runClustering: (data: ClusteringRequest) => 
    tsWorkerAxios.post<ApiResponse<{ jobId: string }>>('/api/topics/run-clustering', data) as unknown as Promise<ApiResponse<{ jobId: string }>>,

  getClusteringProcesses: (params: PaginationParams = {}) => {
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = params;
    return tsWorkerAxios.get<ApiResponse<PaginatedResponse<ClusteringProcess>>>(
      `/api/topics/clustering-processes?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    ) as unknown as Promise<ApiResponse<PaginatedResponse<ClusteringProcess>>>;
  },
};
