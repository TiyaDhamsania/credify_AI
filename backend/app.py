"""
Credify AI — Flask Backend (FINAL FIXED VERSION)
"""

import os
import json
import pickle
import warnings
import numpy as np
import shap
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import gdown

warnings.filterwarnings('ignore')

# ── Paths ─────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# ── Download function ─────────────────────────
def _is_git_lfs_pointer(path: str) -> bool:
    try:
        with open(path, "rb") as f:
            head = f.read(64)
        return head.startswith(b"version https://git-lfs.github.com/spec/v1")
    except OSError:
        return False


def _ensure_artifact(filename: str, url: str) -> str:
    """
    Prefer real artifacts next to this file. If missing/invalid (or a Git LFS pointer),
    try ../models/<filename> from `train_model.py`, then download from Google Drive.
    """
    local = os.path.join(BASE_DIR, filename)
    fallback = os.path.join(os.path.dirname(BASE_DIR), "models", filename)

    if os.path.exists(local) and not _is_git_lfs_pointer(local):
        return local

    if os.path.exists(fallback) and not _is_git_lfs_pointer(fallback):
        print(f"Using trained artifact: {fallback}")
        return fallback

    if not os.path.exists(local) or _is_git_lfs_pointer(local):
        print(f"Downloading {filename}...")
        gdown.download(url, local, quiet=False)

    return local


# ── Google Drive URLs ─────────────────────────
MODEL_URL = "https://drive.google.com/uc?id=1RoookuCExsJLhKNjqN-hmW0_exbvSZd9"
ENCODER_URL = "https://drive.google.com/uc?id=1zHXsIPmqvPRV599RtbKHEygkF0Ct49L"
# ── Resolve artifacts (local-first; avoids Drive when trained files exist) ──
MODEL_PATH = _ensure_artifact("model.pkl", MODEL_URL)
ENCODER_PATH = _ensure_artifact("label_encoders.pkl", ENCODER_URL)

# ── Load files ────────────────────────────────
with open(MODEL_PATH, "rb") as f:
    MODEL = pickle.load(f)

with open(ENCODER_PATH, "rb") as f:
    label_encoders = pickle.load(f)

# Order must match train_model.py / the estimator (Drive `feature_columns.pkl` can be stale).
FEATURE_META_PATH = os.path.join(BASE_DIR, "models", "feature_meta.json")
with open(FEATURE_META_PATH, "r", encoding="utf-8") as f:
    _feature_meta = json.load(f)
FEATURES = _feature_meta["features"]

_n_in = getattr(MODEL, "n_features_in_", None)
if _n_in is not None and len(FEATURES) != _n_in:
    raise RuntimeError(
        f"feature_meta.json has {len(FEATURES)} features but model expects {_n_in}. "
        "Update models/feature_meta.json or re-run train_model.py."
    )

LE_MAP = label_encoders

_INPUT_DEFAULTS = {
    "FLAG_OWN_REALTY": "N",
    "EMPLOYMENT_TYPE": "Other",
}

# TreeExplainer is correct for sklearn RandomForest; generic Explainer returns
# shape (1, n_features, 2) for binary classifiers — indexing [0] alone breaks float(sv[i]).
try:
    EXPLAINER = shap.TreeExplainer(MODEL)
except Exception:
    EXPLAINER = None


def _shap_values_row_positive_class(shap_out):
    """Return 1D SHAP contributions toward the positive (risk/default) class."""
    if isinstance(shap_out, list):
        # Binary: [class0, class1] each (n_samples, n_features)
        return np.asarray(shap_out[1][0], dtype=np.float64)
    arr = np.asarray(shap_out)
    if arr.ndim == 3:
        # (n_samples, n_features, n_classes) — use class 1 (default / positive risk)
        return arr[0, :, 1].astype(np.float64)
    if arr.ndim == 2:
        return arr[0].astype(np.float64)
    return arr.ravel().astype(np.float64)

# ── Flask ─────────────────────────────────────
app = Flask(__name__)
CORS(app)

# ── Demo Profiles ─────────────────────────────
DEMO_PROFILES = {
    'good': {
        'AGE': 35,
        'AMT_INCOME_TOTAL': 450000,
        'YEARS_EMPLOYED': 5,
        'EMPLOYMENT_TYPE': 'Salaried',
        'CNT_FAM_MEMBERS': 3,
        'CNT_CHILDREN': 1,
        'FLAG_OWN_REALTY': 'Y',
    },
    'risky': {
        'AGE': 21,
        'AMT_INCOME_TOTAL': 60000,
        'YEARS_EMPLOYED': 0.2,
        'EMPLOYMENT_TYPE': 'Student',
        'CNT_FAM_MEMBERS': 7,
        'CNT_CHILDREN': 4,
        'FLAG_OWN_REALTY': 'N',
    }
}

