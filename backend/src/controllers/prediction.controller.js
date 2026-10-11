import {
  createPredictionRecord,
  createBatchPredictions,
  queryPredictions,
  getPredictionById,
  deletePredictionRecord,
} from '../services/prediction.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const createPrediction = async (req, res, next) => {
  try {
    const { applicantName, applicant, applicantData, threshold, notes } = req.body;
    const dataToAssess = applicantData || applicant;

    const prediction = await createPredictionRecord({
      userId: req.user?.id || null,
      applicantName,
      applicantData: dataToAssess,
      threshold: threshold !== undefined ? Number(threshold) : undefined,
      notes: notes || '',
    });

    return ApiResponse.created(res, prediction, 'Credit risk prediction completed');
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req, res, next) => {
  try {
    const { applicants, threshold } = req.body;
    if (!Array.isArray(applicants) || applicants.length === 0) {
      return res.status(400).json({ success: false, message: 'Applicants array is required' });
    }

    const batchResult = await createBatchPredictions({
      userId: req.user?.id || null,
      applicants,
      threshold: threshold !== undefined ? Number(threshold) : undefined,
    });

    return ApiResponse.success(res, batchResult, 'Batch credit risk assessment completed');
  } catch (error) {
    next(error);
  }
};

export const listPredictions = async (req, res, next) => {
  try {
    const { page, limit, search, riskLevel, decision, sortBy, order } = req.query;

    const data = await queryPredictions({
      userId: req.user?.id || null,
      page,
      limit,
      search,
      riskLevel,
      decision,
      sortBy,
      order,
    });

    return ApiResponse.success(res, data, 'Predictions retrieved');
  } catch (error) {
    next(error);
  }
};

export const getPrediction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prediction = await getPredictionById(id, req.user?.id || null);
    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Prediction not found' });
    }
    return ApiResponse.success(res, prediction, 'Prediction details retrieved');
  } catch (error) {
    next(error);
  }
};

export const deletePrediction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await deletePredictionRecord(id, req.user?.id || null);
    return ApiResponse.success(res, result, 'Prediction deleted successfully');
  } catch (error) {
    next(error);
  }
};
