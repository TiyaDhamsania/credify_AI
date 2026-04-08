# 🚀 Credify AI 

An AI-powered web application that predicts **credit risk / loan approval** using Machine Learning and provides **explainable insights**.

🔗 **Live Demo:** https://credify-ai.onrender.com/

---

## 📌 Project Overview

**Credify AI** is an intelligent credit risk prediction system designed to help financial institutions evaluate whether a customer is likely to **default or repay a loan**.
This project not only predicts credit risk but also provides explainable AI insights and actionable recommendations, making it closer to real-world fintech systems.

It combines:

* Machine Learning for prediction
* SHAP for explainability
* Flask for backend API
* Interactive frontend for user input

---

## 🎯 Features

✔ Credit approval prediction (Approve / Reject)
✔ Credit score & risk level generation
✔ Interest rate estimation
✔ Explainable AI using SHAP
✔ Smart improvement suggestions
✔ Demo profiles for testing
✔ Fully deployed web application

---
## 📸 Screenshots

### 🔹 Input Form

![Input Form](https://github.com/user-attachments/assets/e9b37983-c597-40a1-bbc8-afd93a6...)


### 🔹 Prediction Output
![Prediction Output](<img width="825" height="953" alt="Screenshot 2026-04-09 032121" src="https://github.com/user-attachments/assets/58afc23d-9e4a-4582-b8ae-cfb5ff90ee5f" />
)

### 🔹 SHAP Explanation & Recommendations
![Explanation](<img width="833" height="767" alt="Screenshot 2026-04-09 033321" src="https://github.com/user-attachments/assets/78448266-bc73-4fa3-8b28-3dd02b700e4b" />
)

## 🧠 Tech Stack

### 🔹 Machine Learning

* **Model:** Random Forest (Scikit-learn)
* **Imbalance Handling:** SMOTE (imbalanced-learn)
* **Explainability:** SHAP

### 🔹 Backend

* Python
* Flask
* Flask-CORS

### 🔹 Libraries

* NumPy
* Pandas
* Scikit-learn
* Imbalanced-learn
* SHAP
* gdown

### 🔹 Deployment

* Gunicorn
* Render

### 🔹 Version Control

* Git & GitHub

---

## 📂 Project Structure

```
credify_ai/
│
├── backend/              # Flask backend (API + SHAP)
├── frontend/             # UI (HTML, CSS, JS)
├── models/               # Trained model files
├── data/                 # Dataset
│
├── train_model.py        # Model training
├── requirements.txt      # Dependencies
├── render.yaml           # Deployment config
```

---

## ⚙️ How It Works

1. User enters financial details
2. Backend processes input
3. Random Forest predicts risk
4. Credit score is generated
5. SHAP explains the decision
6. Result displayed on dashboard

---

## 🧪 Model Details

* Algorithm: Random Forest
* Data imbalance handled using SMOTE
* Key features:

  * Age
  * Income
  * Employment type
  * Family members
  * Children
  * Property ownership

---

## 🔍 Explainability (SHAP)

SHAP is used to:

* Show which features increase/decrease risk
* Make predictions transparent
* Help users understand decisions

---

## ▶️ Run Locally

```bash
git clone https://github.com/your-username/credify_ai.git
cd credify_ai
pip install -r requirements.txt
python backend/app.py
```

---

## ☁️ Deployment

Deployed on **Render** using:

* Gunicorn server
* Auto model download via Google Drive

---

## 📊 Dataset

* Real-world credit dataset
* Includes application and credit history

---

## 🔮 Future Improvements

* User authentication system
* Advanced analytics dashboard
* Database integration
* Better UI/UX

---

## 👩‍💻 Author

**Tiya Dhamsania**
B.Tech IT Student | Aspiring Data Scientist

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
