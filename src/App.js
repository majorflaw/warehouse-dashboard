import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';

// Main Welcome Page
const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-white text-3xl font-bold mb-8">
        Welcome, please choose your department...
      </h1>
      <div className="space-x-4">
        <Link
          to="/department/ms"
          className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
        >
          MS
        </Link>
        <Link
          to="/department/cvg"
          className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
        >
          CVG
        </Link>
      </div>
    </div>
  );
};

// Flow Selection Page
const FlowSelectionPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <h1 className="text-white text-3xl font-bold mb-8">
        Please choose the flow...
      </h1>
      <div className="space-x-4 mb-8">
        <Link
          to="/flow/a"
          className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
        >
          A FLOW
        </Link>
        <Link
          to="/flow/b"
          className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
        >
          B FLOW
        </Link>
      </div>
      <button
        onClick={() => navigate('/')}
        className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
      >
        Back to Main Page
      </button>
    </div>
  );
};

// Empty Flow Pages
const FlowPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center">
      <div className="text-white text-xl">
        Flow Page (Under Construction)
      </div>
      <button
        onClick={() => navigate('/')}
        className="mt-8 px-6 py-3 bg-gray-800 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
      >
        Back to Main Page
      </button>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/department/:id" element={<FlowSelectionPage />} />
        <Route path="/flow/:id" element={<FlowPage />} />
      </Routes>
    </Router>
  );
}

export default App;