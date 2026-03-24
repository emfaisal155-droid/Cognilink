import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConceptDiagram from '../../components/ConceptDiagram';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 1. New state to track if password should be shown
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Send the data to your C# Backend
      const response = await fetch('http://localhost:7174/api/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        // 2. If the backend says "Yes", save the user and go to dashboard
        const data = await response.json();
        localStorage.setItem('isLoggedIn', 'true');
        console.log("Login Successful:", data);
        navigate('/dashboard');
      } else {
        // 3. If the backend says "No" (e.g., wrong password)
        alert("Invalid email or password!");
      }
    } catch (error) {
      // 4. If the server is not running or there is a network error
      console.error("Connection error:", error);
      alert("Could not connect to the server. Is the backend running on port 7174?");
    }
  };

  return (
    <main className="main-content">
      <div className="diagram-section">
        <ConceptDiagram />
      </div>

      <div className="form-section" style={{ display: 'flex', justifyContent: 'center' }}>
        <form className="form-box" onSubmit={handleLogin}>
          <h2 style={{ color: '#D35400', marginBottom: '20px' }}>CogniLink</h2>
          
          <input 
            type="text" 
            placeholder="Enter Email or Number" 
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          {/* 2. Dynamic type based on showPassword state */}
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Enter Password" 
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', margin: '10px 0' }}>
            {/* 3. Checkbox connected to state */}
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input 
                    type="checkbox" 
                    checked={showPassword} // Bind checked property to state
                    onChange={() => setShowPassword(!showPassword)} // Toggle state on change
                /> 
                Show Password
            </label>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input type="checkbox" /> Remember Me
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="submit" style={primaryBtnStyle}>Login</button>
            <button type="button" onClick={() => navigate('/signup')} style={secondaryBtnStyle}>Sign Up</button>
          </div>
          
          <p style={{ fontSize: '0.8rem', marginTop: '15px', textDecoration: 'underline', cursor: 'pointer' }}>
            Forgot Password
          </p>
        </form>
      </div>
    </main>
  );
}

const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', border: '1px solid #000', boxSizing: 'border-box' };
const primaryBtnStyle = { flex: 1, padding: '12px', border: '1px solid #000', backgroundColor: '#D35400', color: 'white', cursor: 'pointer', fontWeight: 'bold' };
const secondaryBtnStyle = { flex: 1, padding: '12px', border: '1px solid #000', backgroundColor: '#fff', cursor: 'pointer' };
