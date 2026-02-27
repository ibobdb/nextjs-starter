import 'dotenv/config';
import { topicsApi } from '../api/topics';
import { statsApi } from '../api/stats';
import { jobsApi } from '../api/jobs';
import { dataSourcesApi } from '../api/datasources';

async function runQuickTests() {
  console.log('🚀 Starting Quick TS-Worker API Tests (v1.1.0)...');
  console.log(`📍 URL: ${process.env.TS_WORKER_URL}`);

  const runTest = async (name: string, fn: () => Promise<unknown>) => {
    console.log(`\n--- Testing ${name} ---`);
    try {
      const result = await fn();
      console.log(`✅ ${name} Success`);
      console.log(JSON.stringify(result, null, 2).substring(0, 500) + '...');
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string };
      console.error(`❌ ${name} Failed:`);
      if (err.status) {
        console.error(`Status: ${err.status}`);
        console.error(`Message: ${err.message}`);
      } else {
        console.error(err.message || err);
      }
    }
  };

  // ── Existing ─────────────────────────────────────────────────────────────
  await runTest('Trends', () => topicsApi.getTrends(5));
  await runTest('Candidates', () => topicsApi.getCandidates());
  await runTest('Growth Metrics', () => statsApi.getGrowthMetrics());
  await runTest('Jobs Logs', () => jobsApi.getLogs());

  // ── New endpoints (v1.1.0) ───────────────────────────────────────────────

  // Jobs
  await runTest('Jobs Cleanup (dry-run, 90 days)', () => jobsApi.cleanup(90));

  // Trends history — get the first keyword then fetch its history
  const trendsRes = await topicsApi.getTrends(1).catch(() => null);
  const firstKeyword = (trendsRes as { data?: Array<{ keyword: string }> })?.data?.[0]?.keyword;
  if (firstKeyword) {
    await runTest(`Trend History (${firstKeyword}, 7 days)`, () =>
      topicsApi.getTrendHistory(firstKeyword, 7)
    );
  } else {
    console.log('\n⚠️  Skipping Trend History — no keywords found');
  }

  // Candidates extras — get the first candidate ID then fetch cluster/raw-items
  const candidatesRes = await topicsApi.getCandidates({ limit: 1 }).catch(() => null);
  const firstCandidateId = (candidatesRes as { data?: Array<{ id: string }> })?.data?.[0]?.id;
  if (firstCandidateId) {
    await runTest(`Candidate Cluster (${firstCandidateId})`, () =>
      topicsApi.getCandidateCluster(firstCandidateId)
    );
    await runTest(`Candidate Raw Items (${firstCandidateId})`, () =>
      topicsApi.getCandidateRawItems(firstCandidateId)
    );
  } else {
    console.log('\n⚠️  Skipping Candidate Cluster & Raw Items — no candidates found');
  }

  // Stats
  await runTest('Stats: Sources Performance', () => statsApi.getSourcesPerformance());
  await runTest('Stats: Categories List', () => statsApi.getCategoriesList());

  // Datasource run logs — get the first datasource, then its first run
  const sourcesRes = await dataSourcesApi.listDataSources().catch(() => null);
  const firstSourceId = (sourcesRes as { data?: Array<{ id: number }> })?.data?.[0]?.id;
  if (firstSourceId) {
    const runsRes = await dataSourcesApi.getDataSourceRuns(String(firstSourceId), { limit: 1 }).catch(() => null);
    const firstRunId = (runsRes as { data?: Array<{ id: string }> })?.data?.[0]?.id;
    if (firstRunId) {
      await runTest(`Datasource Run Logs (run ${firstRunId})`, () =>
        dataSourcesApi.getRunLogs(firstRunId)
      );
    } else {
      console.log('\n⚠️  Skipping Run Logs — no runs found for first datasource');
    }
  } else {
    console.log('\n⚠️  Skipping Run Logs — no datasources found');
  }

  console.log('\n🏁 Quick Tests Completed.');
}

runQuickTests();
