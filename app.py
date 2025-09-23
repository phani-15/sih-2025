import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import matplotlib
matplotlib.use('Agg')  # Use a non-interactive backend for Matplotlib
import matplotlib.pyplot as plt
import seaborn as sns
import pickle
import os
from flask import Flask, render_template, request, url_for, jsonify

class PMInternshipRecommender:
    def __init__(self, model_dir='trained_model'):
        """
        Initializes the recommender.
        """
        self.skill_vectorizer = TfidfVectorizer(max_features=100, stop_words='english', lowercase=True)
        self.education_vectorizer = TfidfVectorizer(max_features=50, stop_words='english', lowercase=True)
        self.is_trained = False
        self.training_data = None
        self.evaluation_results = None
        self.model_dir = model_dir
        self.skill_vectorizer_path = os.path.join(self.model_dir, './skill_vectorizer.pkl')
        self.education_vectorizer_path = os.path.join(self.model_dir, './education_vectorizer.pkl')
        print("🎯 PM Internship Recommendation System Initialized")

    def _save_model(self):
        """Saves the trained vectorizers to disk."""
        try:
            os.makedirs(self.model_dir, exist_ok=True)
            with open(self.skill_vectorizer_path, 'wb') as f: pickle.dump(self.skill_vectorizer, f)
            with open(self.education_vectorizer_path, 'wb') as f: pickle.dump(self.education_vectorizer, f)
            print("✅ Model saved successfully.")
        except Exception as e:
            print(f"❌ Failed to save model: {e}")

    def load_or_train(self, training_file):
        """Loads a pre-trained model or trains a new one if not found."""
        if os.path.exists(self.skill_vectorizer_path) and os.path.exists(self.education_vectorizer_path):
            try:
                print("\n🔄 Loading pre-trained model...")
                with open(self.skill_vectorizer_path, 'rb') as f: self.skill_vectorizer = pickle.load(f)
                with open(self.education_vectorizer_path, 'rb') as f: self.education_vectorizer = pickle.load(f)
                self.is_trained = True
                print("✅ Pre-trained model loaded successfully.")
                if os.path.exists(training_file):
                    self.training_data = pd.read_csv(training_file)
                return True
            except Exception as e:
                print(f"❌ Failed to load model: {e}. Proceeding with training.")
        
        print("\n" + "="*60)
        print("          PHASE 1: MODEL TRAINING (First time run)")
        print("="*60)
        return self.train_model(training_file)

    def train_model(self, training_file):
        """Trains the model on historical data and saves it."""
        try:
            df = pd.read_csv(training_file)
            print(f"📊 Loaded training dataset: {len(df)} records")
            self.training_data = df
            
            required_columns = ['candidate_skills', 'candidate_education', 'candidate_location',
                                'required_skills', 'required_education', 'internship_location']
            if not all(col in df.columns for col in required_columns):
                print(f"❌ Missing required columns.")
                return False

            for col in required_columns: df[col] = df[col].fillna('').astype(str).str.lower()
            
            all_skills = pd.concat([df['candidate_skills'], df['required_skills']]).unique()
            all_education = pd.concat([df['candidate_education'], df['required_education']]).unique()

            print("🔄 Training TF-IDF vectorizers...")
            self.skill_vectorizer.fit(all_skills)
            self.education_vectorizer.fit(all_education)

            self.is_trained = True
            print("✅ Model training completed successfully!")
            self._save_model()
            return True
        except Exception as e:
            print(f"❌ Training failed: {e}")
            return False

    def calculate_similarities_and_score(self, candidate_skills, candidate_education,
                                         candidate_location, internship_skills,
                                         internship_education, internship_location):
        """Calculates similarities and the final matching score."""
        cand_skill_vec = self.skill_vectorizer.transform([candidate_skills])
        intern_skill_vec = self.skill_vectorizer.transform([internship_skills])
        cand_edu_vec = self.education_vectorizer.transform([candidate_education])
        intern_edu_vec = self.education_vectorizer.transform([internship_education])

        skill_sim = cosine_similarity(cand_skill_vec, intern_skill_vec)[0, 0]
        edu_sim = cosine_similarity(cand_edu_vec, intern_edu_vec)[0, 0]
        location_match = candidate_location.lower().strip() == internship_location.lower().strip()
        location_boost = 0.15 if location_match else 0.0

        base_score = (0.6 * skill_sim) + (0.3 * edu_sim)
        final_score = min(1.0, base_score + location_boost)

        return {'skill_similarity': skill_sim, 'education_similarity': edu_sim, 'location_match': location_match,
                'final_score': final_score, 'matching_percentage': round(final_score * 100, 2)}

    def get_recommendations(self, user_skills, user_education, user_location, internships_file):
        """Gets personalized recommendations for a user."""
        if not self.is_trained:
            print("❌ Model not trained yet!")
            return None
        try:
            internships_df = pd.read_csv(internships_file)
            internships_df.drop_duplicates(subset=['internship_title', 'internship_company', 'internship_location'], inplace=True, keep='first')
            print(f"🧹 Recommending from {len(internships_df)} unique internships.")
            
            internships_df['required_skills'] = internships_df['required_skills'].fillna('').astype(str).str.lower()
            internships_df['required_education'] = internships_df['required_education'].fillna('').astype(str).str.lower()
            internships_df['internship_location'] = internships_df['internship_location'].fillna('').astype(str).str.lower()
        except Exception as e:
            print(f"❌ Error loading internships file: {e}")
            return None

        recommendations = []
        for _, internship in internships_df.iterrows():
            result = self.calculate_similarities_and_score(
                user_skills, user_education, user_location,
                internship['required_skills'], internship['required_education'], internship['internship_location'])
            
            # --- FIX 2: Split skills string into a list for the frontend ---
            skills_list = [s.strip() for s in internship.get('required_skills', '').split(',') if s.strip()]

            recommendations.append({
                'title': internship.get('internship_title', 'N/A'),
                'company': internship.get('internship_company', 'N/A'),
                'location': internship.get('internship_location', 'N/A'),
                'education': internship.get('required_education', 'N/A'),
                'skills': skills_list, # Use the list here
                'mode': internship.get('mode', 'In-Person'),
                'salary': internship.get('salary', 'Competitive'),
                **result
            })
        
        recommendations.sort(key=lambda x: (x['final_score'], x['skill_similarity']), reverse=True)
        return recommendations[:5]

# --- Flask App ---
app = Flask(__name__)

# --- Global Variables ---
TRAINING_FILE = 'training.csv'
INTERNSHIPS_FILE = 'internships.csv'
recommender = PMInternshipRecommender()

# --- App Initialization ---
with app.app_context():
    if not recommender.load_or_train(TRAINING_FILE):
        print("FATAL: Model could not be loaded or trained. The app might not work correctly.")

# --- Flask Routes ---
@app.route('/')
def index():
    """Renders the main page with the input form."""
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
def recommend():
    """Handles form submission and returns recommendations as JSON."""
    if request.method == 'POST':
        user_skills = request.form.get('skills', '').lower()
        user_education = request.form.get('education', '').lower()
        user_location = request.form.get('location', '').lower()

        if not user_skills and not user_education:
             # Return a JSON error message with a 400 status code
             return jsonify({'error': "Please enter your skills and education background."}), 400

        recommendations = recommender.get_recommendations(user_skills, user_education, user_location, INTERNSHIPS_FILE)

        # Return the list of recommendations as a JSON response
        return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)

