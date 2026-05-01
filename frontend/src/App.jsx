import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import Login from './pages/auth/login';
import Signup from './pages/auth/signup';
import './App.css';
import './index.css';
import Dashboard from './pages/dashboard/dashboard';
import GraphPage from './pages/graph/graphPage'; 
import Settings from './pages/dashboard/settings';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar /> 
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/settings" element={<Settings />} />
          
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
