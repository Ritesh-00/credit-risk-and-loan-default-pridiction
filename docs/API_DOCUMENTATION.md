# Backend REST API Documentation (/api/v1)

All endpoints return a standardized JSON envelope:

### Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable message"
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
```

---

## 1. Authentication Endpoints

### Register
- **POST** `/api/v1/auth/register`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "organization": "Acme Credit Union"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "organization": "Acme Credit Union",
        "role": "analyst"
      },
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    },
    "message": "Registration successful"
  }
  ```

### Login
- **POST** `/api/v1/auth/login`
- **Auth Required**: No
- **Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response (200 OK)**: Returns `{ user, token }`.

### Get Current User
- **GET** `/api/v1/auth/me`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**: Returns `{ user }`.

### Logout
- **POST** `/api/v1/auth/logout`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**: Returns success confirmation.

---

## 2. Prediction Endpoints

### Create Prediction
- **POST** `/api/v1/predictions`
- **Auth Required**: Yes (`Bearer <token>`)
- **Body**:
  ```json
  {
    "applicant": {
      "person_age": 30,
      "person_income": 75000,
      "person_home_ownership": "OWN",
      "person_emp_length": 5,
      "loan_intent": "VENTURE",
      "loan_grade": "A",
      "loan_amnt": 10000,
      "loan_int_rate": 7.5,
      "loan_percent_income": 0.13,
      "cb_person_default_on_file": "N",
      "cb_person_cred_hist_length": 7
    },
    "applicantName": "John Smith",
    "notes": "First-time commercial loan request"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d0fe4f5311236168a109cb",
      "applicantName": "John Smith",
      "input": { ... },
      "prediction": 0,
      "riskLevel": "LOW",
      "probability": 0.18,
      "modelVersion": "MOCK-0.0.1",
      "isMock": true,
      "explanation": [ ... ],
      "notes": "First-time commercial loan request",
      "createdAt": "2026-09-20T12:30:00.000Z"
    }
  }
  ```

### List Prediction History
- **GET** `/api/v1/predictions`
- **Auth Required**: Yes (`Bearer <token>`)
- **Query Params**:
  - `page` (default: 1)
  - `limit` (default: 10)
  - `search` (searches applicant name or ID)
  - `riskLevel` (`LOW`, `MEDIUM`, `HIGH`)
  - `sortBy` (default: `createdAt`)
  - `order` (`desc` or `asc`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "predictions": [ ... ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 42,
        "totalPages": 5
      }
    }
  }
  ```

### Get Single Prediction Details
- **GET** `/api/v1/predictions/:id`
- **Auth Required**: Yes (`Bearer <token>`)

### Delete Prediction Record
- **DELETE** `/api/v1/predictions/:id`
- **Auth Required**: Yes (`Bearer <token>`)

---

## 3. Dashboard Endpoints

### Get Dashboard Metrics
- **GET** `/api/v1/dashboard/summary`
- **Auth Required**: Yes (`Bearer <token>`)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "totalPredictions": 128,
      "lowRiskCount": 92,
      "mediumRiskCount": 24,
      "highRiskCount": 12,
      "avgDefaultProbability": 0.28,
      "mockPredictionsCount": 128,
      "recentPredictions": [ ... ],
      "riskDistribution": [
        { "riskLevel": "LOW", "count": 92, "percentage": 71.9 },
        { "riskLevel": "MEDIUM", "count": 24, "percentage": 18.75 },
        { "riskLevel": "HIGH", "count": 12, "percentage": 9.38 }
      ]
    }
  }
  ```

---

## 4. Model Info Endpoints

### Get Model Metadata & Metrics Status
- **GET** `/api/v1/model`
- **Auth Required**: Optional / Public
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "name": "Credit Risk & Loan Default Classifier",
      "version": "NOT_AVAILABLE",
      "status": "NOT_TRAINED",
      "rocAuc": null,
      "prAuc": null,
      "f1": null,
      "features": [],
      "lastUpdated": null
    }
  }
  ```

---

## 5. Health Check Endpoint

### System Health
- **GET** `/api/v1/health`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "status": "UP",
      "timestamp": "2026-09-20T12:00:00.000Z",
      "uptime": 3600,
      "database": "connected",
      "mlServiceMode": "mock"
    }
  }
  ```