# ── Encode Input ──────────────────────────────
def encode_input(raw):
    row = {}

    for feat in FEATURES:
        val = raw.get(feat)
        if val is None or (isinstance(val, str) and val.strip() == ""):
            val = _INPUT_DEFAULTS.get(feat)
        if val is None:
            raise ValueError(f"Missing required field: {feat}")

        if feat in LE_MAP:
            val = LE_MAP[feat].transform([str(val)])[0]
        else:
            val = float(val)

        row[feat] = val

    return np.array([[row[f] for f in FEATURES]])

# ── SHAP Explanation ──────────────────────────
def build_explanations(X):
    if EXPLAINER is None:
        return [{"feature": "N/A", "text": "Explanation unavailable", "impact": "low", "direction": "neutral"}]

    try:
        X_arr = np.asarray(X, dtype=np.float64)
        shap_raw = EXPLAINER.shap_values(X_arr)
        sv = _shap_values_row_positive_class(shap_raw)

        # Top factors by absolute impact (up to 5)
        order = np.argsort(np.abs(sv))[::-1][: min(5, len(sv))]

        results = []
        for i in order:
            feat = FEATURES[i]
            val = float(sv[i])
            bad = val > 0

            results.append({
                'feature': feat,
                'text': f"{feat} {'increases' if bad else 'reduces'} risk",
                'impact': 'medium',
                'direction': 'negative' if bad else 'positive'
            })

        return results

    except Exception as e:
        print("SHAP ERROR:", e)
        return [{"feature": "N/A", "text": "Explanation failed", "impact": "low", "direction": "neutral"}]

# ── Improvements ─────────────────────────────
def build_improvements(raw, score):
    tips = []

    if raw['YEARS_EMPLOYED'] < 2:
        tips.append("Stay longer in your job")

    if raw['AMT_INCOME_TOTAL'] < 150000:
        tips.append("Increase income or add co-applicant")

    if raw['FLAG_OWN_REALTY'] == 'N':
        tips.append("Owning property helps approval")

    if score < 650:
        tips.append("Start with smaller loans")

    if not tips:
        tips.append("Strong profile!")

    return tips

# ── Score Logic ──────────────────────────────
def probability_to_score(prob):
    return int(300 + (1 - prob) * 600)

def score_to_rate(score):
    if score >= 750: return 9
    if score >= 650: return 14
    if score >= 600: return 17.5
    return 22

def score_to_label(score):
    if score >= 750: return "Excellent"
    if score >= 700: return "Good"
    if score >= 650: return "Average"
    if score >= 600: return "Poor"
    return "Very Poor"

def score_to_risk(score):
    if score >= 750: return "Low"
    if score >= 650: return "Medium"
    return "High"

# ── Routes ───────────────────────────────────

@app.route("/")
def home():
    return render_template("index.html")

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        raw = request.json

        X = encode_input(raw)
        proba = MODEL.predict_proba(X)[0]
        risk_prob = proba[1]

        pred = 1 if risk_prob > 0.2 else 0
        score = probability_to_score(risk_prob)

        return jsonify({
            'decision': 'Rejected' if pred else 'Approved',
            'confidence': round(max(proba) * 100, 2),
            'risk_score': round(risk_prob * 100, 2),
            'credit_score': score,
            'interest_rate': score_to_rate(score),
            'risk_level': score_to_risk(score),
            'score_label': score_to_label(score),
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

@app.route('/api/demo/<profile>')
def demo(profile):
    if profile not in DEMO_PROFILES:
        return jsonify({'error': 'Invalid profile'}), 404

    raw = DEMO_PROFILES[profile]
    X = encode_input(raw)

    proba = MODEL.predict_proba(X)[0]
    risk_prob = proba[1]

    pred = 1 if risk_prob > 0.2 else 0
    score = probability_to_score(risk_prob)

    return jsonify({
        'input': raw,
        'decision': 'Rejected' if pred else 'Approved',
        'confidence': round(max(proba) * 100, 2),
        'risk_score': round(risk_prob * 100, 2),
        'credit_score': score,
        'interest_rate': score_to_rate(score),
        'risk_level': score_to_risk(score),
        'score_label': score_to_label(score),
        'explanations': build_explanations(X),
        'improvements': build_improvements(raw, score),
        'cibil_note': "Real systems use CIBIL via PAN."
    })

# ── Run ──────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)