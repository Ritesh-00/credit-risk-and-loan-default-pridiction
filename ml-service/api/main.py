import os
import sys
from fastapi import FastAPI, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import pandas as pd
import io

# Add parent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from src.schemas.prediction_schema import (
    ApplicantFeatures,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    ThresholdSimulationRequest,
    ThresholdSimulationResponse
)
from src.services.predictor import predictor_service

app = FastAPI(
    title="Credit Risk & Loan Default Prediction ML Service",
    description="Production CatBoost Inference Engine with Precision-Recall Thresholding (0.05) and Risk Explainability",
    version="1.0.0"
)

# Enable CORS for frontend and backend microservices
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health", tags=["Health"])
def health_check():
    return {
        "status": "HEALTHY",
        "service": "credit-risk-ml-service",
        "is_model_loaded": predictor_service.is_model_loaded(),
        "version": "1.0.0"
    }


@app.get("/api/v1/model-info", tags=["Governance"])
def get_model_info():
    return predictor_service.get_metadata()


@app.post("/api/v1/predict", response_model=PredictionResponse, tags=["Inference"])
def predict_single(applicant: ApplicantFeatures, threshold: float = 0.05):
    try:
        data = applicant.dict()
        result = predictor_service.predict_single(data, custom_threshold=threshold)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )


@app.post("/api/v1/predict-batch", response_model=BatchPredictionResponse, tags=["Inference"])
def predict_batch(request: BatchPredictionRequest, threshold: float = 0.05):
    try:
        result = predictor_service.predict_batch(request.applicants, custom_threshold=threshold)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Batch inference error: {str(e)}"
        )


@app.post("/api/v1/predict-csv", response_model=BatchPredictionResponse, tags=["Inference"])
async def predict_csv(file: UploadFile = File(...), threshold: float = 0.05):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        records = df.to_dict(orient="records")
        result = predictor_service.predict_batch(records, custom_threshold=threshold)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV processing failed: {str(e)}"
        )


@app.post("/api/v1/simulate-threshold", response_model=ThresholdSimulationResponse, tags=["Simulation"])
def simulate_threshold(request: ThresholdSimulationRequest):
    return predictor_service.simulate_threshold(request.threshold)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
