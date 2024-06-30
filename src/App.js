import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import TotalHoursPage from './TotalHoursPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/total-hours" element={<TotalHoursPage />} />
      </Routes>
    </Router>
  );
}

export default App;