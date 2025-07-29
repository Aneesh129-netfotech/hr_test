import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const TestSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const testLink = location.state?.testLink;

  if (!testLink) {
    navigate('/');
    return null;
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(testLink).then(() => {
      alert('Link copied to clipboard!');
    });
  };

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
              className="!bg-blue-600 hover:!bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Copy Link
            </button>
            <button
              onClick={() => navigate('/')}
              className="!bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Another Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSuccess;
