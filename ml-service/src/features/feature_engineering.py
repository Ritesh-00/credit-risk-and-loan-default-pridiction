import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

DEFAULT_COLS_TO_DROP = [
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

COLS_TO_REMOVE_FROM_CAT_NUMERIC = [
    'TARGET', 'CNT_CHILDREN', 'CNT_FAM_MEMBERS', 'HOUR_APPR_PROCESS_START',
    'ELEVATORS_MODE', 'ENTRANCES_MODE', 'FLOORSMAX_MODE', 'FLOORSMIN_MODE',
    'ELEVATORS_MEDI', 'ENTRANCES_MEDI', 'FLOORSMAX_MEDI', 'FLOORSMIN_MEDI',
    'OBS_30_CNT_SOCIAL_CIRCLE', 'DEF_30_CNT_SOCIAL_CIRCLE',
    'OBS_60_CNT_SOCIAL_CIRCLE', 'DEF_60_CNT_SOCIAL_CIRCLE', 'OWN_CAR_AGE'
]


def get_feature_metadata(df: pd.DataFrame):
    """
    Derives categorical and numerical column partitions from a dataframe.
    """
    numeric_cols = df.select_dtypes(include='number')
    cat_numeric = numeric_cols.columns[numeric_cols.nunique() < 63].tolist()
    cat_numeric = [col for col in cat_numeric if col not in COLS_TO_REMOVE_FROM_CAT_NUMERIC]

    temp_fe = FeatureEngineer(cols_to_drop=DEFAULT_COLS_TO_DROP, categorical_numeric=cat_numeric)
    transformed_sample = temp_fe.transform(df.head(10))

    cat_features = transformed_sample.select_dtypes(include=['object', 'category']).columns.tolist()
    num_features = transformed_sample.select_dtypes(include='number').columns.tolist()

    return {
        'cols_to_drop': DEFAULT_COLS_TO_DROP,
        'categorical_numeric': cat_numeric,
        'categorical_features': cat_features,
        'numeric_features': num_features
    }


class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Production transformer for Credit Risk loan application feature engineering:
    - Row-level missingness indicators
    - Categorical-numeric tag conversions
    - Age & Employment transformations
    - Key financial ratios (Credit/Income, Annuity/Income, Goods/Income)
    - Redundant feature dropping
    """
    def __init__(self, cols_to_drop=None, categorical_numeric=None):
        self.cols_to_drop = cols_to_drop or DEFAULT_COLS_TO_DROP
        self.categorical_numeric = categorical_numeric or []

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        if isinstance(X, dict):
            X = pd.DataFrame([X])
        elif not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)

        X = X.copy()

        # 1. Missingness statistics across applicant profile
        X['TOTAL_MISSING'] = X.isna().sum(axis=1)
        X['MISSING_RATIO'] = X.isna().mean(axis=1)

        # 2. Convert flagged low-cardinality numeric features to string representations
        for col in self.categorical_numeric:
            if col in X.columns:
                X[col] = X[col].apply(
                    lambda v: f'UNKNOWN_{col}' if pd.isna(v) else f'{col}_{v}'
                )

        # 3. Age in Years from negative DAYS_BIRTH
        if 'DAYS_BIRTH' in X.columns:
            X['AGE_YEARS'] = -X['DAYS_BIRTH'] / 365.25

        # 4. Employment Anomaly & Length in Years
        if 'DAYS_EMPLOYED' in X.columns:
            X['EMPLOYED_ANOMALY'] = (X['DAYS_EMPLOYED'] > 0).astype(int)
            X['EMPLOYED_YEARS'] = (
                X['DAYS_EMPLOYED'].where(X['DAYS_EMPLOYED'] <= 0) / -365.25
            ).fillna(0)

        # 5. Core Financial & Solvency Ratios
        if 'AMT_CREDIT' in X.columns and 'AMT_INCOME_TOTAL' in X.columns:
            X['CREDIT_INCOME_RATIO'] = (
                X['AMT_CREDIT'] / X['AMT_INCOME_TOTAL'].replace(0, np.nan)
            )

        if 'AMT_ANNUITY' in X.columns and 'AMT_INCOME_TOTAL' in X.columns:
            X['ANNUITY_INCOME_RATIO'] = (
                X['AMT_ANNUITY'] / X['AMT_INCOME_TOTAL'].replace(0, np.nan)
            )

        if 'AMT_GOODS_PRICE' in X.columns and 'AMT_INCOME_TOTAL' in X.columns:
            X['GOODS_INCOME_RATIO'] = (
                X['AMT_GOODS_PRICE'] / X['AMT_INCOME_TOTAL'].replace(0, np.nan)
            )

        if 'AMT_INCOME_TOTAL' in X.columns and 'CNT_FAM_MEMBERS' in X.columns:
            X['INCOME_PER_FAMILY_MEMBER'] = (
                X['AMT_INCOME_TOTAL'] / X['CNT_FAM_MEMBERS'].replace(0, np.nan)
            )

        # 6. Car Ownership & Age Imputation
        if 'OWN_CAR_AGE' in X.columns:
            X['OWN_CAR_AGE_MISSING'] = X['OWN_CAR_AGE'].isna().astype(int)
            X['OWN_CAR_AGE'] = X['OWN_CAR_AGE'].fillna(0)

        # 7. Drop unnecessary / noisy columns
        if self.cols_to_drop:
            X = X.drop(columns=self.cols_to_drop, errors='ignore')

        return X


class CatBoostPreprocessor(BaseEstimator, TransformerMixin):
    """
    Fills missing values with 'Unknown' and converts categorical features to string
    format required by CatBoost's internal categorical encoder.
    """
    def __init__(self, categorical_features=None):
        self.categorical_features = categorical_features or []

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X = X.copy()
        for col in self.categorical_features:
            if col in X.columns:
                X[col] = X[col].fillna('Unknown').astype(str)
        return X
