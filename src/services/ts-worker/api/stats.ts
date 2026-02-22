import tsWorkerAxios from "../ts.worker.axios.config";
import { SummaryStats, CategoryCount, KeywordTrend, GrowthMetricsData, PaginationParams, PaginatedResponse } from "../types";
import { ApiResponse } from "@/types/response";

export const statsApi = {
  getGrowthMetrics: () => 
    tsWorkerAxios.get<ApiResponse<GrowthMetricsData>>('/api/stats/growth') as unknown as Promise<ApiResponse<GrowthMetricsData>>,

  getSummary: () =>
    tsWorkerAxios.get<ApiResponse<SummaryStats>>('/api/stats/summary') as unknown as Promise<ApiResponse<SummaryStats>>,

  getCategories: () =>
    tsWorkerAxios.get<ApiResponse<CategoryCount[]>>('/api/stats/categories') as unknown as Promise<ApiResponse<CategoryCount[]>>,

  getKeywords: (params: PaginationParams = {}) => {
    const { page = 1, limit = 50 } = params;
    return tsWorkerAxios.get<ApiResponse<PaginatedResponse<KeywordTrend>>>(
      `/api/stats/keywords?page=${page}&limit=${limit}`
    ) as unknown as Promise<ApiResponse<PaginatedResponse<KeywordTrend>>>;
  },
};
