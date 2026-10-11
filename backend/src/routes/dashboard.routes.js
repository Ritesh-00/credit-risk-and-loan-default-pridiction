import express from 'express';
import { getSummary } from '../controllers/dashboard.controller.js';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/summary', optionalAuthMiddleware, getSummary);

export default router;
