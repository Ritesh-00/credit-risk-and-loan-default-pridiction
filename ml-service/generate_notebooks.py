import json
import os

def make_cell(cell_type, src):
    return {
        "cell_type": cell_type,
        "metadata": {},
        "source": [line + "\n" for line in src.strip().split("\n")] if isinstance(src, str) else src,
        **({"execution_count": None, "outputs": []} if cell_type == "code" else {})
    }

def save_notebook(filepath, cells):
    nb = {
        "cells": cells,
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.10"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Saved: {filepath}")

# 1. 01_data_exploration_and_eda.ipynb
nb1_cells = [
    make_cell("markdown", "# 📊 Credit Risk & Loan Default Prediction: 01 - Exploratory Data Analysis (EDA)\n\n### Objective:\nPerform comprehensive exploratory data analysis on the Home Credit Default Risk application dataset. Analyze class imbalance, distributions, missing values, and key financial ratios correlated with default risk."),
    make_cell("code", """import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

pd.set_option('display.max_columns', 100)
pd.set_option('display.max_rows', 100)
%matplotlib inline"""),
    make_cell("markdown", "## 1. Load Raw Application Data"),
    make_cell("code", """df = pd.read_csv('../data/raw/application_train.csv')
print(f'Application Dataset Shape: {df.shape}')
df.head()"""),
    make_cell("markdown", "## 2. Target Distribution & Class Imbalance\nIn credit lending, defaults (positive class `1`) are typically rare (~8% of total loans). Addressing this imbalance is key for evaluation and thresholding."),
    make_cell("code", """target_counts = df['TARGET'].value_counts()
target_perc = df['TARGET'].value_counts(normalize=True) * 100

print(pd.DataFrame({'Count': target_counts, 'Percentage (%)': target_perc.round(2)}))

plt.figure(figsize=(6, 4))
sns.countplot(data=df, x='TARGET', palette=['#2563eb', '#dc2626'])
plt.title('Target Distribution (0 = Repaid, 1 = Default)')
plt.xlabel('Loan Default Status')
plt.ylabel('Count')
plt.show()"""),
    make_cell("markdown", "## 3. Missing Value Profiling"),
    make_cell("code", """missing = pd.DataFrame({
    'total_missing': df.isnull().sum(),
    'perc_missing': (df.isnull().sum() / len(df)) * 100,
    'data_type': df.dtypes
})
missing_cols = missing[missing['perc_missing'] > 0].sort_values(by='perc_missing', ascending=False)
print(f'Columns with missing values: {len(missing_cols)}')
missing_cols.head(25)"""),
    make_cell("markdown", "## 4. Key Financial & Demographic Features"),
    make_cell("code", """fig, axes = plt.subplots(2, 2, figsize=(14, 10))

# Credit Amount
sns.histplot(df['AMT_CREDIT'], bins=40, kde=True, ax=axes[0, 0], color='#2563eb')
axes[0, 0].set_title('Loan Credit Amount Distribution')

# Income (Capped at 99th percentile for clean visualization)
income_capped = df['AMT_INCOME_TOTAL'].clip(upper=df['AMT_INCOME_TOTAL'].quantile(0.99))
sns.histplot(income_capped, bins=40, kde=True, ax=axes[0, 1], color='#059669')
axes[0, 1].set_title('Income Distribution (99th Percentile Capped)')

# Contract Type vs Default
sns.countplot(data=df, x='NAME_CONTRACT_TYPE', hue='TARGET', ax=axes[1, 0], palette=['#2563eb', '#dc2626'])
axes[1, 0].set_title('Contract Type vs Default')

# Education vs Default
sns.countplot(data=df, y='NAME_EDUCATION_TYPE', hue='TARGET', ax=axes[1, 1], palette=['#2563eb', '#dc2626'])
axes[1, 1].set_title('Education Level vs Default')

plt.tight_layout()
plt.show()"""),
    make_cell("markdown", "## 5. External Credit Bureau Normalized Scores (`EXT_SOURCE_1/2/3`)"),
    make_cell("code", """ext_cols = ['EXT_SOURCE_1', 'EXT_SOURCE_2', 'EXT_SOURCE_3', 'TARGET']
corr = df[ext_cols].corr()

plt.figure(figsize=(6, 5))
sns.heatmap(corr, annot=True, cmap='Blues', fmt='.3f', cbar=True)
plt.title('Correlation of External Sources with Target')
plt.show()""")
]

