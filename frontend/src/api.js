const BASE_URL = 'http://localhost:8000';

// HR Endpoints
export const generateTest = async (formData) => {
  const response = await fetch(`${BASE_URL}/api/hr/generate-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!response.ok) throw new Error('Failed to generate test');
  return await response.json();
};

export const finalizeTest = async (data) => {
  // Handle both old format (just questions) and new format (questions + duration)
  console.log("data---->",data);
  
  const requestData = {
    questions: data.questions || data,
    duration: data.duration || 20,
    jd_id:data.jd_id
     // Default to 20 minutes
  };

  const response = await fetch(`${BASE_URL}/api/hr/finalize-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
  if (!response.ok) throw new Error('Failed to finalize test');
  return await response.json();
};

// Get all tests (for HR dashboard)
export const getAllTests = async () => {
  const response = await fetch(`${BASE_URL}/api/hr/tests`);
  if (!response.ok) throw new Error('Failed to fetch tests');
  return await response.json();
};

// Get test results (for HR to view submissions)
export const getTestResults = async (testId) => {
  const response = await fetch(`${BASE_URL}/api/hr/tests/${testId}/results`);
  if (!response.ok) throw new Error('Failed to fetch test results');
  return await response.json();
};

// Candidate Endpoints
export const fetchTest = async (questionSetId) => {
  const response = await fetch(`${BASE_URL}/api/test/${questionSetId}`);
  if (!response.ok) throw new Error('Failed to fetch test');
  return await response.json();
};

export const submitTest = async (submissionData) => {
  const response = await fetch(`${BASE_URL}/api/test/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submissionData),
  });
  if (!response.ok) throw new Error('Failed to submit test');
  return await response.json();
};

// Utility functions
export const extractTestIdFromUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch (error) {
    console.error('Invalid URL format:', error);
    return null;
  }
};

export const isValidTestUrl = (url) => {
  try {
    new URL(url);
    return url.includes('/test/');
  } catch {
    return false;
  }
};