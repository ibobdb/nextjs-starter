import tsWorkerAxios from "../ts.worker.axios.config";
import { PublishedData, ContentMetrics } from "../types";
import { ApiResponse } from "@/types/response";

export const contentApi = {
  syncPublished: (data: PublishedData) => 
    tsWorkerAxios.post<ApiResponse>('/api/content/published', data),
  
  syncMetrics: (data: ContentMetrics) => 
    tsWorkerAxios.post<ApiResponse>('/api/content/metrics', data),
};
