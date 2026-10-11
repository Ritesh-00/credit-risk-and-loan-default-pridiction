# Machine Learning Service Integration Contract

## 1. Overview
This document defines the strict API integration contract between the **Node.js/Express Backend** and the **Python/FastAPI ML Microservice**.

The Node.js backend communicates with the ML Service solely via HTTP requests through `src/services/ml.service.js`.

---

## 2. Modes of Operation

The backend switches between Mock mode and Real ML service mode via the `ML_SERVICE_MODE` environment variable:

- **`ML_SERVICE_MODE=mock` (Development Mode)**:
  - Bypasses external HTTP calls.
  - Returns deterministic development data with `isMock: true` and `modelVersion: "MOCK-0.0.1"`.
  - Frontend clearly displays a **"Demo Prediction"** badge.
- **`ML_SERVICE_MODE=http` (Production / Microservice Mode)**:
  - Sends requests to `ML_SERVICE_URL` (e.g. `http://localhost:8000/api/v1/predict`).
  - Expects `isMock: false` and the trained model version (e.g. `1.0.0`).
  - **Failure Handling**: If the FastAPI service is unreachable or errors out, the Node.js backend returns HTTP `503 Service Unavailable` with error code `ML_SERVICE_UNAVAILABLE`. It does **not** fall back to mock data.

---

## 3. Endpoints Specification

### 3.1 Predict Endpoint

- **Route**: `POST /api/v1/predict`
- **Headers**:
  ```http
  Content-Type: application/json
  Accept: application/json
  ```

#### Request Payload
The request payload carries key-value pairs representing applicant features. The exact feature keys will be provided once the Google Colab pipeline is finalized.

```json
{
  "person_age": 32,
  "person_income": 65000,
  "person_home_ownership": "RENT",
  "person_emp_length": 4.5,
  "loan_intent": "DEBTCONSOLIDATION",
  "loan_grade": "B",
  "loan_amnt": 15000,
  "loan_int_rate": 11.25,
  "loan_percent_income": 0.23,
  "cb_person_default_on_file": "N",
  "cb_person_cred_hist_length": 6
}
```

#### Successful Response (HTTP 200)
```json
{
  "prediction": 0,
  "probability": 0.24,
  "riskLevel": "LOW",
  "modelVersion": "1.0.0",
  "isMock": false,
  "explanation": [
    {
      "feature": "loan_percent_income",
      "value": 0.23,
      "contribution": -0.15,
      "impact": "Decreases default risk"
    },
    {
      "feature": "cb_person_default_on_file",
      "value": "N",
      "contribution": -0.22,
      "impact": "Decreases default risk"
    },
    {
      "feature": "loan_int_rate",
      "value": 11.25,
      "contribution": 0.08,
      "impact": "Increases default risk"
    }
  ]
}
```

#### Risk Level Tiers
- `LOW`: Default Probability < 0.35
- `MEDIUM`: Default Probability between 0.35 and 0.65
- `HIGH`: Default Probability >= 0.65

---

### 3.2 Model Metadata Endpoint

- **Route**: `GET /api/v1/model-info`
- **Headers**: `Accept: application/json`

#### Response When Untrained / In Progress (HTTP 200)
```json
{
  "name": "Credit Risk & Loan Default Classifier",
  "version": "NOT_AVAILABLE",
  "status": "NOT_TRAINED",
  "rocAuc": null,
  "prAuc": null,
  "accuracy": null,
  "precision": null,
  "recall": null,
  "f1": null,
  "featuresCount": 0,
  "features": [],
  "algorithm": "Pending Colab Training",
  "lastUpdated": null
}
```

#### Response When Trained (Future State)
```json
{
  "name": "Credit Risk & Loan Default Classifier",
  "version": "1.0.0",
  "status": "TRAINED",
  "rocAuc": 0.914,
  "prAuc": 0.882,
  "accuracy": 0.895,
  "precision": 0.871,
  "recall": 0.843,
  "f1": 0.857,
  "featuresCount": 11,
  "features": [
    "person_age", "person_income", "person_home_ownership", "person_emp_length",
    "loan_intent", "loan_grade", "loan_amnt", "loan_int_rate",
    "loan_percent_income", "cb_person_default_on_file", "cb_person_cred_hist_length"
  ],
  "algorithm": "XGBoost Classifier with Optuna Tuning",
  "lastUpdated": "2026-09-20T12:00:00.000Z"
}
```

---

### 3.3 Health Endpoint
- **Route**: `GET /health`
- **Response**:
```json
{
  "status": "healthy",
  "service": "credit-risk-ml-service",
  "version": "1.0.0"
}
```

---

## 4. Google Colab Export Instructions
1. Train the model and preprocessing pipeline in Google Colab.
2. Save the fitted pipeline artifact:
   ```python
   import joblib
   joblib.dump(pipeline, "credit_risk_pipeline.joblib")
   ```
3. Copy the artifact into `ml-service/app/models/credit_risk_pipeline.joblib`.
4. Update `ml-service/app/schemas.py` and `ml-service/app/main.py` with feature transformations.
5. Set `ML_SERVICE_MODE=http` in `backend/.env`.
