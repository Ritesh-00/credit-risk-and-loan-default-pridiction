import express from 'express';
import { getModelInfo, simulateThreshold } from '../controllers/model.controller.js';

const router = express.Router();

router.get('/info', getModelInfo);
router.post('/simulate-threshold', simulateThreshold);

export default router;
