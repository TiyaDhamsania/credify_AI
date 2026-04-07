"""
Credify AI — Real Bank Dataset Training Script
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)
from imblearn.over_sampling import SMOTE
import pickle, json, warnings, os
warnings.filterwarnings('ignore')

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
DATA_DIR  = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

APP_CSV    = os.path.join(DATA_DIR, "application_record.csv")
CREDIT_CSV = os.path.join(DATA_DIR, "credit_record.csv")

MODEL_PATH    = os.path.join(MODEL_DIR, "model.pkl")
COLUMNS_PATH  = os.path.join(MODEL_DIR, "feature_columns.pkl")
ENCODERS_PATH = os.path.join(MODEL_DIR, "label_encoders.pkl")
META_PATH     = os.path.join(MODEL_DIR, "feature_meta.json")

# ══════════════════════════════════════════════════════════════════
# STEP 1 — Load raw data
# ══════════════════════════════════════════════════════════════════
print("📂 Loading data...")
app  = pd.read_csv(APP_CSV)
cred = pd.read_csv(CREDIT_CSV)
print(f"   Application records : {app.shape[0]:,} rows")
print(f"   Credit records      : {cred.shape[0]:,} rows")

# ══════════════════════════════════════════════════════════════════
# STEP 2 — Build DEFAULT target label
# ══════════════════════════════════════════════════════════════════
print("\n🏷️  Building default labels...")
cred['IS_BAD'] = cred['STATUS'].isin(['2','3','4','5']).astype(int)
labels = cred.groupby('ID')['IS_BAD'].max().reset_index()
labels.columns = ['ID', 'default']
print(f"   Total labelled IDs  : {len(labels):,}")
print(f"   Defaults (1)        : {labels['default'].sum():,} ({labels['default'].mean():.1%})")
print(f"   Non-defaults (0)    : {(labels['default']==0).sum():,}")

# ══════════════════════════════════════════════════════════════════
# STEP 3 — Merge & deduplicate
# ══════════════════════════════════════════════════════════════════
df = app.merge(labels, on='ID', how='inner')
df = df.drop_duplicates(subset='ID')
print(f"\n🔗 After merge & dedup: {df.shape[0]:,} unique applicants")

# ══════════════════════════════════════════════════════════════════
# STEP 4 — Feature engineering
# ══════════════════════════════════════════════════════════════════
print("\n⚙️  Engineering features...")
df['AGE'] = (-df['DAYS_BIRTH'] / 365).astype(int)
df['YEARS_EMPLOYED'] = np.where(
    df['DAYS_EMPLOYED'] > 0, 0,
    (-df['DAYS_EMPLOYED'] / 365).round(1)
)
income_map = {
    'Working':              'Salaried',
    'Commercial associate': 'Self-Employed',
    'State servant':        'Government',
    'Pensioner':            'Pensioner',
    'Student':              'Student',
}
df['EMPLOYMENT_TYPE'] = df['NAME_INCOME_TYPE'].map(income_map).fillna('Other')

# ══════════════════════════════════════════════════════════════════
# STEP 5 — Select 7 features (added FLAG_OWN_REALTY)
# ══════════════════════════════════════════════════════════════════
SELECTED_FEATURES = [
    'AGE',
    'AMT_INCOME_TOTAL',
    'YEARS_EMPLOYED',
    'EMPLOYMENT_TYPE',
    'CNT_FAM_MEMBERS',
    'CNT_CHILDREN',
    'FLAG_OWN_REALTY',    # ✅ NEW — property ownership Y/N
]

df_model = df[SELECTED_FEATURES + ['default']].dropna().copy()
print(f"   Clean rows for training: {len(df_model):,}")

# ══════════════════════════════════════════════════════════════════
# STEP 6 — Encode categoricals
# ══════════════════════════════════════════════════════════════════
CAT_COLS = ['EMPLOYMENT_TYPE', 'FLAG_OWN_REALTY']   # ✅ NEW
le_map   = {}
for col in CAT_COLS:
    le = LabelEncoder()
    df_model[col] = le.fit_transform(df_model[col])
    le_map[col]   = le
    print(f"   Encoded {col}: {list(le.classes_)}")

# ══════════════════════════════════════════════════════════════════
# STEP 7 — Train / test split
# ══════════════════════════════════════════════════════════════════
X = df_model[SELECTED_FEATURES]
y = df_model['default']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
print(f"\n📊 Train: {len(X_train):,} rows | Test: {len(X_test):,} rows")

# ══════════════════════════════════════════════════════════════════
# STEP 8 — SMOTE (training data only)
# ══════════════════════════════════════════════════════════════════
print("\n⚖️  Applying SMOTE...")
sm = SMOTE(random_state=42, k_neighbors=5)
X_res, y_res = sm.fit_resample(X_train, y_train)
print(f"   Balanced — Non-default: {(y_res==0).sum():,} | Default: {(y_res==1).sum():,}")

# ══════════════════════════════════════════════════════════════════
# STEP 9 — Train Random Forest (improved settings)
# ══════════════════════════════════════════════════════════════════
print("\n🌲 Training Random Forest...")
rf = RandomForestClassifier(
    n_estimators=500,        # ✅ was 300
    max_depth=15,            # ✅ was 12
    min_samples_split=5,     # ✅ was 10
    min_samples_leaf=2,      # ✅ NEW
    max_features='sqrt',     # ✅ NEW
    class_weight='balanced',
    random_state=42,
    n_jobs=-1,
)
rf.fit(X_res, y_res)

# ══════════════════════════════════════════════════════════════════
# STEP 10 — Evaluate
# ══════════════════════════════════════════════════════════════════
def evaluate_model(model, X_test, y_test):
    y_pred  = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    print("\n=== Default Threshold (0.5) ===")
    print(classification_report(y_test, y_pred,
                                target_names=["Reject","Approve"],
                                zero_division=0))

    print("\n=== Lowered Threshold (0.3) ===")
    y_pred_low = (y_proba >= 0.3).astype(int)
    print(classification_report(y_test, y_pred_low,
                                target_names=["Reject","Approve"],
                                zero_division=0))

    print(f"ROC-AUC Score          : {roc_auc_score(y_test, y_proba):.4f}")
    print(f"Average Precision (PR) : {average_precision_score(y_test, y_proba):.4f}")

    cm = confusion_matrix(y_test, y_pred)
    tn, fp, fn, tp = cm.ravel()
    print(f"\nConfusion Matrix:")
    print(f"  True Negatives  (correct Rejects)  : {tn}")
    print(f"  False Positives (wrong Approvals)   : {fp}  ← bank loses money")
    print(f"  False Negatives (wrong Rejects)     : {fn}  ← customer upset")
    print(f"  True Positives  (correct Approvals) : {tp}")

evaluate_model(rf, X_test, y_test)

# ══════════════════════════════════════════════════════════════════
# STEP 11 — Save artifacts
# ══════════════════════════════════════════════════════════════════
with open(MODEL_PATH,    'wb') as f: pickle.dump(rf,               f)
with open(COLUMNS_PATH,  'wb') as f: pickle.dump(SELECTED_FEATURES, f)
with open(ENCODERS_PATH, 'wb') as f: pickle.dump(le_map,            f)

meta = {'features': SELECTED_FEATURES, 'categorical': CAT_COLS}
with open(META_PATH, 'w') as f: json.dump(meta, f, indent=2)

print("\n✅ Saved to /models folder")
print("➜  Now run: python app.py")