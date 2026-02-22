import 'dotenv/config';
import { healthCheck } from '../api/health-check';

async function runTest() {
  console.log('🚀 Starting Health Check Test...');
  console.log(`📍 URL: ${process.env.TS_WORKER_URL || 'http://localhost:4000'}`);
  
  try {
    const response = await healthCheck();
    console.log('✅ Health Check Success:');
    console.log(JSON.stringify(response, null, 2));
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string; error?: unknown };
    console.error('❌ Health Check Failed:');
    if (err.status) {
      // This is our standardized ApiResponse
      console.error(`Status: ${err.status}`);
      console.error(`Message: ${err.message}`);
      console.error('Error Details:', err.error);
    } else {
      // This might be a unexpected throw
      console.error(err);
    }
    process.exit(1);
  }
}

runTest();
