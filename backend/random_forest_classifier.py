"""
Random Forest Classifier for Cyber Threat Classification
========================================================
Complete implementation using TF-IDF features
"""

# Step 1: Import RandomForestClassifier and required libraries
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report
import pandas as pd
import numpy as np
import pickle
import seaborn as sns
import matplotlib.pyplot as plt

print("[MODEL] Random Forest Classifier for Cyber Threat Classification")
print("=" * 60)

# Load and prepare data
print("\n[STEP 1] Loading and preparing data...")
df = pd.read_csv('data/cyber_threats_ml_ready.csv')
X = df['text']
y = df['label']

print(f"   [SUCCESS] Loaded {len(df)} samples")
print(f"   [CLASSES] Classes: {', '.join(y.unique())}")

# Split dataset (80% train, 20% test)
print("\n[STEP 2] Splitting dataset...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"   ✅ Training samples: {len(X_train)}")
print(f"   ✅ Test samples: {len(X_test)}")

# Create TF-IDF features
print("\n[STEP 3] Creating TF-IDF features...")
vectorizer = TfidfVectorizer(
    max_features=1000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.95
)

X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

print(f"   ✅ Feature matrix shape: {X_train_tfidf.shape}")
print(f"   📚 Vocabulary size: {len(vectorizer.vocabulary_)}")

# Step 2: Train Random Forest model on TF-IDF features
print("\n[STEP 4] Training Random Forest Classifier...")
rf_classifier = RandomForestClassifier(
    n_estimators=100,       # Number of trees
    random_state=42,        # For reproducibility
    max_depth=10,           # Prevent overfitting
    min_samples_split=5,    # Minimum samples to split
    min_samples_leaf=2,     # Minimum samples in leaf
    n_jobs=-1               # Use all available cores
)

print(f"   🔧 Model parameters:")
print(f"      - Number of trees: 100")
print(f"      - Max depth: 10")
print(f"      - Min samples split: 5")
print(f"      - Min samples leaf: 2")

# Train the model
rf_classifier.fit(X_train_tfidf, y_train)
print(f"   ✅ Random Forest model trained successfully!")

# Step 3: Predict on test data
print("\n[STEP 5] Making predictions on test data...")
y_pred = rf_classifier.predict(X_test_tfidf)
y_pred_proba = rf_classifier.predict_proba(X_test_tfidf)

print(f"   ✅ Predictions completed for {len(y_test)} samples")

# Step 4: Print accuracy
print("\n[STEP 6] Model Performance Metrics:")
print("=" * 60)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f"\n🎯 ACCURACY: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Print confusion matrix
print(f"\n📊 CONFUSION MATRIX:")
cm = confusion_matrix(y_test, y_pred)
print(cm)

# Create detailed confusion matrix with labels
classes = sorted(y.unique())
print(f"\nDetailed Confusion Matrix:")
print(f"{'':>12}", end="")
for cls in classes:
    print(f"{cls:>10}", end="")
print()

for i, true_label in enumerate(classes):
    print(f"{true_label:>12}", end="")
    for j, pred_label in enumerate(classes):
        print(f"{cm[i][j]:>10}", end="")
    print()

# Print classification report
print(f"\n[REPORT] CLASSIFICATION REPORT:")
report = classification_report(y_test, y_pred)
print(report)

# Additional metrics
print(f"\n📈 Additional Metrics:")
print(f"   - Training accuracy: {rf_classifier.score(X_train_tfidf, y_train):.4f}")
print(f"   - Test accuracy: {accuracy:.4f}")
print(f"   - Number of features used: {X_train_tfidf.shape[1]}")

# Feature importance analysis
print(f"\n🔍 Top 15 Most Important Features:")
feature_names = vectorizer.get_feature_names_out()
feature_importance = rf_classifier.feature_importances_
feature_indices = np.argsort(feature_importance)[::-1]

for i in range(15):
    idx = feature_indices[i]
    print(f"   {i+1:2d}. {feature_names[idx]:25s} (importance: {feature_importance[idx]:.4f})")

# Step 5: Save trained model using pickle
print(f"\n7️⃣ Saving trained model...")

# Save Random Forest model
rf_model_path = 'data/models/random_forest_classifier.pkl'
with open(rf_model_path, 'wb') as f:
    pickle.dump(rf_classifier, f)
print(f"   ✅ Random Forest model saved to: {rf_model_path}")

# Save TF-IDF vectorizer
vectorizer_path = 'data/models/tfidf_vectorizer.pkl'
with open(vectorizer_path, 'wb') as f:
    pickle.dump(vectorizer, f)
print(f"   ✅ TF-IDF vectorizer saved to: {vectorizer_path}")

# Save complete pipeline
pipeline_data = {
    'model': rf_classifier,
    'vectorizer': vectorizer,
    'classes': classes,
    'feature_names': feature_names,
    'accuracy': accuracy
}

pipeline_path = 'data/models/threat_classification_pipeline.pkl'
with open(pipeline_path, 'wb') as f:
    pickle.dump(pipeline_data, f)
print(f"   ✅ Complete pipeline saved to: {pipeline_path}")

# Create visualization of confusion matrix
print(f"\n8️⃣ Creating confusion matrix visualization...")
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=classes, yticklabels=classes)
plt.title('Random Forest - Confusion Matrix', fontsize=14, fontweight='bold')
plt.xlabel('Predicted Label', fontsize=12)
plt.ylabel('True Label', fontsize=12)
plt.tight_layout()
plt.savefig('data/random_forest_confusion_matrix.png', dpi=300, bbox_inches='tight')
print(f"   ✅ Confusion matrix saved to: data/random_forest_confusion_matrix.png")
plt.close()

# Test loaded model
print(f"\n9️⃣ Testing saved model...")
with open(rf_model_path, 'rb') as f:
    loaded_model = pickle.load(f)

with open(vectorizer_path, 'rb') as f:
    loaded_vectorizer = pickle.load(f)

# Test prediction with loaded model
sample_texts = [
    "urgent account verification required click link immediately",
    "malware detected on system remove virus now",
    "ddos attack overwhelming server resources",
    "security update completed successfully"
]

print(f"   🧪 Testing with sample predictions:")
for text in sample_texts:
    text_vector = loaded_vectorizer.transform([text])
    prediction = loaded_model.predict(text_vector)[0]
    probability = loaded_model.predict_proba(text_vector)[0]
    confidence = max(probability)

    print(f"      Text: '{text[:40]}...'")
    print(f"      Prediction: {prediction} (confidence: {confidence:.4f})")
    print()

print("=" * 60)
print("✅ Random Forest Classification Complete!")
print("=" * 60)

print(f"\n📊 SUMMARY:")
print(f"   🎯 Model Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
print(f"   🌲 Trees in Forest: {rf_classifier.n_estimators}")
print(f"   📚 Features Used: {X_train_tfidf.shape[1]}")
print(f"   💾 Models Saved: 3 files")
print(f"   📈 Ready for Production!")