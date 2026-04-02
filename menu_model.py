import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib

# -----------------------------
# LOAD DATASET
# -----------------------------
df = pd.read_csv("ml/data/zomato.csv", encoding='latin1')

# -----------------------------
# SELECT REQUIRED COLUMNS
# -----------------------------
df = df[['Restaurant Name', 'Aggregate rating', 'Votes']]

# Drop missing values
df = df.dropna()

# Rename columns
df.rename(columns={
    'Restaurant Name': 'name',
    'Aggregate rating': 'rating',
    'Votes': 'popularity'
}, inplace=True)

# Convert to numeric
df['rating'] = pd.to_numeric(df['rating'], errors='coerce')
df['popularity'] = pd.to_numeric(df['popularity'], errors='coerce')

df = df.dropna()

# -----------------------------
# FEATURE SELECTION
# -----------------------------
X = df[['rating', 'popularity']]

# -----------------------------
# FEATURE SCALING (IMPORTANT)
# -----------------------------
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# -----------------------------
# K-MEANS CLUSTERING
# -----------------------------
kmeans = KMeans(n_clusters=3, random_state=42)
df['cluster'] = kmeans.fit_predict(X_scaled)

# -----------------------------
# SMART CLUSTER LABELING (FINAL)
# -----------------------------
cluster_summary = df.groupby('cluster')[['rating', 'popularity']].mean()

# Create score (rating + normalized popularity)
cluster_summary['score'] = (
    cluster_summary['rating'] +
    (cluster_summary['popularity'] / cluster_summary['popularity'].max())
)

# Sort clusters by score
cluster_order = cluster_summary.sort_values(
    'score', ascending=False
).index.tolist()

# Assign labels
label_map = {
    cluster_order[0]: "High",
    cluster_order[1]: "Medium",
    cluster_order[2]: "Low"
}

df['performance'] = df['cluster'].map(label_map)

# -----------------------------
# SAVE MODEL + SCALER
# -----------------------------
joblib.dump(kmeans, "menu_model.pkl")
joblib.dump(scaler, "scaler.pkl")

# Save output
df.to_csv("menu_clustered.csv", index=False)

# Output sample
print(df[['name', 'rating', 'popularity', 'performance']].head())
print("✅ Menu model trained successfully!")