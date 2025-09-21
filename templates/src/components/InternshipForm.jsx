import React, { useState } from 'react';
import PredModal from './PredModal'; // 👈 Import the modal

const InternshipForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    education: '',
    sector: '',
    mode: '',
    skills: '', // This will be a comma-separated string
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsModalOpen(true); // 👈 Open modal on submit
  };

  // Convert comma-separated skills string to array
  const skillArray = formData.skills
    ? formData.skills.split(',').map(s => s.trim()).filter(s => s)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4">
      {/* Background Pattern (optional) */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#60a5fa" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
            PM Internship Portal
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Complete your profile → Get AI-powered internship matches</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-10 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Priya Sharma"
                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Education</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g., B.Tech CSE, IIT Delhi"
                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Interested Sector</label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-200 bg-white"
                required
              >
                <option value="">Select Sector</option>
                <option value="Technology">Technology & AI</option>
                <option value="Finance">Finance & Economy</option>
                <option value="Healthcare">Healthcare & Biotech</option>
                <option value="Marketing">Marketing & Communications</option>
                <option value="Design">Design & UX</option>
                <option value="Education">Education & EdTech</option>
                <option value="Government">Public Policy & Governance</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Mode</label>
              <div className="flex flex-wrap gap-4">
                {['Remote', 'In-Person', 'Hybrid'].map(mode => (
                  <label key={mode} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="mode"
                      value={mode}
                      checked={formData.mode === mode}
                      onChange={handleChange}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700 font-medium">{mode}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Skills (comma separated)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., JavaScript, React, Python"
                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200"
            >
              🚀 Get My Internship Matches
            </button>

          </form>
        </div>
      </div>

      {/* ✅ MODAL HERE */}
      <PredModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        skills={skillArray} // 👈 Pass parsed skills array
      />

    </div>
  );
};

export default InternshipForm;