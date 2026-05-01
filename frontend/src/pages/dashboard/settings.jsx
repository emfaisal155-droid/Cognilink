import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const currentUsername = localStorage.getItem('username') || '';

  useEffect(() => {
    if (currentUsername) {
      setUsername(currentUsername);
    }
  }, [currentUsername]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`https://localhost:7174/api/account/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUsername: currentUsername,
          newUsername: username,
          newPassword: newPassword || null
        })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('username', data.username);
        setMessage('Profile updated successfully!');
        setNewPassword('');
      } else {
        const err = await res.json();
        setMessage(`Error: ${err.message || 'Failed to update'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Primary Sidebar */}
      <nav className="side-menu">
        <div className="menu-group">
          <h3>Menu</h3>
          <ul>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <li style={{ cursor: 'pointer' }}>
                Notes
              </li>
            </Link>
            <Link to="/graph" style={{ textDecoration: 'none', color: 'inherit' }}>
              <li style={{ cursor: 'pointer' }}>
                Graphs
              </li>
            </Link>
            <li className="active" style={{ cursor: 'pointer' }}>
              Settings
            </li>
          </ul>
        </div>
      </nav>

      <main className="workspace" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <header style={{ marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0, fontWeight: 'bold' }}>Settings</h2>
        </header>

        <div style={{ flex: 1, backgroundColor: '#fff', padding: '20px', border: '1px solid #ccc' }}>
          <h3>Profile Information</h3>
          {message && <div style={{ marginBottom: '15px', color: message.includes('Error') || message.includes('Failed') ? 'red' : 'green', fontWeight: 'bold' }}>{message}</div>}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Username (Email):</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              style={{ padding: '8px', width: '300px' }} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>New Password:</label>
            <input 
              type="password" 
              placeholder="Leave blank to keep current" 
              value={newPassword} 
              onChange={(e) => setNewPassword(e.target.value)} 
              style={{ padding: '8px', width: '300px' }} 
            />
          </div>
          
          <button 
            onClick={handleSave} 
            disabled={loading} 
            style={{ padding: '10px 20px', backgroundColor: '#D35400', color: '#fff', border: 'none', cursor: 'pointer', opacity: loading ? 0.7 : 1, marginTop: '10px' }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