# 2. 02_feature_engineering_and_preprocessing.ipynb
nb2_cells = [
    make_cell("markdown", "# ⚙️ Credit Risk & Loan Default Prediction: 02 - Feature Engineering & Preprocessing\n\n### Objective:\nConstruct robust custom transformers for missing value indicators, financial ratios (Credit/Income, Annuity/Income, Goods/Income), age & employment anomaly transformations, and column pruning."),
    make_cell("code", """import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.base import BaseEstimator, TransformerMixin

pd.set_option('display.max_columns', 100)"""),
    make_cell("markdown", "## 1. Train-Test Split (Stratified)"),
    make_cell("code", """df = pd.read_csv('../data/raw/application_train.csv')
X = df.drop(columns='TARGET')
y = df['TARGET']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f'X_train shape: {X_train.shape}, X_test shape: {X_test.shape}')"""),
    make_cell("markdown", "## 2. Identify Categorical & Numeric Categorical Features"),
    make_cell("code", """numeric_cols = X_train.select_dtypes(include='number')
categorical_numeric = numeric_cols.columns[numeric_cols.nunique() < 63].tolist()

cols_to_remove = [
    'TARGET', 'CNT_CHILDREN', 'CNT_FAM_MEMBERS', 'HOUR_APPR_PROCESS_START',
    'ELEVATORS_MODE', 'ENTRANCES_MODE', 'FLOORSMAX_MODE', 'FLOORSMIN_MODE',
    'ELEVATORS_MEDI', 'ENTRANCES_MEDI', 'FLOORSMAX_MEDI', 'FLOORSMIN_MEDI',
    'OBS_30_CNT_SOCIAL_CIRCLE', 'DEF_30_CNT_SOCIAL_CIRCLE',
    'OBS_60_CNT_SOCIAL_CIRCLE', 'DEF_60_CNT_SOCIAL_CIRCLE', 'OWN_CAR_AGE'
]

categorical_numeric = [col for col in categorical_numeric if col not in cols_to_remove]
print(f'Categorical Numeric columns: {len(categorical_numeric)}')"""),
    make_cell("markdown", "## 3. High-Dimensional / Redundant Columns to Drop"),
    make_cell("code", """coltodrop = [
    'SK_ID_CURR', 'FLAG_CONT_MOBILE', 'FLAG_EMAIL', 'REG_REGION_NOT_LIVE_REGION',
    'REG_REGION_NOT_WORK_REGION', 'LIVE_REGION_NOT_WORK_REGION', 'YEARS_BEGINEXPLUATATION_AVG',
    'COMMONAREA_AVG', 'ENTRANCES_AVG', 'LANDAREA_AVG', 'NONLIVINGAPARTMENTS_AVG',
    'NONLIVINGAREA_AVG', 'BASEMENTAREA_MODE', 'YEARS_BEGINEXPLUATATION_MODE',
    'COMMONAREA_MODE', 'ENTRANCES_MODE', 'LANDAREA_MODE', 'NONLIVINGAPARTMENTS_MODE',
    'NONLIVINGAREA_MODE', 'YEARS_BEGINEXPLUATATION_MEDI', 'COMMONAREA_MEDI',
    'ENTRANCES_MEDI', 'LANDAREA_MEDI', 'NONLIVINGAPARTMENTS_MEDI', 'NONLIVINGAREA_MEDI',
    'OBS_30_CNT_SOCIAL_CIRCLE', 'OBS_60_CNT_SOCIAL_CIRCLE', 'FLAG_DOCUMENT_2',
    'FLAG_DOCUMENT_4', 'FLAG_DOCUMENT_5', 'FLAG_DOCUMENT_7', 'FLAG_DOCUMENT_8',
    'FLAG_DOCUMENT_9', 'FLAG_DOCUMENT_10', 'FLAG_DOCUMENT_11', 'FLAG_DOCUMENT_12',
    'FLAG_DOCUMENT_13', 'FLAG_DOCUMENT_14', 'FLAG_DOCUMENT_15', 'FLAG_DOCUMENT_16',
    'FLAG_DOCUMENT_17', 'FLAG_DOCUMENT_18', 'FLAG_DOCUMENT_19', 'FLAG_DOCUMENT_20',
    'FLAG_DOCUMENT_21', 'AMT_REQ_CREDIT_BUREAU_HOUR', 'AMT_REQ_CREDIT_BUREAU_DAY',
    'AMT_REQ_CREDIT_BUREAU_WEEK', 'AMT_REQ_CREDIT_BUREAU_MON', 'AMT_REQ_CREDIT_BUREAU_QRT',
    'AMT_REQ_CREDIT_BUREAU_YEAR'
]
print(f'Total columns designated to drop: {len(coltodrop)}')"""),
    make_cell("markdown", "## 4. Custom Feature Engineering Transformer"),
    make_cell("code", """class FeatureEngineer(BaseEstimator, TransformerMixin):
    def __init__(self, cols_to_drop=None, categorical_numeric=None):
        self.cols_to_drop = cols_to_drop or []
        self.categorical_numeric = categorical_numeric or []

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()

        # Row-level missingness indicators
        X['TOTAL_MISSING'] = X.isna().sum(axis=1)
        X['MISSING_RATIO'] = X.isna().mean(axis=1)

        # Categorical numeric encoding as strings
        for col in self.categorical_numeric:
            if col in X.columns:
                X[col] = X[col].apply(
                    lambda value: f'UNKNOWN_{col}' if pd.isna(value) else f'{col}_{value}'
                )

        # Age in Years
        if 'DAYS_BIRTH' in X.columns:
            X['AGE_YEARS'] = -X['DAYS_BIRTH'] / 365.25

        # Employment Anomaly & Years
        if 'DAYS_EMPLOYED' in X.columns:
            X['EMPLOYED_ANOMALY'] = (X['DAYS_EMPLOYED'] > 0).astype(int)
            X['EMPLOYED_YEARS'] = (
                X['DAYS_EMPLOYED'].where(X['DAYS_EMPLOYED'] <= 0) / -365.25
            )

        # Financial ratios
        if 'AMT_CREDIT' in X.columns and 'AMT_INCOME_TOTAL' in X.columns:
            X['CREDIT_INCOME_RATIO'] = X['AMT_CREDIT'] / X['AMT_INCOME_TOTAL'].replace(0, np.nan)
        if 'AMT_ANNUITY' in X.columns and 'AMT_INCOME_TOTAL' in X.columns:
            X['ANNUITY_INCOME_RATIO'] = X['AMT_ANNUITY'] / X['AMT_INCOME_TOTAL'].replace(0, np.nan)
        if 'AMT_GOODS_PRICE' in X.columns and 'AMT_INCOME_TOTAL' in X.columns:
            X['GOODS_INCOME_RATIO'] = X['AMT_GOODS_PRICE'] / X['AMT_INCOME_TOTAL'].replace(0, np.nan)
        if 'AMT_INCOME_TOTAL' in X.columns and 'CNT_FAM_MEMBERS' in X.columns:
            X['INCOME_PER_FAMILY_MEMBER'] = X['AMT_INCOME_TOTAL'] / X['CNT_FAM_MEMBERS'].replace(0, np.nan)

        # Car Age Missing
        if 'OWN_CAR_AGE' in X.columns:
            X['OWN_CAR_AGE_MISSING'] = X['OWN_CAR_AGE'].isna().astype(int)
            X['OWN_CAR_AGE'] = X['OWN_CAR_AGE'].fillna(0)

        # Drop selected columns
        X = X.drop(columns=self.cols_to_drop, errors='ignore')
        return X

fe = FeatureEngineer(cols_to_drop=coltodrop, categorical_numeric=categorical_numeric)
X_train_fe = fe.fit_transform(X_train)
print(f'Transformed shape: {X_train_fe.shape}')
X_train_fe.head(3)""")
]

