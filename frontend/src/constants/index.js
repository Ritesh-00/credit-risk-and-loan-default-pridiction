export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
export const ML_DIRECT_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000/api/v1';

export const OPTIMAL_THRESHOLD = 0.05;

export const TABS = {
  DASHBOARD: 'dashboard',
  SINGLE_ASSESSMENT: 'single_assessment',
  BATCH_EVALUATION: 'batch_evaluation',
  THRESHOLD_SIMULATOR: 'threshold_simulator',
  HISTORY: 'history',
  MODEL_GOVERNANCE: 'model_governance',
};

export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
};

export const DECISIONS = {
  APPROVED: 'APPROVED',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  REJECTED: 'REJECTED',
};

export const CONTRACT_TYPES = ['Cash loans', 'Revolving loans'];

export const GENDER_OPTIONS = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
  { value: 'XNA', label: 'Other / Unspecified' },
];

export const EDUCATION_TYPES = [
  'Secondary / secondary special',
  'Higher education',
  'Incomplete higher',
  'Lower secondary',
  'Academic degree',
];

export const INCOME_TYPES = [
  'Working',
  'Commercial associate',
  'State servant',
  'Pensioner',
  'Student',
  'Unemployed',
];

export const HOUSING_TYPES = [
  'House / apartment',
  'Rented apartment',
  'With parents',
  'Municipal apartment',
  'Office apartment',
  'Co-op apartment',
];

export const OCCUPATION_TYPES = [
  'Laborers',
  'Core staff',
  'Managers',
  'Drivers',
  'Sales staff',
  'High skill tech staff',
  'Medicine staff',
  'Accountants',
  'Security staff',
  'Cleaning staff',
  'Cooking staff',
  'Low-skill Laborers',
];

export const SAMPLE_PRESETS = [
  {
    id: 'prime_borrower',
    title: 'Low Risk Prime Applicant',
    subtitle: 'High income ($350k), Low DTI, Top Bureau Scores (0.75+)',
    badge: 'Approved (Risk: ~1.8%)',
    badgeType: 'low',
    data: {
      applicantName: 'Sarah Jenkins (Prime Account)',
      NAME_CONTRACT_TYPE: 'Cash loans',
      CODE_GENDER: 'F',
      FLAG_OWN_CAR: 'Y',
      FLAG_OWN_REALTY: 'Y',
      CNT_CHILDREN: 0,
      CNT_FAM_MEMBERS: 2,
      AMT_INCOME_TOTAL: 350000,
      AMT_CREDIT: 450000,
      AMT_ANNUITY: 24500,
      AMT_GOODS_PRICE: 400000,
      NAME_TYPE_SUITE: 'Unaccompanied',
      NAME_INCOME_TYPE: 'Commercial associate',
      NAME_EDUCATION_TYPE: 'Higher education',
      NAME_FAMILY_STATUS: 'Married',
      NAME_HOUSING_TYPE: 'House / apartment',
      DAYS_BIRTH: -15500, // ~42 years
      DAYS_EMPLOYED: -3400, // ~9.3 years
      OCCUPATION_TYPE: 'Managers',
      ORGANIZATION_TYPE: 'Bank',
      EXT_SOURCE_1: 0.76,
      EXT_SOURCE_2: 0.79,
      EXT_SOURCE_3: 0.81,
      OWN_CAR_AGE: 3,
      REGION_RATING_CLIENT: 1,
    }
  },
  {
    id: 'moderate_borrower',
    title: 'Moderate Risk (Standard Applicant)',
    subtitle: 'Middle income ($160k), Average loan-to-income, Median Bureau Scores',
    badge: 'Manual Review (Risk: ~4.9%)',
    badgeType: 'medium',
    data: {
      applicantName: 'David Miller (Standard)',
      NAME_CONTRACT_TYPE: 'Cash loans',
      CODE_GENDER: 'M',
      FLAG_OWN_CAR: 'N',
      FLAG_OWN_REALTY: 'Y',
      CNT_CHILDREN: 1,
      CNT_FAM_MEMBERS: 3,
      AMT_INCOME_TOTAL: 160000,
      AMT_CREDIT: 520000,
      AMT_ANNUITY: 26500,
      AMT_GOODS_PRICE: 460000,
      NAME_TYPE_SUITE: 'Family',
      NAME_INCOME_TYPE: 'Working',
      NAME_EDUCATION_TYPE: 'Secondary / secondary special',
      NAME_FAMILY_STATUS: 'Married',
      NAME_HOUSING_TYPE: 'House / apartment',
      DAYS_BIRTH: -13200, // ~36 years
      DAYS_EMPLOYED: -1250, // ~3.4 years
      OCCUPATION_TYPE: 'Core staff',
      ORGANIZATION_TYPE: 'Business Entity Type 3',
      EXT_SOURCE_1: 0.44,
      EXT_SOURCE_2: 0.49,
      EXT_SOURCE_3: 0.47,
      OWN_CAR_AGE: 0,
      REGION_RATING_CLIENT: 2,
    }
  },
  {
    id: 'subprime_borrower',
    title: 'High Risk (Subprime / Flagged Default)',
    subtitle: 'Low income ($80k), 8x Loan-to-Income, Low Bureau Ratings (0.15)',
    badge: 'Rejected / High Risk (Risk: ~22.4%)',
    badgeType: 'high',
    data: {
      applicantName: 'Robert Vance (High Risk)',
      NAME_CONTRACT_TYPE: 'Cash loans',
      CODE_GENDER: 'M',
      FLAG_OWN_CAR: 'N',
      FLAG_OWN_REALTY: 'N',
      CNT_CHILDREN: 2,
      CNT_FAM_MEMBERS: 4,
      AMT_INCOME_TOTAL: 80000,
      AMT_CREDIT: 640000,
      AMT_ANNUITY: 36000,
      AMT_GOODS_PRICE: 580000,
      NAME_TYPE_SUITE: 'Unaccompanied',
      NAME_INCOME_TYPE: 'Working',
      NAME_EDUCATION_TYPE: 'Lower secondary',
      NAME_FAMILY_STATUS: 'Single / not married',
      NAME_HOUSING_TYPE: 'Rented apartment',
      DAYS_BIRTH: -8400, // ~23 years
      DAYS_EMPLOYED: -140, // ~0.4 years
      OCCUPATION_TYPE: 'Low-skill Laborers',
      ORGANIZATION_TYPE: 'Construction',
      EXT_SOURCE_1: 0.12,
      EXT_SOURCE_2: 0.18,
      EXT_SOURCE_3: 0.15,
      OWN_CAR_AGE: 0,
      REGION_RATING_CLIENT: 3,
    }
  }
];
