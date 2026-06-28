import joblib
import pandas as pd
from sklearn.metrics import classification_report, accuracy_score
import os

def evaluate():
    model_path = 'ml_module/saved_models/rf_model.pkl'
    vectorizer_path = 'ml_module/saved_models/vectorizer.pkl'
    data_path = 'data/datasets/instagram_cyber_dataset.csv'

    print("[AI EVALUATOR] Calculating Live Metrics...")
    
    if not os.path.exists(model_path):
        print("Error: Model not found.")
        return

    # Load model and data
    model = joblib.load(model_path)
    vectorizer = joblib.load(vectorizer_path)
    df = pd.read_csv(data_path)
    
    # Simple evaluation on a sample to get representative metrics
    X = df['text'].astype(str)
    y = df['label']
    
    X_vec = vectorizer.transform(X)
    y_pred = model.predict(X_vec)
    
    acc = accuracy_score(y, y_pred)
    report = classification_report(y, y_pred, output_dict=True)
    
    print("-" * 30)
    print(f"ACCURACY: {acc:.4f}")
    print(f"F1 SCORE (Weighted): {report['weighted avg']['f1-score']:.4f}")
    print(f"PRECISION: {report['weighted avg']['precision']:.4f}")
    print(f"RECALL: {report['weighted avg']['recall']:.4f}")
    print("-" * 30)

if __name__ == "__main__":
    evaluate()
