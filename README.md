# Instagram Cyber Incident Monitoring Tool 🛡️📸

An advanced cybersecurity monitoring platform designed to detect and classify threats within Instagram feeds. This tool leverages **Machine Learning (Random Forest)** and **Real-time Web Scraping** to identify malicious activities such as Phishing, Malware distribution, and DDoS botnet coordination.

---

## 🚀 Key Highlights

- **🎯 High Accuracy:** Machine learning model achieved **94.15% accuracy** on Instagram-specific cyber threat datasets.
- **🤖 ML Algorithm:** Powered by **Random Forest Classifier** with TF-IDF vectorization.
- **🌐 Real-time Scraping:** Integrated with **Apify Instagram Scraper** for analyzing real-world profiles and posts.
- **📊 Interactive Analytics:** Detailed visualizations including Confusion Matrices, Feature Importance, and Threat Distribution.
- **🏗️ Full-Stack:** Scalable Flask backend with a modern React (Vite) frontend.

---

## 🛠️ Machine Learning Module

The core of this project is a sophisticated text classification engine:

### Detected Threats:
1.  **Phishing (🚨):** Credential theft, suspicious login links, and "verify account" scams.
2.  **Malware (🦠):** Distribution of malicious apps, virus links, and trojan horse payloads.
3.  **DDoS (📉):** Coordination of botnet attacks and server flooding instructions.

### Model Performance:
- **Accuracy:** 94.15%
- **Visualization:** 
    - `backend/data/plots/feature_importance.png` (Top keywords identifying threats)
    - `backend/data/plots/random_forest_confusion_matrix.png` (Precision & Recall)
    - `backend/data/plots/label_distribution.png` (Dataset balance)

---

## 📁 Project Structure

```text
v:/DOS/
├── backend/                    # Python Flask Backend
│   ├── ml_module/              # ML Module (Trained Models & Classifier)
│   │   └── saved_models/       # .pkl files (RF Model & Vectorizer)
│   ├── routes/                 # API Endpoints (Analysis, Auth, Incidents)
│   ├── services/               # Business Logic (Apify Scraper, Incident Logic)
│   ├── data/                   # Data Storage
│   │   ├── datasets/           # Instagram Cyber Dataset (CSV)
│   │   └── plots/              # Training Graphs & Visuals
│   ├── app.py                  # Main Engine
│   └── train_kaggle_model.py   # Model Training Script
│
├── frontend/                   # React (Vite) Dashboard
│   ├── src/                    # UI Components & Pages
│   └── package.json            # Frontend Dependencies
└── README.md                   # You are here
```

---

## ⚙️ Technology Stack

- **Backend:** Flask, Python 3.10+
- **Machine Learning:** Scikit-learn, Pandas, Numpy, Joblib
- **Scraping:** Apify Instagram Scraper API
- **Frontend:** React.js, Vite, Recharts (Visuals), Tailwind CSS (optional)
- **Data Visualization:** Matplotlib, Seaborn

---

## 🏁 Getting Started

### Prerequisites:
- Python 3.10+
- Node.js & npm
- Apify API Token (provided in `services/apify_service.py`)

### Setup Backend:
1. `cd backend`
2. `pip install -r requirements.txt`
3. `python train_kaggle_model.py` (To see the 94% accuracy in action)
4. `python app.py`

### Setup Frontend:
1. `cd frontend`
2. `npm install`
3. `npm run dev`

---

## 🌍 Real-world Use Case

You can analyze a real Instagram profile by sending a request to the backend:
**Endpoint:** `POST /api/analysis/analyze-profile`
**Body:**
```json
{
    "profile_url": "https://www.instagram.com/target_profile/",
    "limit": 10
}
```
The system will fetch real posts using Apify and classify them instantly using the Random Forest model.

---

**Built with ❤️ for Cyber Security Researchers and Instagram Safety.**
