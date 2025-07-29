 
import React, { useState, useEffect } from 'react';
import { CheckCircle, Settings, AlertCircle } from 'lucide-react';
import { finalizeTest } from '../api';

const FinalizeTest = ({ questions, onNavigate, onDataPass }) => {
  const [testLink, setTestLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!questions || questions.length === 0) onNavigate('generate');
  }, []);

  const handleFinalize = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await finalizeTest(questions);
      onNavigate('success', data.test_link);

      onDataPass('testQuestions', questions);
    } catch {
      setError('Error finalizing test');
    } finally {
      setLoading(false);
    }
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
            <p className="text-gray-600 mb-8">Your test is now ready. Share this link with candidates:</p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm font-mono text-gray-800 break-all">{testLink}</p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={copyToClipboard}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors
"
              >
                Copy Link
              </button>
              <button
                onClick={() => onNavigate('generate')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors
"
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
            <p className="text-gray-600">Review the generated questions before finalizing</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <div className="space-y-6 mb-8">
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
              className="!bg-blue-600 hover:!bg-blue-700 disabled:!bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center mx-auto"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Finalizing Test...
                </>
              ) : (
                'Finalize Test'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


export default FinalizeTest;