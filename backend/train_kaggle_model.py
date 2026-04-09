"""
Kaggle Dataset Processor and Model Trainer
==========================================
Process Kaggle datasets and train cyber threat detection model
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import os
import matplotlib.pyplot as plt
import seaborn as sns

print("🔥 Kaggle Dataset Processor")
print("=" * 60)

# Configuration
KAGGLE_DATA_PATH = 'data/datasets/instagram_cyber_dataset.csv'
OUTPUT_MODEL_PATH = 'ml_module/saved_models/rf_model.pkl'
OUTPUT_VECTORIZER_PATH = 'ml_module/saved_models/vectorizer.pkl'
PLOT_OUTPUT_DIR = 'data/plots/'

def load_kaggle_dataset():
    """
    Load the prepared Instagram cyber dataset
    """
    print(f"\n1️⃣ Loading Instagram Cyber Dataset...")
    
    if os.path.exists(KAGGLE_DATA_PATH):
        print(f"   Loading: {KAGGLE_DATA_PATH}")
        df = pd.read_csv(KAGGLE_DATA_PATH)
        print(f"   ✅ Loaded {len(df)} rows")
        print(f"   📊 Columns: {list(df.columns)}")
        return df
    else:
        raise FileNotFoundError(f"Prepared dataset not found at {KAGGLE_DATA_PATH}. Please run prepare_ig_dataset.py first.")

def identify_columns(df):
    """
    Identify text and label columns
    """
    print("\n2️⃣ Identifying columns...")

    # Common text column names
    text_columns = ['text', 'message', 'content', 'description', 'url', 'email', 'subject']
    # Common label column names
    label_columns = ['label', 'class', 'category', 'type', 'target', 'classification']

    text_col = None
    label_col = None

    # Find text column
    for col in df.columns:
        if col.lower() in text_columns or 'text' in col.lower() or 'description' in col.lower():
            text_col = col
            break

    # Find label column
    for col in df.columns:
        if col.lower() in label_columns or 'label' in col.lower() or 'category' in col.lower():
            label_col = col
            break

    if text_col is None or label_col is None:
        print("\n   Available columns:")
        for i, col in enumerate(df.columns):
            print(f"   {i+1}. {col}")

        # In case of automated execution, we might default to common indices
        try:
            text_idx = int(input("\n   Enter text column number: ")) - 1
            label_idx = int(input("   Enter label column number: ")) - 1
            text_col = df.columns[text_idx]
            label_col = df.columns[label_idx]
        except EOFError:
            # Fallback for non-interactive environments
            text_col = df.columns[0]
            label_col = df.columns[1]

    print(f"   ✅ Text column: {text_col}")
    print(f"   ✅ Label column: {label_col}")

    return text_col, label_col

def clean_and_prepare(df, text_col, label_col):
    """
    Clean and prepare dataset
    """
    print("\n3️⃣ Cleaning and preparing data...")

    # Remove missing values
    df = df.dropna(subset=[text_col, label_col])

    # Convert to string
    df[text_col] = df[text_col].astype(str)

    # Show label distribution
    print(f"\n   📊 Label Distribution:")
    print(df[label_col].value_counts())

    # Map labels to standard format if needed
    try:
        print("\n   Do you want to map labels? (y/n)")
        map_labels = input("   ").lower() == 'y'
    except EOFError:
        map_labels = False

    if map_labels:
        unique_labels = df[label_col].unique()
        print(f"\n   Current labels: {unique_labels}")
        print("\n   Map to: phishing, malware, ddos, normal")

        label_mapping = {}
        for label in unique_labels:
            new_label = input(f"   {label} -> ")
            label_mapping[label] = new_label

        df[label_col] = df[label_col].map(label_mapping)

    X = df[text_col]
    y = df[label_col]

    print(f"\n   ✅ Final dataset size: {len(df)}")
    print(f"   📊 Classes: {', '.join(y.unique())}")

    return X, y

def train_model(X, y):
    """
    Train Random Forest model
    """
    print("\n4️⃣ Training model...")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"   📚 Training samples: {len(X_train)}")
    print(f"   📚 Test samples: {len(X_test)}")

    # TF-IDF Vectorization
    print("\n   🔧 Creating TF-IDF features...")
    vectorizer = TfidfVectorizer(
        max_features=1000,
        ngram_range=(1, 2),
        min_df=2,
        max_df=0.95
    )

    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    print(f"   ✅ Feature matrix: {X_train_tfidf.shape}")

    # Train Random Forest
    print("\n   🌲 Training Random Forest...")
    rf_model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )

    rf_model.fit(X_train_tfidf, y_train)

    # Evaluate
    print("\n5️⃣ Evaluating model...")
    y_pred = rf_model.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"\n   🎯 Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")

    print("\n   📋 Classification Report:")
    print(classification_report(y_test, y_pred))

    print("\n   📊 Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    return rf_model, vectorizer, accuracy, X_test, y_test, y_pred

def save_models(rf_model, vectorizer):
    """
    Save trained models
    """
    print("\n6️⃣ Saving models...")

    # Save model
    with open(OUTPUT_MODEL_PATH, 'wb') as f:
        pickle.dump(rf_model, f)
    print(f"   ✅ Model saved: {OUTPUT_MODEL_PATH}")

    # Save vectorizer
    with open(OUTPUT_VECTORIZER_PATH, 'wb') as f:
        pickle.dump(vectorizer, f)
    print(f"   ✅ Vectorizer saved: {OUTPUT_VECTORIZER_PATH}")

def test_predictions(rf_model, vectorizer):
    """
    Test with sample predictions
    """
    print("\n7️⃣ Testing predictions...")

    sample_texts = [
        "urgent payment required click link verify account",
        "malware virus detected download antivirus now",
        "ddos attack flooding server with traffic",
        "security update completed successfully"
    ]

    for text in sample_texts:
        text_vector = vectorizer.transform([text])
        prediction = rf_model.predict(text_vector)[0]
        proba = rf_model.predict_proba(text_vector)[0]
        confidence = max(proba)

        print(f"\n   Text: '{text[:50]}...'")
        print(f"   Prediction: {prediction} (confidence: {confidence:.2%})")

def save_visualizations(df, label_col, y_test, y_pred, rf_model, vectorizer):
    """
    Save training visualizations
    """
    print("\n📊 Saving visualizations...")
    os.makedirs(PLOT_OUTPUT_DIR, exist_ok=True)

    # 1. Label Distribution
    plt.figure(figsize=(10, 6))
    sns.countplot(x=label_col, data=df, palette='viridis')
    plt.title('Label Distribution in Instagram Cyber Dataset')
    plt.xlabel('Category')
    plt.ylabel('Count')
    plt.tight_layout()
    plt.savefig(os.path.join(PLOT_OUTPUT_DIR, 'label_distribution.png'))
    print(f"   ✅ Label distribution plot saved: {PLOT_OUTPUT_DIR}label_distribution.png")

    # 2. Confusion Matrix Heatmap
    cm = confusion_matrix(y_test, y_pred)
    labels = sorted(y_test.unique())
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=labels, yticklabels=labels)
    plt.title('Confusion Matrix Heatmap')
    plt.xlabel('Predicted Label')
    plt.ylabel('True Label')
    plt.tight_layout()
    plt.savefig(os.path.join(PLOT_OUTPUT_DIR, 'random_forest_confusion_matrix.png'))
    print(f"   ✅ Confusion Matrix plot saved: {PLOT_OUTPUT_DIR}random_forest_confusion_matrix.png")

    # 3. Feature Importance (Top Words)
    import numpy as np
    importances = rf_model.feature_importances_
    features = vectorizer.get_feature_names_out()
    indices = np.argsort(importances)[-20:]  # Top 20 features

    plt.figure(figsize=(12, 8))
    plt.title('Feature Importance (Top 20 Keywords)')
    plt.barh(range(len(indices)), importances[indices], align='center')
    plt.yticks(range(len(indices)), [features[i] for i in indices])
    plt.xlabel('Relative Importance')
    plt.tight_layout()
    plt.savefig(os.path.join(PLOT_OUTPUT_DIR, 'feature_importance.png'))
    print(f"   ✅ Feature Importance plot saved: {PLOT_OUTPUT_DIR}feature_importance.png")

# Main execution
if __name__ == "__main__":
    try:
        # Load dataset
        df = load_kaggle_dataset()

        # Identify columns
        text_col, label_col = identify_columns(df)

        # Clean and prepare
        X, y = clean_and_prepare(df, text_col, label_col)

        # Train model
        rf_model, vectorizer, accuracy, X_test, y_test, y_pred = train_model(X, y)

        # Save models
        save_models(rf_model, vectorizer)

        # Save visualizations
        save_visualizations(df, label_col, y_test, y_pred, rf_model, vectorizer)

        # Test predictions
        test_predictions(rf_model, vectorizer)

        print("\n" + "=" * 60)
        print("✅ Model training complete!")
        print(f"🎯 Final Accuracy: {accuracy:.2%}")
        print("=" * 60)

    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