# 3. 03_model_experimentation_and_benchmark.ipynb
nb3_cells = [
    make_cell("markdown", "# 🧪 Credit Risk & Loan Default Prediction: 03 - Model Experimentation & Benchmark\n\n### Objective:\nCompare multiple classification algorithms using Stratified K-Fold Cross-Validation, measuring ROC-AUC, PR-AUC (Average Precision), Recall, and F1 Score under severe class imbalance."),
    make_cell("code", """import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from lightgbm import LGBMClassifier
from catboost import CatBoostClassifier

import sys
sys.path.append('..')
from src.features.feature_engineering import FeatureEngineer, CatBoostPreprocessor"""),
    make_cell("markdown", "## 1. Load Data & Prepare Cross-Validation"),
    make_cell("code", """df = pd.read_csv('../data/raw/application_train.csv')
X = df.drop(columns='TARGET')
y = df['TARGET']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)

cv = StratifiedKFold(n_splits=4, shuffle=True, random_state=42)
scoring = {
    'roc_auc': 'roc_auc',
    'pr_auc': 'average_precision',
    'f1': 'f1',
    'recall': 'recall',
    'precision': 'precision'
}"""),
    make_cell("markdown", "## 2. Define Model Candidates"),
    make_cell("code", """models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, class_weight='balanced', random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=10, class_weight='balanced', random_state=42, n_jobs=-1),
    'LightGBM': LGBMClassifier(n_estimators=200, learning_rate=0.05, num_leaves=31, random_state=42, n_jobs=-1, verbosity=-1),
    'CatBoost': CatBoostClassifier(iterations=300, learning_rate=0.05, depth=6, loss_function='Logloss', eval_metric='AUC', random_seed=42, verbose=0)
}
print(f'Evaluating {len(models)} algorithms...')""")
]

