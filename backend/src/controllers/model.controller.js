import { getModelInfoService, simulateThresholdService } from '../services/model.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getModelInfo = async (req, res, next) => {
  try {
    const info = await getModelInfoService();
    return ApiResponse.success(res, info, 'Model information retrieved');
  } catch (error) {
    next(error);
  }
};

export const simulateThreshold = async (req, res, next) => {
  try {
    const { threshold } = req.body;
    const result = await simulateThresholdService(threshold || 0.05);
    return ApiResponse.success(res, result, 'Threshold simulation completed');
  } catch (error) {
    next(error);
  }
};
