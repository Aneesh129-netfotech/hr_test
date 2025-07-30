// src/routes.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import GenerateTest from './pages/GenerateTest';
import FinalizeTest from './pages/FinalizeTest';
import GiveTest from './pages/GiveTest';
import TestSuccess from './pages/TestSuccess';
import { useState, useEffect } from 'react';
import { fetchTest } from './api';
import React from 'react';

// Wrapper for FinalizeTest
const FinalizeTestWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const questions = location.state?.questions;

  if (!questions) {
    navigate('/');
    return null;
  }

  return (
    <FinalizeTest
      questions={questions}
      onNavigate={(page, data) => {
        if (page === 'success') {
          navigate('/success', { state: { testLink: data } });
        }
      }}
      onDataPass={() => {}}
    />
  );
};

// Wrapper for GiveTest with dynamic param
const GiveTestWrapper = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [testQuestions, setTestQuestions] = useState([]);
  const [testDuration, setTestDuration] = useState(null); // Add state for duration
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadTest = async () => {
      try {
        const data = await fetchTest(id);
        console.log('📄 Fetched test data in GiveTestWrapper:', data); // Debug
        setTestQuestions(data.questions || []);
        setTestDuration(data.duration); // Set duration
        setLoading(false);
      } catch (err) {
        console.error('❌ Failed to load test:', err);
        setErrorMsg('This test is either expired or does not exist.');
        setLoading(false);
      }
    };
    loadTest();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10 text-lg font-medium">Loading test...</p>;
  }

  if (errorMsg) {
    return (
      <div className="text-center mt-20 text-red-600 text-lg font-semibold">
        {errorMsg}
        <br />
        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <GiveTest
      testQuestions={testQuestions}
      testDuration={testDuration} // Pass duration
      questionSetId={id}
      onNavigate={(page) => {
        if (page === 'home') navigate('/');
        else if (page === 'generate') navigate('/'); // Match onNavigate in GiveTest
        else if (page === 'success') navigate('/success');
      }}
    />
  );
};

// Main App Routes
const AppRoutes = () => {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={
          <GenerateTest
            onNavigate={(page, data) => {
              if (page === 'finalize') {
                navigate('/finalize', { state: { questions: data } });
              }
            }}
            onDataPass={() => {}}
          />
        }
      />
      <Route path="/finalize" element={<FinalizeTestWrapper />} />
      <Route path="/test/:id" element={<GiveTestWrapper />} />
      <Route path="/success" element={<TestSuccess />} />
    </Routes>
  );
};

export default AppRoutes;