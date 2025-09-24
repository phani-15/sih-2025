import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
from flask import Flask, render_template, request, jsonify

# --- The User's Updated Recommender Class ---
class PMInternshipRecommender:
    def __init__(self, model_dir='trained_model'):
        """
        Initializes the recommender system.
        This system uses an unsupervised approach based on content similarity.
        """
        self.skill_vectorizer = TfidfVectorizer(max_features=100, stop_words='english', lowercase=True)
        self.education_vectorizer = TfidfVectorizer(max_features=50, stop_words='english', lowercase=True)
        self.is_trained = False
        self.model_dir = model_dir
        self.skill_vectorizer_path = os.path.join(self.model_dir, 'skill_vectorizer.pkl')
        self.education_vectorizer_path = os.path.join(self.model_dir, 'education_vectorizer.pkl')
        print("🎯 PM Internship Recommendation System Initialized")

    def _save_model(self):
        """Saves the trained TF-IDF vectorizers to disk."""
        try:
            print(f"\n💾 Saving trained model to '{self.model_dir}' directory...")
            os.makedirs(self.model_dir, exist_ok=True)
            with open(self.skill_vectorizer_path, 'wb') as f:
                pickle.dump(self.skill_vectorizer, f)
            with open(self.education_vectorizer_path, 'wb') as f:
                pickle.dump(self.education_vectorizer, f)
            print("✅ Model saved successfully.")
        except Exception as e:
            print(f"❌ Failed to save model: {e}")

    def load_model(self):
        """Loads pre-trained vectorizers from disk if they exist."""
        if os.path.exists(self.skill_vectorizer_path) and os.path.exists(self.education_vectorizer_path):
            try:
                print("\n🔄 Loading pre-trained model...")
                with open(self.skill_vectorizer_path, 'rb') as f:
                    self.skill_vectorizer = pickle.load(f)
                with open(self.education_vectorizer_path, 'rb') as f:
                    self.education_vectorizer = pickle.load(f)
                self.is_trained = True
                print("✅ Pre-trained model loaded successfully.")
                return True
            except Exception as e:
                print(f"❌ Failed to load model: {e}. Proceeding to train a new one.")
                return False
        return False

    def train_model(self, training_file):
        """
        Trains the vectorizers on a dataset to learn the vocabulary.
        """
        print("\n" + "="*60)
        print("          PHASE 1: MODEL TRAINING (First-time run)")
        print("="*60)
        try:
            df = pd.read_csv(training_file)
            print(f"📊 Loaded training dataset '{training_file}' with {len(df)} records.")
            required_columns = ['candidate_skills', 'candidate_education', 'required_skills', 'required_education']
            if not all(col in df.columns for col in required_columns):
                missing_cols = [col for col in required_columns if col not in df.columns]
                print(f"❌ Missing required columns in training file: {missing_cols}")
                return False

            for col in required_columns:
                df[col] = df[col].fillna('').astype(str).str.lower()
            
            all_skills = pd.concat([df['candidate_skills'], df['required_skills']]).unique()
            all_education = pd.concat([df['candidate_education'], df['required_education']]).unique()

            print("🔄 Training TF-IDF vectorizers...")
            self.skill_vectorizer.fit(all_skills)
            self.education_vectorizer.fit(all_education)

            self.is_trained = True
            print("✅ Model training completed successfully!")
            self._save_model()
            return True
        except FileNotFoundError:
            print(f"❌ Error: The training file '{training_file}' was not found.")
            return False
        except Exception as e:
            print(f"❌ Training failed: {e}")
            return False

    def calculate_similarities_and_score(self, candidate_skills, candidate_education,
                                         candidate_location, internship_skills,
                                         internship_education, internship_location):
        """
        Calculates skill/education similarities and a final weighted matching score.
        """
        cand_skill_vec = self.skill_vectorizer.transform([candidate_skills])
        intern_skill_vec = self.skill_vectorizer.transform([internship_skills])
        cand_edu_vec = self.education_vectorizer.transform([candidate_education])
        intern_edu_vec = self.education_vectorizer.transform([internship_education])

        skill_sim = cosine_similarity(cand_skill_vec, intern_skill_vec)[0, 0]
        edu_sim = cosine_similarity(cand_edu_vec, intern_edu_vec)[0, 0]
        location_match = candidate_location.strip().lower() == internship_location.strip().lower()
        location_boost = 0.15 if location_match else 0.0

        base_score = (0.6 * skill_sim) + (0.3 * edu_sim)
        final_score = min(1.0, base_score + location_boost)

        return {
            'skill_similarity': skill_sim,
            'education_similarity': edu_sim,
            'location_match': location_match,
            'final_score': final_score,
            'matching_percentage': round(final_score * 100, 2)
        }

    def get_recommendations(self, user_skills, user_education, user_location, internships_file):
        """Gets personalized recommendations for a user."""
        if not self.is_trained:
            print("❌ Model has not been trained. Cannot provide recommendations.")
            return []
        try:
            internships_df = pd.read_csv(internships_file)
            original_count = len(internships_df)
            internships_df.drop_duplicates(subset=['internship_title', 'internship_company', 'internship_location'], inplace=True, keep='first')
            if original_count > len(internships_df):
                print(f"🧹 Found and removed {original_count - len(internships_df)} duplicate listings.")
            
            required_cols = ['internship_title', 'internship_company', 'internship_location', 'required_skills', 'required_education']
            for col in required_cols:
                internships_df[col] = internships_df[col].fillna('').astype(str).str.lower()
        except FileNotFoundError:
             print(f"❌ Error: The internships file '{internships_file}' was not found.")
             return []
        except Exception as e:
            print(f"❌ Error loading internships file: {e}")
            return []

        recommendations = []
        for _, internship in internships_df.iterrows():
            result = self.calculate_similarities_and_score(
                user_skills, user_education, user_location,
                internship['required_skills'], internship['required_education'], internship['internship_location']
            )
            skills_list = [s.strip() for s in internship.get('required_skills', '').split(',') if s.strip()]
            
            recommendations.append({
                'title': internship.get('internship_title', 'N/A').title(),
                'company': internship.get('internship_company', 'N/A').title(),
                'location': internship.get('internship_location', 'N/A').title(),
                'education': internship.get('required_education', 'N/A'),
                'skills': skills_list,
                'mode': internship.get('mode', 'In-Person'),
                'salary': internship.get('Stipend', 'No-Stipend'),
                'duration':internship.get('duration','data not coming'),
                **result
            })
        
        recommendations.sort(key=lambda x: (x['final_score'], x['skill_similarity']), reverse=True)
        return recommendations[:5]

# --- Flask App Setup ---
app = Flask(__name__)

# --- Global Variables ---
TRAINING_FILE = 'training_data.csv'
INTERNSHIPS_FILE = 'available_internships.csv'
recommender = PMInternshipRecommender()

# --- App Initialization ---
with app.app_context():
    if not recommender.load_model():
        print(f"\nPre-trained model not found. Attempting to train a new model from '{TRAINING_FILE}'...")
        if not recommender.train_model(TRAINING_FILE):
            print("❌ FATAL: Model training failed. The application may not work as expected.")

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

        if not user_skills or not user_education:
            return jsonify({'error': "Please enter your skills and education background."}), 400

        recommendations = recommender.get_recommendations(user_skills, user_education, user_location, INTERNSHIPS_FILE)
        return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)

