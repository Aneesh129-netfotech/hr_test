import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, Code, Play, Loader } from 'lucide-react';
import MonacoEditor from '@monaco-editor/react';
import { submitTest } from '../api';
import axios from 'axios';

const JUDGE0_API_KEY = import.meta.env.VITE_JUDGE0_API_KEY; // Move this to .env in production
const JUDGE0_HOST = 'judge0-ce.p.rapidapi.com';

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Updated language configurations with correct Judge0 IDs
const PROGRAMMING_LANGUAGES = [
  { 
    value: 'javascript', 
    label: 'JavaScript (Node.js)', 
    defaultCode: 'console.log("Hello, World!");', 
    judgeId: 63 
  },
  { 
    value: 'python', 
    label: 'Python 3', 
    defaultCode: 'print("Hello, World!")', 
    judgeId: 71 
  },
  { 
    value: 'java', 
    label: 'Java', 
    defaultCode: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}', 
    judgeId: 62 
  },
  { 
    value: 'cpp', 
    label: 'C++', 
    defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}', 
    judgeId: 54 
  },
  { 
    value: 'c', 
    label: 'C', 
    defaultCode: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}', 
    judgeId: 50 
  },
  { 
    value: 'csharp', 
    label: 'C#', 
    defaultCode: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, World!");\n    }\n}', 
    judgeId: 51 
  },
  { 
    value: 'php', 
    label: 'PHP', 
    defaultCode: '<?php\necho "Hello, World!\\n";\n?>', 
    judgeId: 68 
  },
  { 
    value: 'ruby', 
    label: 'Ruby', 
    defaultCode: 'puts "Hello, World!"', 
    judgeId: 72 
  },
  { 
    value: 'go', 
    label: 'Go', 
    defaultCode: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, World!")\n}', 
    judgeId: 60 
  },
  // Note: Some languages may not be available in all Judge0 instances
  { value: 'html', label: 'HTML', defaultCode: '<!-- HTML cannot be executed -->\n<h1>Hello, World!</h1>' },
  { value: 'css', label: 'CSS', defaultCode: '/* CSS cannot be executed */\nbody { color: blue; }' },
  { value: 'sql', label: 'SQL', defaultCode: '-- SQL execution requires database setup\nSELECT "Hello, World!" as message;', judgeId: 82 }
];

