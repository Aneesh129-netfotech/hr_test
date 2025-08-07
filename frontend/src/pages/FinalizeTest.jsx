import React, { useState, useEffect } from 'react';
import { CheckCircle, Settings, AlertCircle, Clock, Users, User, Mail, Percent, Edit, Trash2, Plus, Save, X } from 'lucide-react';
import { finalizeTest } from '../api';

const FinalizeTest = ({ questions, onNavigate, onDataPass }) => {
  const [testLink, setTestLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testDuration, setTestDuration] = useState(20);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [candidatesError, setCandidatesError] = useState('');
  
  // Edit state
  const [editableQuestions, setEditableQuestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newQuestionType, setNewQuestionType] = useState('mcq'); 

  useEffect(() => {
    if (!questions || questions.length === 0) onNavigate('generate');
    else setEditableQuestions([...questions]);
  }, [questions]);

  // Auth token and JD ID - Replace these with actual values
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4N2UwZDFkOGVkZWRlM2I1NDc4MDc0ZiIsImlhdCI6MTc1NDQ2MDU0MiwiZXhwIjoxNzU1MDY1MzQyfQ.wtD5KUk3viGRH-UIq2SdKByRBEZ67V1jMcqzizHNPQM';
  const jdId = '687f78395eb49db9c41cc272'; // Replace with actual JD ID

  // Fetch filtered candidates from API
  const fetchCandidates = async () => {
    setCandidatesLoading(true);
    setCandidatesError('');
    
    try {
      const response = await fetch(`http://localhost:5000/api/jd/filtered-resumes/${jdId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch candidates');
      }

      const data = await response.json();
      setCandidates(data.filteredResumes || []);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setCandidatesError('Failed to load candidates');
    } finally {
      setCandidatesLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(testLink);
    // You might want to add a toast notification here
  };

  const handleFinalize = async () => {
    setLoading(true);
    setError('');
    try {
      const testData = {
        questions: editableQuestions, // Use edited questions instead of original
        duration: testDuration
      };
      
      const data = await finalizeTest(testData);
      setTestLink(data.test_link);
      
      onDataPass('testQuestions', editableQuestions);
      onDataPass('testDuration', testDuration);
      
      await fetchCandidates();
    } catch (err) {
      console.error('Finalization error:', err);
      setError('Error finalizing test. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Edit functions
  const startEditingQuestion = (index) => {
    setEditingIndex(index);
    setShowCreateForm(false);
  };

  const saveEditedQuestion = (index, updatedQuestion) => {
    const updated = [...editableQuestions];
    updated[index] = updatedQuestion;
    setEditableQuestions(updated);
    setEditingIndex(-1);
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updated = editableQuestions.filter((_, i) => i !== index);
      setEditableQuestions(updated);
    }
  };

  const addNewQuestion = (newQuestion) => {
    setEditableQuestions([...editableQuestions, newQuestion]);
    setShowCreateForm(false);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };

  const getMatchPercentageColor = (percentage) => {
    if (percentage >= 70) return 'text-green-600 bg-green-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Format skills array for display
  const formatSkills = (skills) => {
    if (!skills || !Array.isArray(skills)) return 'No skills listed';
    
    // Join skills and limit display length
    const skillsText = skills.join(', ');
    return skillsText.length > 100 ? skillsText.substring(0, 100) + '...' : skillsText;
  };

  // Question Edit Component
  const QuestionEditor = ({ question, index, onSave, onCancel }) => {
    const [editedQuestion, setEditedQuestion] = useState({ ...question });

    const handleOptionChange = (optionIndex, value) => {
      const newOptions = [...(editedQuestion.options || [])];
      newOptions[optionIndex] = value;
      setEditedQuestion({ ...editedQuestion, options: newOptions });
    };

    const addOption = () => {
      const newOptions = [...(editedQuestion.options || []), ''];
      setEditedQuestion({ ...editedQuestion, options: newOptions });
    };

    const removeOption = (optionIndex) => {
      const newOptions = editedQuestion.options.filter((_, i) => i !== optionIndex);
      setEditedQuestion({ ...editedQuestion, options: newOptions });
    };

    return (
      <div className="border border-blue-300 rounded-lg p-6 bg-blue-50">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question:</label>
          <textarea
            value={editedQuestion.question}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
          />
        </div>

        {editedQuestion.options && editedQuestion.options.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Options:</label>
            {editedQuestion.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center mb-2">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={() => removeOption(optionIndex)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </button>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer:</label>
          <textarea
            value={editedQuestion.answer}
            onChange={(e) => setEditedQuestion({ ...editedQuestion, answer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="2"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSave(index, editedQuestion)}
            className="!bg-green-600 hover:!bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
          <button
            onClick={onCancel}
            className="!bg-gray-600 hover:!bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </button>
        </div>
      </div>
    );
  };

  // New Question Form Component
  const NewQuestionForm = ({ onSave, onCancel }) => {
    const [newQuestion, setNewQuestion] = useState({
      question: '',
      options: newQuestionType === 'mcq' ? ['', '', '', ''] : [],
      answer: '',
      type: newQuestionType
    });

    const handleOptionChange = (optionIndex, value) => {
      const newOptions = [...newQuestion.options];
      newOptions[optionIndex] = value;
      setNewQuestion({ ...newQuestion, options: newOptions });
    };

    const addOption = () => {
      setNewQuestion({ ...newQuestion, options: [...newQuestion.options, ''] });
    };

    const removeOption = (optionIndex) => {
      const newOptions = newQuestion.options.filter((_, i) => i !== optionIndex);
      setNewQuestion({ ...newQuestion, options: newOptions });
    };

    const handleTypeChange = (type) => {
      setNewQuestionType(type);
      setNewQuestion({
        question: '',
        options: type === 'mcq' ? ['', '', '', ''] : [],
        answer: '',
        type: type
      });
    };

    return (
      <div className="border border-green-300 rounded-lg p-6 bg-green-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Question</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question Type:</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="questionType"
                value="mcq"
                checked={newQuestionType === 'mcq'}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="mr-2"
              />
              Multiple Choice
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="questionType"
                value="coding"
                checked={newQuestionType === 'coding'}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="mr-2"
              />
              Coding
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Question:</label>
          <textarea
            value={newQuestion.question}
            onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows="3"
            placeholder={newQuestionType === 'coding' ? 'Enter coding problem description...' : 'Enter your question...'}
          />
        </div>

        {newQuestionType === 'mcq' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Options:</label>
            {newQuestion.options.map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center mb-2">
                <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(optionIndex, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                />
                {newQuestion.options.length > 2 && (
                  <button
                    onClick={() => removeOption(optionIndex)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addOption}
              className="text-green-600 hover:text-green-800 text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Option
            </button>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer:</label>
          <textarea
            value={newQuestion.answer}
            onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows="2"
            placeholder={newQuestionType === 'coding' ? 'Enter expected solution or key points...' : 'Enter correct answer...'}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onSave(newQuestion)}
            disabled={!newQuestion.question.trim() || !newQuestion.answer.trim()}
            className="!bg-green-600 hover:bg-green-700 disabled:!bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </button>
          <button
            onClick={onCancel}
            className="!bg-gray-600 hover:!bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <X className="w-4 h-4 mr-1" />
            Cancel
          </button>
        </div>
      </div>
    );
  };
 
  if (testLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Created Successfully!</h1>
              <p className="text-gray-600 mb-4">Your test is now ready. Share this link with candidates:</p>
            </div>
            
            {/* Test Duration Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-semibold">
                  Test Duration: {formatDuration(testDuration)}
                </span>
              </div>
              <p className="text-sm text-blue-600 text-center">
                Candidates will have {formatDuration(testDuration)} to complete this test
              </p>
            </div>
            
            {/* Test Link */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-mono text-gray-800 break-all text-center">{testLink}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-8">
              <button
                onClick={copyToClipboard}
                className="!bg-blue-600 hover:!bg-blue-700 !text-white px-6 py-2 rounded-lg transition-colors"
              >
                Copy Link
              </button>
              <button
                onClick={() => onNavigate('generate')}
                className="!bg-green-600 hover:!bg-green-700 !text-white px-6 py-2 rounded-lg transition-colors"
              >
                Create Another Test
              </button>
            </div>

            {/* Selected Applicants Section */}
            <div className="border-t pt-8">
              <div className="flex items-center mb-6">
                <Users className="w-6 h-6 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Selected Applicants</h2>
              </div>

              {candidatesLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
                  <span className="text-gray-600">Loading candidates...</span>
                </div>
              )}

              {candidatesError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                  <span className="text-red-700">{candidatesError}</span>
                </div>
              )}

              {!candidatesLoading && !candidatesError && candidates.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Name
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              Email
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center">
                              <Percent className="w-4 h-4 mr-2" />
                              Match %
                            </div>
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Skills
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {candidates.map((candidate, index) => (
                          <tr key={candidate._id || index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {candidate.name || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {candidate.email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchPercentageColor(candidate.matchPercentage)}`}>
                                {candidate.matchPercentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900" title={formatSkills(candidate.skills)}>
                                {formatSkills(candidate.skills)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {!candidatesLoading && !candidatesError && candidates.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No candidates found for this test</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!editableQuestions || editableQuestions.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Review & Finalize Test</h1>
            <p className="text-gray-600">Review, edit questions and set test duration before finalizing</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Test Duration Configuration */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Test Duration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={testDuration}
                  onChange={(e) => setTestDuration(Math.max(5, Math.min(180, parseInt(e.target.value) || 5)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  <p className="font-medium">Selected: {formatDuration(testDuration)}</p>
                  <p>Range: 5 minutes to 3 hours</p>
                </div>
              </div>
            </div>

            {/* Quick Duration Buttons */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Quick Select:</p>
              <div className="flex flex-wrap gap-2">
                {[10, 15, 20, 30, 45, 60, 90, 120].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setTestDuration(duration)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      testDuration === duration
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {formatDuration(duration)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Questions Review with Edit Capabilities */}
          <div className="space-y-6 mb-8">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Questions Review ({editableQuestions.length} questions)
              </h2>
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setEditingIndex(-1);
                }}
                className="!bg-green-600 hover:!bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Question
              </button>
            </div>
            
            {/* New Question Form */}
            {showCreateForm && (
              <NewQuestionForm
                onSave={addNewQuestion}
                onCancel={() => setShowCreateForm(false)}
              />
            )}
            
            {editableQuestions.map((question, index) => (
              <div key={index}>
                {editingIndex === index ? (
                  <QuestionEditor
                    question={question}
                    index={index}
                    onSave={saveEditedQuestion}
                    onCancel={() => setEditingIndex(-1)}
                  />
                ) : (
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 flex-1">
                        Question {index + 1}: {question.question}
                      </h3>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => startEditingQuestion(index)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit Question"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteQuestion(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {question.options && question.options.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Options:</p>
                        <ul className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <li key={optionIndex} className="flex items-center">
                              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="text-gray-700">{option}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="bg-green-50 border border-green-200 rounded p-3">
                      <p className="text-sm font-medium text-green-800">
                        <strong>Correct Answer:</strong> {question.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleFinalize}
              disabled={loading || editableQuestions.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center justify-center mx-auto shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Finalizing Test...
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Finalize Test ({formatDuration(testDuration)})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalizeTest;