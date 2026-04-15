import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConceptDiagram from '../../components/ConceptDiagram';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    // 1. Keep your existing validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 2. Send data to the backend
      const response = await fetch('https://localhost:7174/api/account/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // We send fullName, email, and password (confirmPassword isn't needed by DB)
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      });

      if (response.ok) {
        alert("Account created successfully!");
        navigate('/auth/login'); // Redirect to login after signup
      } else {
        const errorData = await response.text();
        alert(errorData.message || "Signup failed. Email might already be in use.");
      }
    } catch (error) {
      console.error("Connection error:", error);
      alert("Cannot connect to server. Ensure backend is running on port 7174.");
    }
  };

  return (
    <main className="main-content">
      <div className="diagram-section">
        <ConceptDiagram />
      </div>

      <div className="form-section" style={{ display: 'flex', justifyContent: 'center' }}>
        <form className="form-box" onSubmit={handleRegister}>
          <h2 style={{ color: '#D35400', marginBottom: '20px' }}>Create Account</h2>
          
          <input name="fullName" type="text" placeholder="Full Name" style={inputStyle} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email Address" style={inputStyle} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Create Password" style={inputStyle} onChange={handleChange} required />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" style={inputStyle} onChange={handleChange} required />
          
          <button type="submit" style={primaryBtnStyle}>Register</button>
          
          <p style={{ fontSize: '0.8rem', marginTop: '15px' }}>
            Already have an account? 
            <span onClick={() => navigate('/login')} style={{ textDecoration: 'underline', cursor: 'pointer', marginLeft: '5px' }}>
              Login here
            </span>
          </p>
        </form>
      </div>
    </main>
  );
}

const inputStyle = { width: '100%', padding: '12px', margin: '8px 0', border: '1px solid #000', boxSizing: 'border-box' };
const primaryBtnStyle = { width: '100%', padding: '12px', marginTop: '15px', border: '1px solid #000', backgroundColor: '#D35400', color: 'white', cursor: 'pointer', fontWeight: 'bold' };
