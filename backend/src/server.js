import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  const server = app.listen(ENV.PORT, () => {
    console.log(`====================================================`);
    console.log(` Credit Risk AI Backend Service`);
    console.log(` Port: ${ENV.PORT}`);
    console.log(` Environment: ${ENV.NODE_ENV}`);
    console.log(` ML Service Mode: ${ENV.ML_SERVICE_MODE}`);
    console.log(` API Endpoint: http://localhost:${ENV.PORT}/api/v1`);
    console.log(` Health Check: http://localhost:${ENV.PORT}/api/v1/health`);
    console.log(`====================================================`);
  });

  const shutdown = () => {
    console.log('\n[Server] Gracefully shutting down...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
};

startServer().catch((err) => {
  console.error('[Server Error] Fatal startup failure:', err);
  process.exit(1);
});
