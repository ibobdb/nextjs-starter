import tsWorkerAxios from "../ts.worker.axios.config";
import { ArticleDraft, PaginationParams, PaginatedResponse } from "../types";
import { ApiResponse } from "@/types/response";

export interface DraftFilterParams extends PaginationParams {
  status?: string;
}

export const draftsApi = {
  // ── Draft Management ────────────────────────────────────────────────────────

  getDrafts: (params: DraftFilterParams = {}) => {
    const { page = 1, limit = 10, status } = params;
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status ? { status } : {}),
    });
    return tsWorkerAxios.get<PaginatedResponse<ArticleDraft>>(
      `/api/drafts?${query.toString()}`
    ) as unknown as Promise<PaginatedResponse<ArticleDraft>>;
  },

  getDraft: (id: string) =>
    tsWorkerAxios.get<ApiResponse<ArticleDraft>>(`/api/drafts/${id}`) as unknown as Promise<ApiResponse<ArticleDraft>>,

  publishDraft: (id: string) =>
    tsWorkerAxios.post<ApiResponse>(`/api/drafts/${id}/publish`) as unknown as Promise<ApiResponse>,

  deleteDraft: (id: string) =>
    tsWorkerAxios.delete<ApiResponse>(`/api/drafts/${id}`) as unknown as Promise<ApiResponse>,

  // ── SEO Audit ──────────────────────────────────────────────────────────────

  runSeoAudit: (id: string) =>
    tsWorkerAxios.post<ApiResponse<ArticleDraft>>(`/api/drafts/${id}/seo-audit`) as unknown as Promise<ApiResponse<ArticleDraft>>,
};
