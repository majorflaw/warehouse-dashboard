import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import DashboardCVGA from './components/DashboardCVGA';
import DashboardMSA from './components/DashboardMSA';
import DashboardCVGB from './components/DashboardCVGB';

// Main Welcome Page
const WelcomePage = () => {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="flex flex-col items-start mb-12">
        <h1 className="text-white text-7xl font-[900] mb-2 font-montserrat">
          Welcome,
        </h1>
        <h2 className="text-white text-3xl font-[700] font-montserrat">
          please choose your department...
        </h2>
      </div>
      <div className="space-x-8">
        <Link
          to="/department/ms"
          className="px-12 py-3 bg-gray-900 text-white text-xl font-montserrat font-bold rounded-md hover:bg-gray-800 transition-colors border border-gray-800"
        >
          MS
        </Link>
        <Link
          to="/department/cvg"
          className="px-12 py-3 bg-gray-900 text-white text-xl font-montserrat font-bold rounded-md hover:bg-gray-800 transition-colors border border-gray-800"
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
  const { id } = useParams();

  const handleFlowSelection = (flow) => {
    if (id === 'ms' && flow === 'a') {
      navigate('/flow/ms-a');
    } else if (id === 'cvg' && flow === 'a') {
      navigate('/flow/cvg-a');
    } else if (id === 'cvg' && flow === 'b') {
      navigate('/flow/cvg-b');
    } else {
      navigate(`/flow/${flow}`);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-white mb-8 font-montserrat">Select Flow</h1>
      <div className="space-y-8">
        <button
          onClick={() => handleFlowSelection('a')}
          className="px-12 py-3 bg-gray-900 text-white text-xl font-montserrat font-bold rounded-md hover:bg-gray-800 transition-colors border border-gray-800"
        >
          A FLOW
        </button>
        <button
          onClick={() => handleFlowSelection('b')}
          className="px-12 py-3 bg-gray-900 text-white text-xl font-montserrat font-bold rounded-md hover:bg-gray-800 transition-colors border border-gray-800"
        >
          B FLOW
        </button>
      </div>
      <button
        onClick={() => navigate('/')}
        className="mt-8 text-gray-400 hover:text-white font-montserrat"
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <div className="flex flex-col items-start mb-12">
        <h1 className="text-white text-7xl font-[900] mb-2 font-montserrat">
          Flow Page,
        </h1>
        <h2 className="text-white text-3xl font-[700] font-montserrat">
          under construction...
        </h2>
      </div>
      <button
        onClick={() => navigate('/')}
        className="px-12 py-3 bg-gray-900 text-white text-xl font-montserrat font-bold rounded-md hover:bg-gray-800 transition-colors border border-gray-800"
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
        <Route path="/flow/ms-a" element={<DashboardMSA />} />
        <Route path="/flow/cvg-a" element={<DashboardCVGA />} />
        <Route path="/flow/cvg-b" element={<DashboardCVGB />} />
        <Route path="/flow/:id" element={<FlowPage />} />
      </Routes>
    </Router>
  );
}

export default App;