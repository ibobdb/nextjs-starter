import tsWorkerAxios from "../ts.worker.axios.config";
import { ApiResponse } from "@/types/response";
import { WorkerHealth } from "../types";

export const healthCheck = () => {
    return tsWorkerAxios.get<ApiResponse<WorkerHealth>>('/health') as unknown as Promise<ApiResponse<WorkerHealth>>;
}