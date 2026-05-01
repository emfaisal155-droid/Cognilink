import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import './App.css';
import './index.css';
import Dashboard from './pages/dashboard/dashboard';
// NEW: Import the Graph Page (User Story 3)
import GraphPage from './pages/graph/graphPage'; 

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar /> 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* NEW: Graph Interface Route (Sub-story 3.1) */}
          <Route path="/graph" element={<GraphPage />} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
