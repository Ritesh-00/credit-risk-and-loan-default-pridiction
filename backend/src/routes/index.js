import { Router } from 'express';
import authRoutes from './auth.routes.js';
import predictionRoutes from './prediction.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import modelRoutes from './model.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/predictions', predictionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/model', modelRoutes);
router.use('/health', healthRoutes);

export default router;
