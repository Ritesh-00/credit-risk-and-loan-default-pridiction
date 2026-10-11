import { Prediction } from '../models/prediction.model.js';
import { checkDbConnection } from '../config/db.js';
import { RISK_LEVELS } from '../constants/riskLevels.js';
import { queryPredictions } from './prediction.service.js';

export const getDashboardSummary = async (userId = null) => {
  if (checkDbConnection()) {
    try {
      const matchQuery = userId && userId.match(/^[0-9a-fA-F]{24}$/) ? { userId } : {};

      const [total, lowRiskCount, mediumRiskCount, highRiskCount, mockCount, recentPredictions, avgResult] =
        await Promise.all([
          Prediction.countDocuments(matchQuery),
          Prediction.countDocuments({ ...matchQuery, riskLevel: RISK_LEVELS.LOW }),
          Prediction.countDocuments({ ...matchQuery, riskLevel: RISK_LEVELS.MEDIUM }),
          Prediction.countDocuments({ ...matchQuery, riskLevel: RISK_LEVELS.HIGH }),
          Prediction.countDocuments({ ...matchQuery, isMock: true }),
          Prediction.find(matchQuery).sort({ createdAt: -1 }).limit(5).lean(),
          Prediction.aggregate([
            ...(Object.keys(matchQuery).length > 0 ? [{ $match: matchQuery }] : []),
            { $group: { _id: null, avgProb: { $avg: '$probability' } } },
          ]),
        ]);

      const avgProbability = avgResult.length > 0 && avgResult[0].avgProb !== null ? parseFloat(avgResult[0].avgProb.toFixed(4)) : 0;
      const riskDistribution = [
        {
          riskLevel: RISK_LEVELS.LOW,
          count: lowRiskCount,
          percentage: total > 0 ? parseFloat(((lowRiskCount / total) * 100).toFixed(1)) : 0,
        },
        {
          riskLevel: RISK_LEVELS.MEDIUM,
          count: mediumRiskCount,
          percentage: total > 0 ? parseFloat(((mediumRiskCount / total) * 100).toFixed(1)) : 0,
        },
        {
          riskLevel: RISK_LEVELS.HIGH,
          count: highRiskCount,
          percentage: total > 0 ? parseFloat(((highRiskCount / total) * 100).toFixed(1)) : 0,
        },
      ];

      return {
        totalPredictions: total,
        lowRiskCount,
        mediumRiskCount,
        highRiskCount,
        avgDefaultProbability: avgProbability,
        mockPredictionsCount: mockCount,
        realPredictionsCount: total - mockCount,
        recentPredictions: recentPredictions.map((p) => ({ ...p, id: p._id })),
        riskDistribution,
      };
    } catch (e) {
      console.warn('[Dashboard Summary DB Warning]', e.message);
    }
  }

  // Calculate from memory store (only if DB is not available)
  const { predictions } = await queryPredictions({ limit: 100, userId });
  const total = predictions.length;
  const lowRiskCount = predictions.filter((p) => p.riskLevel === RISK_LEVELS.LOW).length;
  const mediumRiskCount = predictions.filter((p) => p.riskLevel === RISK_LEVELS.MEDIUM).length;
  const highRiskCount = predictions.filter((p) => p.riskLevel === RISK_LEVELS.HIGH).length;
  const avgProb = total > 0 ? predictions.reduce((a, b) => a + (b.probability || 0), 0) / total : 0;

  return {
    totalPredictions: total,
    lowRiskCount,
    mediumRiskCount,
    highRiskCount,
    avgDefaultProbability: parseFloat(avgProb.toFixed(4)),
    mockPredictionsCount: 0,
    realPredictionsCount: total,
    recentPredictions: predictions.slice(0, 5),
    riskDistribution: [
      { riskLevel: RISK_LEVELS.LOW, count: lowRiskCount, percentage: total > 0 ? parseFloat(((lowRiskCount / total) * 100).toFixed(1)) : 0 },
      { riskLevel: RISK_LEVELS.MEDIUM, count: mediumRiskCount, percentage: total > 0 ? parseFloat(((mediumRiskCount / total) * 100).toFixed(1)) : 0 },
      { riskLevel: RISK_LEVELS.HIGH, count: highRiskCount, percentage: total > 0 ? parseFloat(((highRiskCount / total) * 100).toFixed(1)) : 0 },
    ],
  };
};
