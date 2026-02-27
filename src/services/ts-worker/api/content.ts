import tsWorkerAxios from "../ts.worker.axios.config";
import { PublishedData, ContentMetrics, PaginationParams } from "../types";
import { ApiResponse, PaginatedResponse } from "@/types/response";

export const contentApi = {
  getContentList: (params: PaginationParams = {}) => {
    const { page = 1, limit = 10 } = params;
    return tsWorkerAxios.get<PaginatedResponse<PublishedData>>(
      `/api/content?page=${page}&limit=${limit}`
    ) as unknown as Promise<PaginatedResponse<PublishedData>>;
  },

  syncPublished: (data: PublishedData) => 
    tsWorkerAxios.post<ApiResponse>('/api/content/published', data),
  
  syncMetrics: (data: ContentMetrics) => 
    tsWorkerAxios.post<ApiResponse>('/api/content/metrics', data),
};
