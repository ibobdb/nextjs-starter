import 'dotenv/config';
import { topicsApi } from '../api/topics';
import { statsApi } from '../api/stats';
import { jobsApi } from '../api/jobs';

async function runQuickTests() {
  console.log('🚀 Starting Quick TS-Worker API Tests...');
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

  await runTest('Trends', () => topicsApi.getTrends(5));
  await runTest('Candidates', () => topicsApi.getCandidates());
  await runTest('Growth Metrics', () => statsApi.getGrowthMetrics());
  await runTest('Jobs Logs', () => jobsApi.getLogs());

  console.log('\n🏁 Quick Tests Completed.');
}

runQuickTests();
