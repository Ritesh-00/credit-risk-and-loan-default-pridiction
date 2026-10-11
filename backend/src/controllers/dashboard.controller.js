import { getDashboardSummary } from '../services/dashboard.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getSummary = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(req.user?.id || null);
    return ApiResponse.success(res, summary, 'Dashboard summary retrieved');
  } catch (error) {
    next(error);
  }
};
