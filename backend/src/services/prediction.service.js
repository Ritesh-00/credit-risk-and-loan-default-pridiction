import { Prediction } from '../models/prediction.model.js';
import { predictRisk, predictBatchRisk } from './ml.service.js';
import { checkDbConnection } from '../config/db.js';
import { RISK_THRESHOLDS } from '../constants/riskLevels.js';

// In-memory fallback store if MongoDB is offline
const memoryStore = [];

/**
 * Run single credit risk assessment and persist audit record to database
 */
export const createPredictionRecord = async ({
  userId = null,
  applicantName,
  applicantData,
  threshold = RISK_THRESHOLDS.OPTIMAL_DEFAULT,
  notes = '',
}) => {
  const mlResult = await predictRisk(applicantData, threshold);

  const isValidObjectId = userId && typeof userId === 'string' && userId.match(/^[0-9a-fA-F]{24}$/);

  const payload = {
    userId: isValidObjectId ? userId : null,
    applicantName: applicantName || 'Applicant-' + Math.floor(100000 + Math.random() * 900000),
    applicantData,
    prediction: mlResult.prediction,
    probability: mlResult.probability,
    riskScore: mlResult.riskScore,
    riskLevel: mlResult.riskLevel,
    decision: mlResult.decision,
    thresholdUsed: mlResult.thresholdUsed,
    modelVersion: mlResult.modelVersion,
    isMock: mlResult.isMock,
    explanation: mlResult.explanation,
    keyMetrics: mlResult.keyMetrics,
    notes,
  };

  if (checkDbConnection()) {
    try {
      const record = await Prediction.create(payload);
      return record.toJSON();
    } catch (err) {
      console.warn('[MongoDB Save Warning]', err.message);
    }
  }

  const memoryRecord = { id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5), ...payload, createdAt: new Date().toISOString() };
  memoryStore.unshift(memoryRecord);
  return memoryRecord;
};

/**
 * Batch assessment and database storage
 */
export const createBatchPredictions = async ({
  userId = null,
  applicants,
  threshold = RISK_THRESHOLDS.OPTIMAL_DEFAULT,
}) => {
  const batchResult = await predictBatchRisk(applicants, threshold);
  const isValidObjectId = userId && typeof userId === 'string' && userId.match(/^[0-9a-fA-F]{24}$/);

  const docsToInsert = applicants.map((app, i) => {
    const res = batchResult.results[i];
    return {
      userId: isValidObjectId ? userId : null,
      applicantName: app.applicantName || app.NAME_APPLICANT || `Batch-Applicant-${i + 1}`,
      applicantData: app,
      prediction: res.prediction,
      probability: res.probability,
      riskScore: res.riskScore,
      riskLevel: res.riskLevel,
      decision: res.decision,
      thresholdUsed: res.thresholdUsed,
      modelVersion: res.modelVersion,
      isMock: res.isMock,
      explanation: res.explanation,
      keyMetrics: res.keyMetrics,
      notes: '',
    };
  });

  let savedRecords = [];
  if (checkDbConnection()) {
    try {
      const inserted = await Prediction.insertMany(docsToInsert);
      savedRecords = inserted.map((doc) => doc.toJSON());
    } catch (err) {
      console.warn('[MongoDB Batch Insert Warning]', err.message);
    }
  }

  if (savedRecords.length === 0) {
    savedRecords = docsToInsert.map((doc, i) => {
      const memRec = { id: 'batch_' + Date.now() + '_' + i, ...doc, createdAt: new Date().toISOString() };
      memoryStore.unshift(memRec);
      return memRec;
    });
  }

  return {
    ...batchResult,
    savedRecords,
  };
};

/**
 * Query historical assessments from DB with search, filtering, and pagination
 */
export const queryPredictions = async ({
  userId = null,
  page = 1,
  limit = 10,
  search = '',
  riskLevel = '',
  decision = '',
  sortBy = 'createdAt',
  order = 'desc',
}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  if (checkDbConnection()) {
    try {
      const query = {};
      if (userId && typeof userId === 'string' && userId.match(/^[0-9a-fA-F]{24}$/)) {
        query.userId = userId;
      }
      if (riskLevel) query.riskLevel = riskLevel.toUpperCase();
      if (decision) query.decision = decision.toUpperCase();
      if (search && search.trim() !== '') {
        const s = search.trim();
        const orConditions = [{ applicantName: { $regex: s, $options: 'i' } }];
        if (s.match(/^[0-9a-fA-F]{24}$/)) {
          orConditions.push({ _id: s });
        }
        query.$or = orConditions;
      }

      const sortOrder = order === 'asc' ? 1 : -1;
      const [records, total] = await Promise.all([
        Prediction.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(limitNum).lean(),
        Prediction.countDocuments(query),
      ]);

      return {
        predictions: records.map((p) => ({ ...p, id: p._id.toString() })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      };
    } catch (e) {
      console.warn('[DB Query Warning]', e.message);
    }
  }

  // Fallback to in-memory store if DB is offline
  let filtered = [...memoryStore];
  if (userId && typeof userId === 'string' && userId.match(/^[0-9a-fA-F]{24}$/)) {
    filtered = filtered.filter((p) => p.userId === userId);
  }
  if (riskLevel) {
    filtered = filtered.filter((p) => p.riskLevel?.toUpperCase() === riskLevel.toUpperCase());
  }
  if (decision) {
    filtered = filtered.filter((p) => p.decision?.toUpperCase() === decision.toUpperCase());
  }
  if (search && search.trim() !== '') {
    const s = search.trim().toLowerCase();
    filtered = filtered.filter((p) => p.applicantName?.toLowerCase().includes(s) || p.id?.toLowerCase().includes(s));
  }

  filtered.sort((a, b) => {
    if (order === 'asc') return a[sortBy] > b[sortBy] ? 1 : -1;
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });

  const paginated = filtered.slice(skip, skip + limitNum);

  return {
    predictions: paginated,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limitNum) || 1,
    },
  };
};

/**
 * Get prediction by ID
 */
export const getPredictionById = async (id, userId = null) => {
  if (checkDbConnection() && id && id.match(/^[0-9a-fA-F]{24}$/)) {
    const doc = await Prediction.findById(id);
    if (doc) return doc.toJSON();
  }
  const item = memoryStore.find((p) => p.id === id);
  return item || null;
};

/**
 * Delete prediction by ID
 */
export const deletePredictionRecord = async (id, userId = null) => {
  if (checkDbConnection() && id && id.match(/^[0-9a-fA-F]{24}$/)) {
    await Prediction.findByIdAndDelete(id);
  }
  const index = memoryStore.findIndex((p) => p.id === id);
  if (index !== -1) {
    memoryStore.splice(index, 1);
  }
  return { id, success: true };
};
