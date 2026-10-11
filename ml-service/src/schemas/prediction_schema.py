from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field


class ApplicantFeatures(BaseModel):
    # Demographics & Contract
    NAME_CONTRACT_TYPE: Optional[str] = Field(default="Cash loans", description="Cash loans or Revolving loans")
    CODE_GENDER: Optional[str] = Field(default="M", description="Gender (M/F/XNA)")
    FLAG_OWN_CAR: Optional[str] = Field(default="N", description="Car ownership (Y/N)")
    FLAG_OWN_REALTY: Optional[str] = Field(default="Y", description="Real estate ownership (Y/N)")
    CNT_CHILDREN: Optional[int] = Field(default=0, description="Number of children")
    CNT_FAM_MEMBERS: Optional[float] = Field(default=1.0, description="Family members count")
    
    # Income & Credit Details
    AMT_INCOME_TOTAL: Optional[float] = Field(default=180000.0, description="Total annual income")
    AMT_CREDIT: Optional[float] = Field(default=450000.0, description="Loan credit amount")
    AMT_ANNUITY: Optional[float] = Field(default=25000.0, description="Loan annuity payment")
    AMT_GOODS_PRICE: Optional[float] = Field(default=400000.0, description="Goods price for consumer loans")
    
    # Social & Employment Background
    NAME_TYPE_SUITE: Optional[str] = Field(default="Unaccompanied", description="Accompanying person on application")
    NAME_INCOME_TYPE: Optional[str] = Field(default="Working", description="Income source type")
    NAME_EDUCATION_TYPE: Optional[str] = Field(default="Secondary / secondary special", description="Education level")
    NAME_FAMILY_STATUS: Optional[str] = Field(default="Married", description="Marital status")
    NAME_HOUSING_TYPE: Optional[str] = Field(default="House / apartment", description="Housing situation")
    
    # Timing & Employment
    DAYS_BIRTH: Optional[int] = Field(default=-14000, description="Age in negative days from application")
    DAYS_EMPLOYED: Optional[float] = Field(default=-1800.0, description="Employment length in negative days")
    DAYS_REGISTRATION: Optional[float] = Field(default=-3000.0, description="Registration change in days")
    DAYS_ID_PUBLISH: Optional[int] = Field(default=-2000, description="ID publish date in negative days")
    OWN_CAR_AGE: Optional[float] = Field(default=None, description="Age of client's car in years")
    
    # Contact & Flags
    FLAG_MOBIL: Optional[int] = Field(default=1)
    FLAG_EMP_PHONE: Optional[int] = Field(default=1)
    FLAG_WORK_PHONE: Optional[int] = Field(default=0)
    FLAG_PHONE: Optional[int] = Field(default=0)
    OCCUPATION_TYPE: Optional[str] = Field(default="Laborers")
    ORGANIZATION_TYPE: Optional[str] = Field(default="Business Entity Type 3")
    
    # External Bureau Normalized Scores
    EXT_SOURCE_1: Optional[float] = Field(default=None, description="External bureau score 1 (0 to 1)")
    EXT_SOURCE_2: Optional[float] = Field(default=0.45, description="External bureau score 2 (0 to 1)")
    EXT_SOURCE_3: Optional[float] = Field(default=0.45, description="External bureau score 3 (0 to 1)")
    
    # Ratings & Regional Info
    REGION_RATING_CLIENT: Optional[int] = Field(default=2)
    REGION_RATING_CLIENT_W_CITY: Optional[int] = Field(default=2)
    WEEKDAY_APPR_PROCESS_START: Optional[str] = Field(default="MONDAY")
    HOUR_APPR_PROCESS_START: Optional[int] = Field(default=10)
    REG_CITY_NOT_LIVE_CITY: Optional[int] = Field(default=0)
    REG_CITY_NOT_WORK_CITY: Optional[int] = Field(default=0)
    LIVE_CITY_NOT_WORK_CITY: Optional[int] = Field(default=0)

    class Config:
        extra = "allow"


class FeatureContribution(BaseModel):
    feature: str
    value: Any
    contribution: float
    impact: str
    direction: str  # "RISK_INCREASER" or "RISK_REDUCER"


class PredictionResponse(BaseModel):
    prediction: int = Field(description="1 for High Risk/Default, 0 for Low Risk/Approved")
    probability: float = Field(description="Calibrated probability of default (0.0 to 1.0)")
    riskScore: int = Field(description="Standardized Risk Score (0 - 1000 scale)")
    riskLevel: str = Field(description="LOW, MEDIUM, or HIGH")
    decision: str = Field(description="APPROVED, MANUAL_REVIEW, or REJECTED")
    thresholdUsed: float = Field(description="Optimal decision threshold (0.05)")
    modelVersion: str = Field(default="1.0.0")
    isMock: bool = Field(default=False)
    explanation: List[FeatureContribution] = Field(default_factory=list)
    keyMetrics: Dict[str, Any] = Field(default_factory=dict)


class BatchPredictionRequest(BaseModel):
    applicants: List[Dict[str, Any]]


class BatchPredictionResponse(BaseModel):
    totalProcessed: int
    approvedCount: int
    reviewCount: int
    rejectedCount: int
    averageProbability: float
    results: List[PredictionResponse]


class ThresholdSimulationRequest(BaseModel):
    threshold: float = Field(default=0.05, ge=0.01, le=0.99)


class ThresholdSimulationResponse(BaseModel):
    threshold: float
    estimatedApprovalRate: float
    estimatedDefaultRateAmongApproved: float
    recall: float
    precision: float
    f1Score: float
    f2Score: float
    businessRecommendation: str
