"""
Credify AI — Flask Backend (FIXED VERSION)
"""

import os
import pickle
import warnings
import numpy as np
import pandas as pd
import shap
from flask import Flask, request, jsonify
from flask_cors import CORS

warnings.filterwarnings('ignore')

# ── Paths ─────────────────────────────────────
BASE_DIR  = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

# ── Load Model ────────────────────────────────
with open(os.path.join(MODEL_DIR, 'model.pkl'), 'rb') as f:
    MODEL = pickle.load(f)

with open(os.path.join(MODEL_DIR, 'feature_columns.pkl'), 'rb') as f:
    FEATURES = pickle.load(f)

with open(os.path.join(MODEL_DIR, 'label_encoders.pkl'), 'rb') as f:
    LE_MAP = pickle.load(f)

EXPLAINER = shap.TreeExplainer(MODEL)

# ── Flask ─────────────────────────────────────
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

        if feat in LE_MAP:
            val = int(LE_MAP[feat].transform([str(val)])[0])
        else:
            val = float(val)

        row[feat] = val

    return np.array([[row[f] for f in FEATURES]])

# ── SHAP (SAFE) ──────────────────────────────
def build_explanations(X):
    try:
        row_df = pd.DataFrame(X, columns=FEATURES)
        shap_values = EXPLAINER.shap_values(row_df)

        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0]

        results = []
        for i, feat in enumerate(FEATURES):
            val = sv[i]
            if not np.isscalar(val):
                val = np.array(val).flatten()[0]

            shap_val = float(val)
            bad = shap_val > 0

            results.append({
                'feature': feat,
                'text': f"{feat} {'increases' if bad else 'reduces'} risk",
                'impact': 'medium',
                'direction': 'negative' if bad else 'positive'
            })

        return results[:5]

    except Exception as e:
        print("SHAP ERROR:", e)
        return [
            {"feature": "income", "text": "Income affects approval", "impact": "medium", "direction": "positive"}
        ]

# ── Improvements (FIXED) ─────────────────────
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

@app.route('/')
def home():
    return "Credify AI API Running 🚀"

@app.route('/api/health')
def health():
    return jsonify({'status': 'ok'})

@app.route('/api/predict', methods=['POST'])
def predict():
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
        'explanations': build_explanations(X),
        'improvements': build_improvements(raw, score),
        'cibil_note': "Real systems use CIBIL via PAN."
    })

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

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)