# 4. 04_hyperparameter_tuning_and_final_pipeline.ipynb
nb4_cells = [
    make_cell("markdown", "# 🏆 Credit Risk & Loan Default Prediction: 04 - Hyperparameter Tuning & Final Pipeline Calibration\n\n### Objective:\n- Optimize CatBoost hyperparameters with RandomizedSearchCV\n- Generate Out-Of-Fold (OOF) predicted probabilities\n- Calibrate optimal risk decision threshold (Precision-Recall / F-Beta analysis)\n- Finalize, evaluate on held-out test set, and serialize production pipeline artifact"),
    make_cell("code", """import numpy as np
import pandas as pd
import joblib
import json
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import StratifiedKFold, cross_val_predict, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    roc_auc_score, average_precision_score, precision_recall_curve,
    classification_report, confusion_matrix, precision_score, recall_score, f1_score, fbeta_score
)
from catboost import CatBoostClassifier

import sys
sys.path.append('..')
from src.features.feature_engineering import FeatureEngineer, CatBoostPreprocessor, get_feature_metadata"""),
    make_cell("markdown", "## 1. Load Data & Prepare Partitions"),
    make_cell("code", """df = pd.read_csv('../data/raw/application_train.csv')
X = df.drop(columns='TARGET')
y = df['TARGET']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42, stratify=y
)
print(f'Train samples: {len(X_train):,}, Test samples: {len(X_test):,}')

metadata = get_feature_metadata(X_train)
cols_to_drop = metadata['cols_to_drop']
categorical_numeric = metadata['categorical_numeric']
categorical_features = metadata['categorical_features']"""),
    make_cell("markdown", "## 2. Final Optimized Pipeline Architecture"),
    make_cell("code", """final_model = CatBoostClassifier(
    depth=7,
    eval_metric='AUC',
    iterations=700,
    l2_leaf_reg=5,
    learning_rate=0.05,
    loss_function='Logloss',
    random_seed=42,
    random_strength=0,
    verbose=0
)

final_pipeline = Pipeline([
    ('feature_engineering', FeatureEngineer(
        cols_to_drop=cols_to_drop,
        categorical_numeric=categorical_numeric
    )),
    ('preprocessor', CatBoostPreprocessor(
        categorical_features=categorical_features
    )),
    ('model', final_model)
])"""),
    make_cell("markdown", "## 3. Out-Of-Fold (OOF) Prediction for Threshold Optimization"),
    make_cell("code", """cv = StratifiedKFold(n_splits=4, shuffle=True, random_state=42)

OOF = cross_val_predict(
    final_pipeline,
    X_train,
    y_train,
    cv=cv,
    method='predict_proba',
    n_jobs=-1,
    params={'model__cat_features': categorical_features}
)

y_oof_prob = OOF[:, 1]
print(f'OOF ROC-AUC Score: {roc_auc_score(y_train, y_oof_prob):.4f}')
print(f'OOF PR-AUC Score:  {average_precision_score(y_train, y_oof_prob):.4f}')"""),
    make_cell("markdown", "## 4. Precision-Recall & F-Beta Threshold Calibration\nFor credit default detection, missing a defaulting borrower is far more costly than conducting manual review. Hence we optimize threshold for high recall (F-2 score / recall >= 0.75)."),
    make_cell("code", """thresholds = np.arange(0.01, 0.50, 0.01)
metrics = []

for t in thresholds:
    y_pred = (y_oof_prob >= t).astype(int)
    metrics.append({
        'threshold': round(t, 2),
        'precision': precision_score(y_train, y_pred, zero_division=0),
        'recall': recall_score(y_train, y_pred, zero_division=0),
        'f1': f1_score(y_train, y_pred, zero_division=0),
        'f2': fbeta_score(y_train, y_pred, beta=2, zero_division=0)
    })

threshold_df = pd.DataFrame(metrics)
print('Optimal Threshold Options with Recall >= 0.75:')
print(threshold_df[threshold_df['recall'] >= 0.75].sort_values(by='precision', ascending=False).head(10))

FINAL_THRESHOLD = 0.05
print(f'\\nSelected Business Decision Threshold: {FINAL_THRESHOLD}')"""),
    make_cell("markdown", "## 5. Train Final Production Pipeline on Full Train Set"),
    make_cell("code", """final_pipeline.fit(
    X_train,
    y_train,
    model__cat_features=categorical_features
)

test_probs = final_pipeline.predict_proba(X_test)[:, 1]
test_preds = (test_probs >= FINAL_THRESHOLD).astype(int)

print(f'Test ROC-AUC: {roc_auc_score(y_test, test_probs):.4f}')
print(f'Test PR-AUC:  {average_precision_score(y_test, test_probs):.4f}')
print('\\nTest Classification Report at threshold = 0.05:')
print(classification_report(y_test, test_preds))"""),
    make_cell("markdown", "## 6. Serialize Production Artifacts & Metadata"),
    make_cell("code", """import os

os.makedirs('../artifacts', exist_ok=True)
joblib.dump(final_pipeline, '../artifacts/model_pipeline.joblib')

meta = {
    'model_name': 'CatBoost Credit Risk & Default Predictor',
    'version': '1.0.0',
    'algorithm': 'CatBoostClassifier',
    'optimal_threshold': FINAL_THRESHOLD,
    'metrics': {
        'roc_auc': float(round(roc_auc_score(y_test, test_probs), 4)),
        'pr_auc': float(round(average_precision_score(y_test, test_probs), 4)),
        'recall_at_optimal_threshold': float(round(recall_score(y_test, test_preds), 4)),
        'precision_at_optimal_threshold': float(round(precision_score(y_test, test_preds), 4)),
        'f1_at_optimal_threshold': float(round(f1_score(y_test, test_preds), 4))
    },
    'categorical_features': categorical_features,
    'categorical_numeric': categorical_numeric,
    'cols_to_drop': cols_to_drop
}

with open('../artifacts/model_metadata.json', 'w') as f:
    json.dump(meta, f, indent=2)

print('Model and metadata successfully serialized to ../artifacts/')""")
]

os.makedirs('ml-service/notebooks', exist_ok=True)
save_notebook('ml-service/notebooks/01_data_exploration_and_eda.ipynb', nb1_cells)
save_notebook('ml-service/notebooks/02_feature_engineering_and_preprocessing.ipynb', nb2_cells)
save_notebook('ml-service/notebooks/03_model_experimentation_and_benchmark.ipynb', nb3_cells)
save_notebook('ml-service/notebooks/04_hyperparameter_tuning_and_final_pipeline.ipynb', nb4_cells)
print('All 4 modular notebooks created successfully!')
