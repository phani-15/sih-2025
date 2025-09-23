import React from 'react';

export default function PredModal({ isOpen, onClose, skills = [] }) {
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
}