export interface JobStatus {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

export interface JobLog {
  id: string;
  jobName: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
  startTime: string;
  endTime?: string | null;
  metadata?: Record<string, unknown>;
}

export interface CleanupResult {
  status: string;
  threshold: string;
  deletedCounts: {
    runLogs: number;
    datasourceRuns: number;
    jobLogs: number;
    rawItems: number;
  };
}

export interface DatasourceLog {
  id: string;
  datasource: string;
  successCount: number;
  failCount: number;
  runtime: number; // in milliseconds
  timestamp: string;
}

export interface TrendKeyword {
  keyword: string;
  volume: number;
  source: string[];
}

export interface TrendHistory {
  keyword: string;
  statDate: string;
  occurrenceCount: number;
  uniqueItemCount: number;
}

export interface TopicCandidate {
  id: string;
  clusterId?: string;
  title: string;
  mainKeyword: string;
  intent?: string;
  keywords: string[];
  // Scores
  score: number;
  trendScore?: number;
  priorityScore?: number;
  difficultyScore?: number | null;
  searchVolume?: number;
  aiScore?: number;
  // Status
  status: 'generated' | 'approved' | 'rejected' | 'ignored' | 'drafting';
  // AI content
  aiSummary?: string;
  aiBrief?: string | null;
  aiReason?: string;
  // Timestamps
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateCandidatePayload {
  title?: string;
  priorityScore?: number;
  intent?: string;
  aiReason?: string;
}

export interface ClusterKeyword {
  keyword: string;
  occurrenceCount?: number;
  uniqueItemCount?: number;
  trendScore?: number;
}

export interface RawItem {
  id: string;
  title?: string;
  url?: string;
  source?: string;
  publishDate?: string;
  createdAt: string;
}

export interface ClusteringRequest {
  category?: string;
  keyword?: string;
  lookbackDays?: number;
  callbackUrl?: string;
}

export interface ClusteringProcess {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'processing' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'PROCESSING';
  startTime: string;
  endTime?: string | null;
  filter?: {
    keyword?: string;
    lookbackDays?: number;
  };
  resultSummary?: {
    message?: string;
    lookbackDays?: number;
    processedClusters?: number;
    evaluatedCandidates?: number;
    trendingKeywordsFound?: number;
    uniqueClustersAggregated?: number;
  };
  errorMessage?: string | null;
  category?: string;
  keyword?: string;
  resultsCount?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CandidateFilterParams extends PaginationParams {
  status?: string;
  search?: string;
  intent?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface SummaryStats {
  counts: {
    trends: number;
    candidates: number;
    clusters: number;
    totalItemsIngested: number;
  };
  queue: {
    nlpBacklog: number;
    pendingEvaluations: number;
    activeBackgroundJobs: number;
  };
  systemStatus: string;
  timestamp: string;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface IntentCount {
  intent: string;
  count: number;
}

export interface KeywordTrend {
  keyword: string;
  score: number;
  popularityScore?: number;
}

export interface SourcePerformance {
  source: string;
  totalRuns: number;
  avgSuccessRate: number;
  totalItems: number;
  reliabilityScore?: number;
}

export interface DataSource {
  id: number;
  name: string;
  type: string;
  baseUrl?: string;
  isActive?: boolean;
  enabled: boolean;
  reliabilityScore?: number;
  lastRun?: {
    id?: string;
    status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';
    startTime: string;
    itemsCreated?: number;
  };
}

export interface DataSourceRun {
  id: string;
  status: 'SUCCESS' | 'FAILED';
  itemsCreated: number;
  startTime: string;
  endTime?: string;
}

export interface RunLog {
  id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  createdAt?: string;
}

export interface SystemConfig {
  [key: string]: string;
}

export interface PublishedData {
  candidateId: string;
  url: string;
  title: string;
  publishDate: string;
}

export interface ContentMetrics {
  url: string;
  date: string;
  views?: number;
  conversions?: number;
}

export interface WorkerHealth {
  status: string;
  database: string;
  uptime: number;
  timezone: string;
}

export interface GrowthSummary {
  sourceId: number;
  source: {
    name: string;
  };
  _sum: {
    itemsCreated: number;
  };
  _count: {
    id: number;
  };
}

export interface GrowthMetricsData {
  summary: GrowthSummary[];
}
