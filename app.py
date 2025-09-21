import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics.pairwise import cosine_similarity
from scipy.sparse import hstack
import warnings
warnings.filterwarnings('ignore')

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# ===========================
# GLOBAL MODEL INITIALIZATION
# ===========================

# Load company data ONCE at startup (you can also load from file)
# For demo, we'll create sample company data — REPLACE with your real data
COMPANIES_CSV_PATH = "companies.csv"  # <-- CHANGE TO YOUR PATH
CANDIDATES_CSV_PATH = "candidates.csv"  # <-- Optional, for training

# Initialize recommender and train once
recommender = None
company_features = None
companies_df = None

class InternshipRecommendationSystem:
    def __init__(self):
        self.tfidf_skills = TfidfVectorizer(max_features=100, stop_words='english', lowercase=True)
        self.tfidf_education = TfidfVectorizer(max_features=50, stop_words='english', lowercase=True)
        self.tfidf_sector = TfidfVectorizer(max_features=30, stop_words='english', lowercase=True)
        self.onehot_mode = OneHotEncoder(sparse_output=True, handle_unknown='ignore')
        self.onehot_location = OneHotEncoder(sparse_output=True, handle_unknown='ignore')
        self.is_fitted = False

    def load_data(self, candidates_file_path, companies_file_path):
        candidates_df = pd.read_csv(candidates_file_path)
        companies_df = pd.read_csv(companies_file_path)
        print(f"✅ Loaded {len(candidates_df)} candidates")
        print(f"✅ Loaded {len(companies_df)} companies")
        return candidates_df, companies_df

    def preprocess_data(self, df, is_candidate=True):
        df_clean = df.copy()
        text_columns = ['skills', 'education', 'sector']
        categorical_columns = ['mode', 'location']

        for col in text_columns:
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].fillna('').astype(str).str.lower().str.strip()
                df_clean[col] = df_clean[col].str.replace(r'\s+', ' ', regex=True)

        for col in categorical_columns:
            if col in df_clean.columns:
                df_clean[col] = df_clean[col].fillna('unknown').astype(str).str.lower().str.strip()

        return df_clean

    def encode_features(self, candidates_df, companies_df, fit_encoders=True):
        if fit_encoders:
            all_skills = list(candidates_df['skills']) + list(companies_df['skills'])
            all_education = list(candidates_df['education']) + list(companies_df['education'])
            all_sectors = list(candidates_df['sector']) + list(companies_df['sector'])

            self.tfidf_skills.fit(all_skills)
            self.tfidf_education.fit(all_education)
            self.tfidf_sector.fit(all_sectors)

            all_modes = list(candidates_df['mode']) + list(companies_df['mode'])
            all_locations = list(candidates_df['location']) + list(companies_df['location'])

            self.onehot_mode.fit(np.array(all_modes).reshape(-1, 1))
            self.onehot_location.fit(np.array(all_locations).reshape(-1, 1))
            self.is_fitted = True

        candidate_features = self._encode_single_dataset(candidates_df)
        company_features = self._encode_single_dataset(companies_df)
        return candidate_features, company_features

    def _encode_single_dataset(self, df):
        skills_tfidf = self.tfidf_skills.transform(df['skills'])
        education_tfidf = self.tfidf_education.transform(df['education'])
        sector_tfidf = self.tfidf_sector.transform(df['sector'])
        mode_onehot = self.onehot_mode.transform(df[['mode']])
        location_onehot = self.onehot_location.transform(df[['location']])
        features = hstack([skills_tfidf, education_tfidf, sector_tfidf, mode_onehot, location_onehot])
        return features

    def compute_similarity(self, candidate_features, company_features):
        return cosine_similarity(candidate_features, company_features)

    def recommend_internships(self, similarity_matrix, top_k=5):
        recommendations = []
        for candidate_idx in range(similarity_matrix.shape[0]):
            candidate_similarities = similarity_matrix[candidate_idx]
            top_company_indices = np.argsort(candidate_similarities)[::-1][:top_k]
            top_scores = candidate_similarities[top_company_indices]
            candidate_recommendations = []
            for company_idx, score in zip(top_company_indices, top_scores):
                candidate_recommendations.append({
                    'company_index': int(company_idx),
                    'similarity_score': float(score)
                })
            recommendations.append(candidate_recommendations)
        return recommendations

# ===========================
# INITIALIZE MODEL ON STARTUP
# ===========================

