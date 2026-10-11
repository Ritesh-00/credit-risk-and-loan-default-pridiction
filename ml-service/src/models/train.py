import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.metrics import roc_auc_score, average_precision_score, precision_score, recall_score, f1_score, fbeta_score
from catboost import CatBoostClassifier

import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
from src.features.feature_engineering import FeatureEngineer, CatBoostPreprocessor, get_feature_metadata

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'raw', 'application_train.csv')
ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'artifacts')
MODEL_PATH = os.path.join(ARTIFACTS_DIR, 'model_pipeline.joblib')
METADATA_PATH = os.path.join(ARTIFACTS_DIR, 'model_metadata.json')


def train_and_export(sample_size: int = 50000):
    print("=" * 60)
    print("[INFO] Starting Production Training for Credit Risk CatBoost Pipeline")
    print("=" * 60)

    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Data file not found at {DATA_PATH}")

    print(f"Loading data from {DATA_PATH} (sampling up to {sample_size} records for fast production export)...")
    df = pd.read_csv(DATA_PATH)
    
    if len(df) > sample_size:
        # Stratified subsampling for fast, high-quality training
        df_pos = df[df['TARGET'] == 1]
        df_neg = df[df['TARGET'] == 0].sample(n=sample_size - len(df_pos), random_state=42)
        df = pd.concat([df_pos, df_neg]).sample(frac=1.0, random_state=42)
    
    print(f"Dataset active size: {df.shape}")

    X = df.drop(columns='TARGET')
    y = df['TARGET']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    metadata = get_feature_metadata(X_train)
    cols_to_drop = metadata['cols_to_drop']
    categorical_numeric = metadata['categorical_numeric']
    categorical_features = metadata['categorical_features']

    print(f"Categorical features count: {len(categorical_features)}")
    print(f"Columns to drop count: {len(cols_to_drop)}")

    final_model = CatBoostClassifier(
        depth=7,
        eval_metric='AUC',
        iterations=350,
        l2_leaf_reg=5,
        learning_rate=0.05,
        loss_function='Logloss',
        random_seed=42,
        random_strength=0,
        thread_count=-1,
        verbose=50
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
    ])

    print("\nFitting full pipeline...")
    final_pipeline.fit(
        X_train,
        y_train,
        model__cat_features=categorical_features
    )

    print("\nEvaluating on held-out test set...")
    test_probs = final_pipeline.predict_proba(X_test)[:, 1]
    
    FINAL_THRESHOLD = 0.05
    test_preds = (test_probs >= FINAL_THRESHOLD).astype(int)

    roc_auc = float(roc_auc_score(y_test, test_probs))
    pr_auc = float(average_precision_score(y_test, test_probs))
    recall = float(recall_score(y_test, test_preds, zero_division=0))
    prec = float(precision_score(y_test, test_preds, zero_division=0))
    f1 = float(f1_score(y_test, test_preds, zero_division=0))
    f2 = float(fbeta_score(y_test, test_preds, beta=2, zero_division=0))

    print(f"Test ROC-AUC: {roc_auc:.4f}")
    print(f"Test PR-AUC:  {pr_auc:.4f}")
    print(f"Test Recall @ 0.05 threshold:    {recall:.4f}")
    print(f"Test Precision @ 0.05 threshold: {prec:.4f}")
    print(f"Test F1 @ 0.05 threshold:        {f1:.4f}")
    print(f"Test F2 @ 0.05 threshold:        {f2:.4f}")

    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    print(f"\nSaving pipeline artifact to {MODEL_PATH}...")
    joblib.dump(final_pipeline, MODEL_PATH)

    meta = {
        'model_name': 'CatBoost Credit Risk & Default Classifier',
        'version': '1.0.0',
        'status': 'READY',
        'algorithm': 'CatBoostClassifier with Stratified Feature Pipeline',
        'optimal_threshold': FINAL_THRESHOLD,
        'metrics': {
            'roc_auc': round(roc_auc, 4),
            'pr_auc': round(pr_auc, 4),
            'recall_at_optimal_threshold': round(recall, 4),
            'precision_at_optimal_threshold': round(prec, 4),
            'f1_at_optimal_threshold': round(f1, 4),
            'f2_at_optimal_threshold': round(f2, 4)
        },
        'training_dataset': 'Home Credit Default Risk Dataset',
        'categorical_features': categorical_features,
        'categorical_numeric': categorical_numeric,
        'cols_to_drop': cols_to_drop
    }

    with open(METADATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(meta, f, indent=2)

    print(f"Metadata saved to {METADATA_PATH}")
    print("[SUCCESS] Training and export completed successfully!")


if __name__ == '__main__':
    train_and_export()
