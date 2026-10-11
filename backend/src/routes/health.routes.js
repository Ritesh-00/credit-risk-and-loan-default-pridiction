import { Router } from 'express';
import { getDbStatus } from '../config/db.js';
import { ENV } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

router.get('/', (req, res) => {
  return ApiResponse.success(res, {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    database: getDbStatus(),
    mlServiceMode: ENV.ML_SERVICE_MODE,
    version: '1.0.0',
  });
});

export default router;