def init_model():
    global recommender, company_features, companies_df

    try:
        # Load data
        candidates_df, companies_df = recommender.load_data(CANDIDATES_CSV_PATH, COMPANIES_CSV_PATH)

        # Preprocess
        candidates_clean = recommender.preprocess_data(candidates_df, is_candidate=True)
        companies_clean = recommender.preprocess_data(companies_df, is_candidate=False)

        # Fit and encode
        candidate_features, company_features = recommender.encode_features(candidates_clean, companies_clean, fit_encoders=True)

        print("✅ Model initialized and trained successfully!")
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        # Fallback: create dummy data for demo if files not found
        print("⚠️  Using sample company data for demo...")
        companies_df = pd.DataFrame({
            'skills': ['python machine learning', 'java spring', 'javascript react', 'data analysis sql', 'c++ robotics'],
            'education': ['bachelor computer science', 'bachelor engineering', 'bachelor it', 'master data science', 'bachelor robotics'],
            'mode': ['remote', 'onsite', 'hybrid', 'remote', 'onsite'],
            'location': ['new york', 'san francisco', 'austin', 'chicago', 'seattle'],
            'sector': ['tech', 'finance', 'healthcare', 'ecommerce', 'automotive']
        })
        # Create a dummy candidate to fit encoders
        dummy_candidate = pd.DataFrame({
            'skills': ['python'],
            'education': ['bachelor'],
            'mode': ['remote'],
            'location': ['unknown'],
            'sector': ['tech']
        })
        candidates_clean = recommender.preprocess_data(dummy_candidate, is_candidate=True)
        companies_clean = recommender.preprocess_data(companies_df, is_candidate=False)
        _, company_features = recommender.encode_features(candidates_clean, companies_clean, fit_encoders=True)
        print("✅ Demo model initialized with sample data.")

@app.before_request
def before_first_request():
    global recommender
    recommender = InternshipRecommendationSystem()
    init_model()

# ===========================
# FLASK ROUTES
# ===========================

@app.route('/', methods=['GET'])
def hello_world():
    return render_template('index.html')

@app.route('/', methods=['POST'])
def predict():
    global recommender, company_features, companies_df

    try:
        # Get user input from form
        skills = request.form.get('skills', '').strip()
        education = request.form.get('education', '').strip()
        mode = request.form.get('mode', 'unknown').strip().lower()
        location = request.form.get('location', 'unknown').strip().lower()
        sector = request.form.get('sector', '').strip()

        # Validate input
        if not skills:
            return render_template('index.html', error="Skills field is required!")

        # Create single candidate DataFrame
        candidate_df = pd.DataFrame([{
            'skills': skills,
            'education': education,
            'mode': mode,
            'location': location,
            'sector': sector
        }])

        # Preprocess
        candidate_clean = recommender.preprocess_data(candidate_df, is_candidate=True)

        # Encode candidate (using already fitted encoders)
        candidate_features = recommender._encode_single_dataset(candidate_clean)

        # Compute similarity
        similarity_matrix = recommender.compute_similarity(candidate_features, company_features)

        # Get recommendations
        recommendations = recommender.recommend_internships(similarity_matrix, top_k=5)[0]  # Only 1 candidate

        # Enrich with company info
        enriched_recs = []
        for rec in recommendations:
            company_idx = rec['company_index']
            company = companies_df.iloc[company_idx]
            enriched_recs.append({
                'company_index': company_idx,
                'similarity_score': round(rec['similarity_score'], 3),
                'company_skills': company['skills'],
                'company_education': company['education'],
                'company_mode': company['mode'],
                'company_location': company['location'],
                'company_sector': company['sector'],
                'company_id': company.get('company_id', f"COMP{company_idx}")
            })

        return render_template('index.html', recommendations=enriched_recs, input_data={
            'skills': skills,
            'education': education,
            'mode': mode,
            'location': location,
            'sector': sector
        })

    except Exception as e:
        print(f"Error in prediction: {e}")
        return render_template('index.html', error=f"An error occurred: {str(e)}")

# Optional: API endpoint for AJAX
@app.route('/api/recommend', methods=['POST'])
def api_recommend():
    global recommender, company_features, companies_df

    try:
        data = request.get_json()
        skills = data.get('skills', '').strip()
        education = data.get('education', '').strip()
        mode = data.get('mode', 'unknown').strip().lower()
        location = data.get('location', 'unknown').strip().lower()
        sector = data.get('sector', '').strip()

        if not skills:
            return jsonify({'error': 'Skills field is required'}), 400

        candidate_df = pd.DataFrame([{
            'skills': skills,
            'education': education,
            'mode': mode,
            'location': location,
            'sector': sector
        }])

        candidate_clean = recommender.preprocess_data(candidate_df, is_candidate=True)
        candidate_features = recommender._encode_single_dataset(candidate_clean)
        similarity_matrix = recommender.compute_similarity(candidate_features, company_features)
        recommendations = recommender.recommend_internships(similarity_matrix, top_k=5)[0]

        enriched_recs = []
        for rec in recommendations:
            company_idx = rec['company_index']
            company = companies_df.iloc[company_idx]
            enriched_recs.append({
                'company_id': company.get('company_id', f"COMP{company_idx}"),
                'similarity_score': round(rec['similarity_score'], 3),
                'skills': company['skills'],
                'education': company['education'],
                'mode': company['mode'],
                'location': company['location'],
                'sector': company['sector']
            })

        return jsonify({'recommendations': enriched_recs})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5173, debug=True)