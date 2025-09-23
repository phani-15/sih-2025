import React, { useState } from 'react';

const InternshipForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    education: '',
    university: '',
    institute: '',
    sector: '',
    mode: '',
    skills: '',
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    setIsModalOpen(true); // or API call
  };

  // Convert comma-separated skills string to array
  const skillArray = formData.skills
    ? formData.skills.split(',').map((s) => s.trim()).filter((s) => s)
    : [];

  // PredModal Component (embedded)
  const PredModal = ({ isOpen, onClose, skills = [] }) => {
    if (!isOpen) return null;

    const preds = [
      {
        education: "PG",
        skills: ["JavaScript", "React", "Node.js"],
        location: "New York",
        mode: "online",
        jobRole: "Full Stack Developer",
        company: "Tech Solutions Inc.1",
        salary: "$120,000"
      },
      {
        education: "UG",
        skills: ["JavaScript", "Angular", "Express.js"],
        location: "Kolanapalli",
        mode: "online",
        jobRole: "Full Stack Developer",
        company: "Tech Solutions Inc.2",
        salary: "$120,000"
      },
      {
        education: "UG",
        skills: ["Mongoose", "Angular", "Express.js","javascript"],
        location: "Hyderabad",
        mode: "online",
        jobRole: "Full Stack Developer",
        company: "Tech Solutions Inc.3",
        salary: "$120,000"
      },
      {
        education: "12th",
        skills: ["JavaScript", "Java", "Python"],
        location: "New Delhi",
        mode: "online",
        jobRole: "Full Stack Developer",
        company: "Tech Solutions Inc.4",
        salary: "$120,000"
      },
      {
        education: "b-tech",
        skills: ["JavaScript", "Java", "Python","Ml","AI"],
        location: "New Delhi",
        mode: "online",
        jobRole: "Full Stack Developer",
        company: "Tech Solutions Inc.4",
        salary: "$120,000"
      }
    ];

    // Normalize skills (expecting an array of strings)
    const inputSkills = (skills || []).map(s => s.toLowerCase());

    // Skill badge component for reusability
    const SkillBadge = ({ skill }) => (
      <span className="inline-block bg-blue-50 text-blue-700 text-xs font-medium mr-2 px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100 transition">
        {skill}
      </span>
    );

    // Filter matching jobs
    const filteredPreds = preds.filter(p =>
      p.skills.some(skill => inputSkills.includes(skill.toLowerCase()))
    );

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-60 backdrop-blur-sm">
        <div className="relative w-full  min-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 animate-fadeIn">

          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white"> Your Matching Internships</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-800 mb-3 mt-5 text-center">
                      Matching Job Opportunities
                    </h1>
          {/* Modal Body with Scroll */}
          <div className="p-6 overflow-y-auto max-h-[75vh] flex justify-around flex-wrap xl:flex-nowrap">
            

            {filteredPreds.length > 0 ? (
              filteredPreds.map((p, index) => (
                <div
                  key={index}
                  className="group w-[300px] flex flex-col  bg-white border border-gray-100 rounded-2xl shadow-lg hover:shadow-2xl p-6 mb-6 transform hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Header Section */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800 group-hover:text-blue-600 transition">
                        {p.jobRole}
                      </h2>
                      <p className="text-lg text-gray-600 font-medium">{p.company}</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {p.mode.charAt(0).toUpperCase() + p.mode.slice(1)}
                    </div>
                  </div>

                  {/* Salary Tag */}
                  <div className="bg-gradient-to-r from-green-400 to-teal-500 w-fit text-white font-bold px-4 py-2 rounded-full mb-4 shadow-md">
                    {p.salary} / year
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-sm text-gray-700">
                    <div>
                      <strong className="text-gray-500">📍 Location:</strong> {p.location}
                    </div>
                    <div>
                      <strong className="text-gray-500">🎓 Education:</strong> {p.education}
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div className="mt-4">
                    <p className="text-gray-500 text-sm font-medium mb-2">🔧 Required Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {p.skills.map((skill, i) => (
                        <SkillBadge key={i} skill={skill} />
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-6">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300">
                      Apply Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-medium text-gray-500">No matching jobs found</h3>
                <p className="text-gray-400 mt-2">Try adjusting your skills or check back later.</p>
              </div>
            )}
          </div>

          {/* Close Button at Bottom (Optional) */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-right">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              Close
            </button>
          </div>

        </div>

        {/* Global Styles for Animation */}
        <style jsx global>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold">PM Internship</h2>
        </div>
        <nav className="hidden md:flex space-x-4 font-semibold text-gray-700">
          <a href="#">FAQs</a>
          <a href="#">Guidelines</a>
          <a href="#">Partner Companies</a>
          <a href="#">Manuals</a>
          <a href="#">Tutorials/Guidance Videos</a>
        </nav>
        <div className="flex space-x-2">
          <button className="bg-orange-200 px-4 py-2 rounded">Apply Insurance</button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded">My Bharat Portal</button>
        </div>
      </header>

      {/* Container */}
      <div className="flex lg:flex-row flex-col gap-6 p-6">
        {/* Left Panel */}
        <div className="bg-white border rounded-lg p-4">
          <img
            src="https://via.placeholder.com/100"
            alt="Profile"
            className="rounded-full mx-auto mb-4"
          />
          <h3 className="text-center font-bold">Polavarapu Phani Durga Mani Srinivasa Rao</h3>
          <p className="text-center">21 Yrs</p>
          <p className="text-center">
            Profile Completed: <span className="font-semibold">50%</span>
          </p>
          <p className="text-center mb-4">Konaseema, ANDHRA PRADESH</p>

          <a href="#" className="block bg-gray-100 text-center rounded py-2 mb-2">
            View Profile / CV
          </a>
          <a href="#" className="block bg-gray-100 text-center rounded py-2 mb-2">
            Change Password
          </a>
          <a href="#" className="block bg-gray-100 text-center rounded py-2 mb-2">
            Sign Out
          </a>

          <div className="mt-6 border rounded p-4 bg-gray-50">
            <h4 className="font-semibold mb-2">File a Grievance</h4>
            <button className="w-full bg-red-600 text-white py-2 rounded">New Grievance</button>
            <p className="mt-3">Grievance Status</p>
            <p>Pending: 0</p>
            <p>Disposed: 0</p>
          </div>
        </div>

        {/* Center Panel */}
        <div className=" bg-white border rounded-lg p-6">
          {/* Status Bar */}
          <div className="flex justify-between text-xs text-center mb-6">
            <span className="flex-1">Registration</span>
            <span className={`flex-1`}>
              Profile
            </span>
            <span className="flex-1">My Applications</span>
            <span className="flex-1">Offer Received</span>
            <span className="flex-1">Offer Accepted</span>
            <span className="flex-1">Physically Joined</span>
            <span className="flex-1">Internship Started</span>
            <span className="flex-1">Internship Completed</span>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="education" className="block font-semibold">Enter your Higher Education</label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g., B.Tech CSE, IIT Delhi"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block font-semibold">Name of Board / University *</label>
              <input
                type="text"
                name="university"
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold">Name of Institute *</label>
              <input
                type="text"
                name="institute"
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold">Interested Sector</label>
              <select
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
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
              <label className="block font-semibold">Preferred Mode</label>
              <div className="flex flex-wrap gap-4">
                {['Remote', 'In-Person', 'Hybrid'].map((mode) => (
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
              <label className="block font-semibold">Skills (comma separated)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., JavaScript, React, Python"
                className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-300 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-6 space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded"
              >
                Find Internships
              </button>
            </div>
          </form>
        </div>

        {/* Right Panel */}
        <div className=" bg-white border rounded-lg p-4">
          <h3 className="font-bold mb-4">Notifications</h3>
          <div className="mb-4">
            <h4 className="text-red-600 font-semibold text-sm">
              Action Required - How to Join after Accepting Your PM Inter...
            </h4>
            <small className="text-gray-500">June 2, 2025 at 14:45</small>
            <p className="text-xs mt-1">
              How to Join, after you have accepted your offer letter: 1. ...
            </p>
          </div>
          <div>
            <h4 className="text-red-600 font-semibold text-sm">
              Action Required – How to Accept Your PM Internship Offer
            </h4>
            <small className="text-gray-500">June 2, 2025 at 14:42</small>
            <p className="text-xs mt-1">
              Dear Candidate, To accept your internship offer, please fol...
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4 text-sm">
        © PM Internship Scheme, MCA. All Rights Reserved. | Technical collaboration with BISAG-N
      </footer>

      {/* Prediction Modal */}
      {isModalOpen && (
        <PredModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          skills={skillArray}
        />
      )}
    </div>
  );
};

export default InternshipForm;