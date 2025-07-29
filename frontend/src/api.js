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

export const finalizeTest = async (questions) => {
  const response = await fetch(`${BASE_URL}/api/hr/finalize-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questions }),
  });
  if (!response.ok) throw new Error('Failed to finalize test');
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
