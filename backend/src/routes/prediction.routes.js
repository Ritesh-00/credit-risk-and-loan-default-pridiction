import express from 'express';
import {
  createPrediction,
  createBatch,
  listPredictions,
  getPrediction,
  deletePrediction,
} from '../controllers/prediction.controller.js';
import { optionalAuthMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', optionalAuthMiddleware, createPrediction);
router.post('/batch', optionalAuthMiddleware, createBatch);
router.get('/', optionalAuthMiddleware, listPredictions);
router.get('/:id', optionalAuthMiddleware, getPrediction);
router.delete('/:id', optionalAuthMiddleware, deletePrediction);

export default router;
