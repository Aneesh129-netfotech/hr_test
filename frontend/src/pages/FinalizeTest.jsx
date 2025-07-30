import React, { useState, useEffect } from 'react';
import { CheckCircle, Settings, AlertCircle, Clock } from 'lucide-react';
import { finalizeTest } from '../api';

const FinalizeTest = ({ questions, onNavigate, onDataPass }) => {
  const [testLink, setTestLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testDuration, setTestDuration] = useState(20); // Default 20 minutes

  useEffect(() => {
    if (!questions || questions.length === 0) onNavigate('generate');
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(testLink);
    // You might want to add a toast notification here
  };

  const handleFinalize = async () => {
    setLoading(true);
    setError('');
    try {
      // Pass the test duration along with questions
      const testData = {
        questions,
        duration: testDuration
      };
      
      const data = await finalizeTest(testData);
      setTestLink(data.test_link);
      
      // Pass both questions and duration to parent
      onDataPass('testQuestions', questions);
      onDataPass('testDuration', testDuration);
      
      // Don't navigate immediately, show the success state first
    } catch (err) {
      console.error('Finalization error:', err);
      setError('Error finalizing test. Please try again.');
    } finally {
      setLoading(false);
    }
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
 
  if (testLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Created Successfully!</h1>
            <p className="text-gray-600 mb-4">Your test is now ready. Share this link with candidates:</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-semibold">
                  Test Duration: {formatDuration(testDuration)}
                </span>
              </div>
              <p className="text-sm text-blue-600">
                Candidates will have {formatDuration(testDuration)} to complete this test
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-mono text-gray-800 break-all">{testLink}</p>
            </div>

            <div className="flex gap-4 justify-center">
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
          </div>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
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
            <p className="text-gray-600">Review the generated questions and set test duration before finalizing</p>
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

          {/* Questions Review */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              Questions Review ({questions.length} questions)
            </h2>
            
            {questions.map((question, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Question {index + 1}: {question.question}
                </h3>
                
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
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleFinalize}
              disabled={loading}
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