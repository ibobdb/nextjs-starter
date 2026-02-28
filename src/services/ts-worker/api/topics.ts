import tsWorkerAxios from "../ts.worker.axios.config";
import {
  TrendKeyword,
  TrendHistory,
  TopicCandidate,
  ClusterKeyword,
  RawItem,
  UpdateCandidatePayload,
  ClusteringRequest,
  CandidateFilterParams,
  PaginationParams,
  PaginatedResponse,
  ClusteringProcess,
  ArticleDraft,
} from "../types";
import { ApiResponse } from "@/types/response";

export const topicsApi = {
  // ── Trends ──────────────────────────────────────────────────────────────────

  getTrends: (page: number = 1, limit: number = 20) =>
    tsWorkerAxios.get<ApiResponse<TrendKeyword[]>>(`/api/topics/trends?page=${page}&limit=${limit}`) as unknown as Promise<ApiResponse<TrendKeyword[]>>,

  getTrendHistory: (keyword: string, days: number = 30) =>
    tsWorkerAxios.get<ApiResponse<TrendHistory[]>>(
      `/api/topics/trends/${encodeURIComponent(keyword)}/history?days=${days}`
    ) as unknown as Promise<ApiResponse<TrendHistory[]>>,

  // ── Candidates ──────────────────────────────────────────────────────────────

  getCandidates: (params: CandidateFilterParams = {}) => {
    const {
      status = 'generated',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      intent,
    } = params;
    const query = new URLSearchParams({
      status,
      page: String(page),
      limit: String(limit),
      sortBy: sortBy ?? 'createdAt',
      sortOrder: sortOrder ?? 'desc',
      ...(search ? { search } : {}),
      ...(intent ? { intent } : {}),
    });
    return tsWorkerAxios.get<PaginatedResponse<TopicCandidate>>(
      `/api/topics/candidates?${query.toString()}`
    ) as unknown as Promise<PaginatedResponse<TopicCandidate>>;
  },

  getCandidate: (id: string) =>
    tsWorkerAxios.get<ApiResponse<TopicCandidate>>(`/api/topics/candidates/${id}`) as unknown as Promise<ApiResponse<TopicCandidate>>,

  getCandidateCluster: (id: string) =>
    tsWorkerAxios.get<ApiResponse<ClusterKeyword[]>>(`/api/topics/candidates/${id}/cluster`) as unknown as Promise<ApiResponse<ClusterKeyword[]>>,

  getCandidateRawItems: (id: string) =>
    tsWorkerAxios.get<ApiResponse<RawItem[]>>(`/api/topics/candidates/${id}/raw-items`) as unknown as Promise<ApiResponse<RawItem[]>>,

  updateCandidate: (id: string, payload: UpdateCandidatePayload) =>
    tsWorkerAxios.patch<ApiResponse>(`/api/topics/candidates/${id}`, payload) as unknown as Promise<ApiResponse>,

  approveCandidate: (id: string) =>
    tsWorkerAxios.post<ApiResponse>(`/api/topics/approve/${id}`) as unknown as Promise<ApiResponse>,

  rejectCandidate: (id: string) =>
    tsWorkerAxios.post<ApiResponse>(`/api/topics/reject/${id}`) as unknown as Promise<ApiResponse>,

  ignoreCandidate: (id: string) =>
    tsWorkerAxios.post<ApiResponse>(`/api/topics/candidates/${id}/ignore`) as unknown as Promise<ApiResponse>,

  bulkApprove: (ids: string[]) =>
    tsWorkerAxios.post<ApiResponse>('/api/topics/candidates/bulk-approve', { ids }) as unknown as Promise<ApiResponse>,

  bulkReject: (ids: string[]) =>
    tsWorkerAxios.post<ApiResponse>('/api/topics/candidates/bulk-reject', { ids }) as unknown as Promise<ApiResponse>,

  // ── Content Generation ────────────────────────────────────────────────────────

  generateBrief: (id: string) =>
    tsWorkerAxios.post<ApiResponse<TopicCandidate>>(`/api/topics/candidates/${id}/generate-brief`) as unknown as Promise<ApiResponse<TopicCandidate>>,

  generateContent: (id: string) =>
    tsWorkerAxios.post<ApiResponse<ArticleDraft>>(`/api/topics/candidates/${id}/generate-content`) as unknown as Promise<ApiResponse<ArticleDraft>>,

  createVariant: (id: string, intent: string) =>
    tsWorkerAxios.post<ApiResponse<TopicCandidate>>(`/api/topics/candidates/${id}/variants`, { intent }) as unknown as Promise<ApiResponse<TopicCandidate>>,

  // ── Evaluation ──────────────────────────────────────────────────────────────

  evaluateAll: () =>
    tsWorkerAxios.post<ApiResponse>('/api/topics/evaluate-all') as unknown as Promise<ApiResponse>,

  // ── Clustering ──────────────────────────────────────────────────────────────

  runClustering: (data: ClusteringRequest) =>
    tsWorkerAxios.post<ApiResponse<{ jobId: string }>>('/api/topics/run-clustering', data) as unknown as Promise<ApiResponse<{ jobId: string }>>,

  getClusteringProcesses: (params: PaginationParams = {}) => {
    const { page = 1, limit = 10, sortBy = 'startTime', sortOrder = 'desc' } = params;
    return tsWorkerAxios.get<PaginatedResponse<ClusteringProcess>>(
      `/api/topics/clustering-processes?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`
    ) as unknown as Promise<PaginatedResponse<ClusteringProcess>>;
  },
};
