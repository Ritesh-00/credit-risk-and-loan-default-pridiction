import mongoose from 'mongoose';
import { RISK_LEVELS } from '../constants/riskLevels.js';

const explanationFactorSchema = new mongoose.Schema(
  {
    feature: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed },
    contribution: { type: Number, default: 0 },
    impact: { type: String, default: '' },
  },
  { _id: false }
);

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
      index: true,
    },
    applicantName: {
      type: String,
      required: [true, 'Applicant name or identifier is required'],
      trim: true,
      index: true,
    },
    applicantData: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Applicant feature payload is required'],
    },
    prediction: {
      type: Number,
      enum: [0, 1], // 0: Non-default, 1: Default
      required: true,
    },
    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    riskLevel: {
      type: String,
      enum: Object.values(RISK_LEVELS),
      required: true,
      index: true,
    },
    modelVersion: {
      type: String,
      required: true,
      default: 'MOCK-0.0.1',
    },
    isMock: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    explanation: {
      type: [explanationFactorSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Format JSON response
predictionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

export const Prediction = mongoose.model('Prediction', predictionSchema);
