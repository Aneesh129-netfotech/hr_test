import React, { useState } from 'react';
import { FileText, AlertCircle, Target, Hash, Zap, Award, Layers } from 'lucide-react';
import { generateTest } from '../api';

const GenerateTest = ({ onNavigate, onDataPass }) => {
  const [formData, setFormData] = useState({
  topic: '',
  difficulty: 'easy',
  num_questions: 5,
  question_type: 'mcq',  
});

const [mcqCount, setMcqCount] = useState('');
const [codingCount, setCodingCount] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const finalFormData = { ...formData };

      if (formData.question_type === 'mixed') {
        finalFormData.mcq_count = parseInt(mcqCount) || 0;
        finalFormData.coding_count = parseInt(codingCount) || 0;
        finalFormData.num_questions = finalFormData.mcq_count + finalFormData.coding_count;
      }

      const data = await generateTest(finalFormData);

      onNavigate('finalize', data.questions); // ✅ Navigate + pass questions
    } catch (err) {
      setError('Failed to generate test.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'num_questions') {
      // Handle empty string or invalid numbers
      const numValue = value === '' ? '' : parseInt(value);
      // Only update if it's empty string or a valid positive number
      if (value === '' || (!isNaN(numValue) && numValue > 0 && numValue <= 50)) {
        setFormData(prev => ({ ...prev, [name]: numValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  

  const difficultyOptions = [
    { 
      value: 'easy', 
      label: 'Easy', 
      color: 'text-emerald-700', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200',
      description: 'Basic level questions'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      color: 'text-amber-700', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200',
      description: 'Intermediate level questions'
    },
    { 
      value: 'hard', 
      label: 'Hard', 
      color: 'text-red-700', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      description: 'Advanced level questions'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-700 rounded-lg shadow-sm mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Generate Assessment
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create customized tests with AI-powered question generation
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-700 px-8 py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-slate-600 p-2 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Test Configuration</h2>
                <p className="text-slate-300">Configure your assessment parameters</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                <div className="flex-shrink-0 bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {/* Topic Input */}
              <div>
                <label className="flex items-center text-base font-semibold text-gray-900 mb-3">
                  <div className="bg-slate-600 p-1.5 rounded-md mr-2">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  Test Topic
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., JavaScript Fundamentals, Project Management, Data Structures"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Difficulty Selection */}
                <div>
                  <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
                    <div className="bg-slate-600 p-1.5 rounded-md mr-2">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    Difficulty Level
                  </label>
                  <div className="space-y-3">
                    {difficultyOptions.map((option) => (
                      <label key={option.value} className={`flex items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${formData.difficulty === option.value ? 'border-slate-500 bg-slate-50' : 'border-gray-200'}`}>
                        <input
                          type="radio"
                          name="difficulty"
                          value={option.value}
                          checked={formData.difficulty === option.value}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-slate-600 border-gray-300 focus:ring-slate-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-gray-900 font-medium">{option.label}</span>
                              <p className="text-gray-600 text-sm">{option.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-md text-xs font-medium ${option.bg} ${option.color}`}>
                              {option.label}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
                    <div className="bg-slate-600 p-1.5 rounded-md mr-2">
                      <Hash className="w-4 h-4 text-white" />
                    </div>
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    name="num_questions"
                    value={formData.num_questions}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      // Prevent backspace from navigating back when input is empty or at start
                      if (e.key === 'Backspace') {
                        e.stopPropagation();
                      }
                    }}
                    onFocus={(e) => {
                      // Select all text when focused for better UX
                      e.target.select();
                    }}
                    min="1"
                    max="50"
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-gray-900"
                    required
                  />
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm">Choose between 1-50 questions for your assessment</p>
                  </div>
                  
                  {/* Question Count Visualization */}
                  <div className="mt-3 grid grid-cols-10 gap-1">
                    {formData.num_questions && typeof formData.num_questions === 'number' && formData.num_questions > 0 && 
                      [...Array(Math.min(formData.num_questions, 50))].map((_, i) => (
                        <div key={i} className="h-1.5 bg-slate-400 rounded-full"></div>
                      ))
                    }
                  </div>
                </div>
              </div>

              {/* Question Type Selection */}
              <div>
                <label className="flex items-center text-base font-semibold text-gray-900 mb-4">
                  <div className="bg-slate-600 p-1.5 rounded-md mr-2">
                    <Layers className="w-4 h-4 text-white" />
                  </div>
                  Question Type
                </label>
                <div className="space-y-3">
                  {["mcq", "coding", "mixed"].map((type) => (
                    <label key={type} className={`flex items-center p-3 border rounded-lg cursor-pointer ${
                      formData.question_type === type ? 'border-slate-500 bg-slate-50' : 'border-gray-200'
                    }`}>
                      <input
                        type="radio"
                        name="question_type"
                        value={type}
                        checked={formData.question_type === type}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-slate-600 border-gray-300 focus:ring-slate-500"
                      />
                      <span className="ml-3 capitalize text-gray-900">{type} questions</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Conditional input for mixed type */}
              {formData.question_type === 'mixed' && (
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  {/* MCQ Count */}
                  <div>
                    <label className="block font-medium text-gray-800 mb-2">Number of MCQ Questions</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={mcqCount}
                      onChange={(e) => setMcqCount(e.target.value)}
                      placeholder="e.g., 3"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none"
                    />
                  </div>
                  {/* Coding Count */}
                  <div>
                    <label className="block font-medium text-gray-800 mb-2">Number of Coding Questions</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={codingCount}
                      onChange={(e) => setCodingCount(e.target.value)}
                      placeholder="e.g., 2"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}



              {/* Submit Button */}
              <div className="pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.topic.trim() || !formData.num_questions || formData.num_questions < 1}
                  className="w-full !bg-blue-600 hover:!bg-blue-700 disabled:!bg-gray-400 !text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center shadow-sm hover:shadow-md disabled:shadow-none text-base"

                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                      <span>Generating Assessment...</span>
                    </>
                  ) : (
                    <span>Generate Assessment</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: "AI-Powered Generation",
              description: "Advanced algorithms create relevant questions tailored to your topic",
              bgColor: "bg-white"
            },
            {
              icon: Award,
              title: "Customizable Settings",
              description: "Adjust difficulty levels and question count to meet your requirements",
              bgColor: "bg-white"
            },
            {
              icon: Layers,
              title: "Professional Format",
              description: "Clean, structured output suitable for educational and professional use",
              bgColor: "bg-white"
            }
          ].map((feature, index) => (
            <div key={index} className={`${feature.bgColor} rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">Powered by Advanced AI Technology</p>
        </div>
      </div>
    </div>
  );
};

export default GenerateTest;