const GiveTest = ({ testQuestions, questionSetId, onNavigate }) => {
  const [answers, setAnswers] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [outputs, setOutputs] = useState({});
  const [runningCode, setRunningCode] = useState({}); // Track which code is running

  const questions = testQuestions || [];
  const error = null;

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleLanguageChange = (questionIndex, language) => {
    setSelectedLanguages(prev => ({ ...prev, [questionIndex]: language }));
    const selectedLang = PROGRAMMING_LANGUAGES.find(lang => lang.value === language);
    if (selectedLang) {
      setAnswers(prev => ({
        ...prev,
        [questionIndex]: selectedLang.defaultCode
      }));
      // Clear previous output when language changes
      setOutputs(prev => ({ ...prev, [questionIndex]: '' }));
    }
  };

  const handleRunCode = async (index) => {
    const langValue = selectedLanguages[index] || 'javascript';
    const sourceCode = answers[index] || '';
    const lang = PROGRAMMING_LANGUAGES.find(l => l.value === langValue);

    console.log('🚀 Running code for question', index);
    console.log('Language:', langValue, 'Judge ID:', lang?.judgeId);
    console.log('Source code:', sourceCode);

    if (!lang || !lang.judgeId) {
      setOutputs(prev => ({ 
        ...prev, 
        [index]: `⚠️ Code execution not supported for ${lang?.label || langValue}` 
      }));
      return;
    }

    if (!sourceCode.trim()) {
      setOutputs(prev => ({ ...prev, [index]: '⚠️ Please write some code first' }));
      return;
    }

    // Set loading state
    setRunningCode(prev => ({ ...prev, [index]: true }));
    setOutputs(prev => ({ ...prev, [index]: '🔄 Running code...' }));

    try {
      // Step 1: Submit code for execution
      console.log('📤 Submitting code to Judge0...');
      const submissionResponse = await axios.post(
        `https://${JUDGE0_HOST}/submissions`,
        {
          language_id: lang.judgeId,
          source_code: btoa(sourceCode), // Base64 encode the source code
          stdin: btoa(''), // Base64 encode empty stdin
        },
        {
          params: { 
            base64_encoded: 'true',
            fields: 'token,status,stdout,stderr,compile_output,message,time,memory'
          },
          headers: {
            'X-RapidAPI-Key': JUDGE0_API_KEY,
            'X-RapidAPI-Host': JUDGE0_HOST,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const { token } = submissionResponse.data;
      console.log('✅ Submission successful. Token:', token);

      if (!token) {
        throw new Error('No submission token received');
      }

      // Step 2: Poll for results
      let attempts = 0;
      const maxAttempts = 20; // Maximum 20 attempts (10 seconds)
      
      const pollResult = async () => {
        try {
          console.log(`🔍 Polling attempt ${attempts + 1}/${maxAttempts}`);
          
          const resultResponse = await axios.get(
            `https://${JUDGE0_HOST}/submissions/${token}`,
            {
              params: { 
                base64_encoded: 'true',
                fields: 'status,stdout,stderr,compile_output,message,time,memory'
              },
              headers: {
                'X-RapidAPI-Key': JUDGE0_API_KEY,
                'X-RapidAPI-Host': JUDGE0_HOST,
              },
              timeout: 5000
            }
          );

          const data = resultResponse.data;
          console.log('📥 Poll response:', data);

          // Status ID meanings:
          // 1: In Queue, 2: Processing, 3: Accepted, 4: Wrong Answer, 5: Time Limit Exceeded
          // 6: Compilation Error, 7: Runtime Error (SIGSEGV), 8: Runtime Error (SIGXFSZ)
          // 9: Runtime Error (SIGFPE), 10: Runtime Error (SIGABRT), 11: Runtime Error (NZEC)
          // 12: Runtime Error (Other), 13: Internal Error, 14: Exec Format Error
          
          const status = data.status?.id;
          
          if (status === 1 || status === 2) {
            // Still processing
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollResult, 500); // Wait 500ms before next poll
              return;
            } else {
              throw new Error('Code execution timeout - taking too long to complete');
            }
          }

          // Execution completed, decode and display results
          let output = '';
          let hasError = false;

          if (data.compile_output) {
            output += `📋 Compilation Output:\n${atob(data.compile_output)}\n\n`;
            hasError = true;
          }

          if (data.stderr) {
            output += `❌ Error:\n${atob(data.stderr)}\n\n`;
            hasError = true;
          }

          if (data.stdout) {
            output += `✅ Output:\n${atob(data.stdout)}`;
          } else if (!hasError) {
            output = '✅ Code executed successfully (no output)';
          }

          if (data.message) {
            output += `\n\n📝 Message: ${atob(data.message)}`;
          }

          if (data.time) {
            output += `\n⏱️ Execution time: ${data.time}s`;
          }

          if (data.memory) {
            output += `\n💾 Memory used: ${data.memory} KB`;
          }

          setOutputs(prev => ({ ...prev, [index]: output || '(No output)' }));

        } catch (pollError) {
          console.error('❌ Polling error:', pollError);
          throw pollError;
        }
      };

      // Start polling
      await pollResult();

    } catch (err) {
      console.error('❌ Code execution error:', err);
      
      let errorMessage = '❌ Failed to execute code: ';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage += 'Request timeout - please try again';
      } else if (err.response?.status === 429) {
        errorMessage += 'Rate limit exceeded - please wait and try again';
      } else if (err.response?.status === 401) {
        errorMessage += 'API authentication failed';
      } else if (err.response?.data?.error) {
        errorMessage += err.response.data.error;
      } else {
        errorMessage += err.message || 'Unknown error occurred';
      }
      
      setOutputs(prev => ({ ...prev, [index]: errorMessage }));
    } finally {
      setRunningCode(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const data = {
        question_set_id: questionSetId,
        questions: testQuestions,
        answers: testQuestions.map((_, idx) => answers[idx] || ''),
        languages: testQuestions.map((_, idx) => selectedLanguages[idx] || 'javascript')
      };

      const result = await submitTest(data);
      setResult(result);
      setSubmitted(true);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (submitted) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  useEffect(() => {
    const initialLanguages = {};
    const initialAnswers = {};
    questions.forEach((q, i) => {
      if (!q.options || q.options.length === 0) {
        initialLanguages[i] = 'javascript';
        if (!answers[i]) {
          initialAnswers[i] = PROGRAMMING_LANGUAGES[0].defaultCode;
        }
      }
    });
    setSelectedLanguages(prev => ({ ...prev, ...initialLanguages }));
    setAnswers(prev => ({ ...prev, ...initialAnswers }));
  }, [questions]);

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
            <p className="text-gray-600 mb-6">Thank you for taking the test</p>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <p className="text-2xl font-bold text-blue-600 mb-2">Your Score</p>
              <p className="text-4xl font-bold text-gray-900">{result.score}/{result.max_score || (questions.length * 10)}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">Status: {result.status}</p>
            <button
              onClick={() => onNavigate('generate')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Test in Progress</h1>
          <div className="flex items-center text-red-600">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="space-y-6 mb-8">
          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {questionIndex + 1}. {question.question}
              </h2>

              {question.options && question.options.length > 0 ? (
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={option}
                        checked={answers[questionIndex] === option}
                        onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="ml-3 text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="mt-2">
                  <div className="mb-4 flex items-center space-x-3">
                    <Code className="w-5 h-5 text-gray-600" />
                    <label className="text-sm font-medium text-gray-700">
                      Choose Programming Language:
                    </label>
                    <select
                      value={selectedLanguages[questionIndex] || 'javascript'}
                      onChange={(e) => handleLanguageChange(questionIndex, e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      {PROGRAMMING_LANGUAGES.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <MonacoEditor
                      height="300px"
                      language={selectedLanguages[questionIndex] || 'javascript'}
                      value={answers[questionIndex] || ''}
                      onChange={(value) => handleAnswerChange(questionIndex, value)}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        wordWrap: 'on',
                      }}
                    />
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => handleRunCode(questionIndex)}
                      disabled={runningCode[questionIndex]}
                      className="flex items-center text-sm bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {runningCode[questionIndex] ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      {runningCode[questionIndex] ? 'Running...' : 'Run Code'}
                    </button>
                    
                    {outputs[questionIndex] && (
                      <div className="mt-3 p-3 bg-gray-900 text-green-400 rounded text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                        {outputs[questionIndex]}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="!bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg transition-colors
"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                Submitting...
              </>
            ) : (
              'Submit Test'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GiveTest;