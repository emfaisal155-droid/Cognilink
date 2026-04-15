import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NoteEditor from '../../components/noteEditor';
import StatCard from '../../components/statCard';
import RecentConcepts from '../../components/recentConcepts';

export default function Dashboard() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editNote, setEditNote] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('active'); 
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  const [stats, setStats] = useState({ totalNodes: 0, totalEdges: 0 });
  const [recentConcepts, setRecentConcepts] = useState([]);

  // Load Notes from Backend
  useEffect(() => {
    const fetchNotes = async () => {
      const user = localStorage.getItem('username'); 
      if (!user) {
          console.warn("No username found in localStorage");
          return;
      }

      try {
        const response = await fetch(`https://localhost:7174/api/notes/${user}`);
        if (response.ok) {
          const textData = await response.text();
          // Ensure we don't try to parse an empty string
          const parsedData = textData ? JSON.parse(textData) : [];
          setNotes(Array.isArray(parsedData) ? parsedData : []);
        }

        const statsRes = await fetch(`https://localhost:7174/api/dashboard/stats/${user}`);
        if (statsRes.ok) {
          const statsText = await statsRes.text();
          setStats(statsText ? JSON.parse(statsText) : { totalNodes: 0, totalEdges: 0 });
        }

        const conceptRes = await fetch(`https://localhost:7174/api/concepts/recent/${user}`);
        if (conceptRes.ok) {
          const conceptText = await conceptRes.text();
          setRecentConcepts(conceptText ? JSON.parse(conceptText) : []);
        }
      } catch (err) {
        console.error("Connection failed:", err);
      }
    };
    fetchNotes();
  }, []);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveNote = async (savedNote) => {
    const isEditing = !!editNote;
    const user = localStorage.getItem('username');
    const timestamp = getCurrentTime();
    
    const url = isEditing 
      ? `https://localhost:7174/api/notes/${savedNote.id}` 
      : `https://localhost:7174/api/notes`;

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...savedNote,
          username: user,
          date: timestamp,
          deleted: false
        })
      });

      if (response.ok) {
        // Re-fetch notes after save to sync state
        const res = await fetch(`https://localhost:7174/api/notes/${user}`);
        const textData = await res.text();
        const parsedData = textData ? JSON.parse(textData) : [];
        setNotes(Array.isArray(parsedData) ? parsedData : []);

        // Update stats and concepts
        const statsRes = await fetch(`https://localhost:7174/api/dashboard/stats/${user}`);
        if (statsRes.ok) {
          const sText = await statsRes.text();
          setStats(sText ? JSON.parse(sText) : { totalNodes: 0, totalEdges: 0 });
        }
        
        const conceptRes = await fetch(`https://localhost:7174/api/concepts/recent/${user}`);
        if (conceptRes.ok) {
          const cText = await conceptRes.text();
          setRecentConcepts(cText ? JSON.parse(cText) : []);
        }
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
    setEditNote(null);
    setIsEditorOpen(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const user = localStorage.getItem('username');
    
    if (window.confirm(view === 'trash' ? "Permanently delete?" : "Move to Trash?")) {
      try {
        const response = await fetch(`https://localhost:7174/api/notes/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setNotes(prev => prev.filter(n => n.id !== id));
          const statsRes = await fetch(`https://localhost:7174/api/dashboard/stats/${user}`);
          if (statsRes.ok) {
            const sText = await statsRes.text();
            setStats(JSON.parse(sText));
          }
        }
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const restoreNote = (e, id) => {
    e.stopPropagation();
    setNotes(notes.map(n => n.id === id ? { ...n, deleted: false } : n));
    setView('active');
  };

  const openEditMode = (note) => {
    if (view === 'trash') return; 
    setEditNote(note);
    setIsEditorOpen(true);
  };

  const lowerSearch = searchTerm.toLowerCase().trim();
  const filteredNotes = notes.filter(note => {
    const matchesView = view === 'trash' ? note.deleted : !note.deleted;
    if (!lowerSearch) return matchesView;
    return matchesView && (
      (note.title || "").toLowerCase().includes(lowerSearch) || 
      (note.content || "").toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="dashboard-container">
      <nav className="side-menu">
        <div className="menu-group">
          <h3>Menu</h3>
          <ul>
            <li 
              className={view === 'active' || view === 'trash' ? "active" : ""} 
              onClick={() => { setView('active'); setSearchTerm(''); }}
            >
              Notes
            </li>
            <li onClick={() => navigate('/graph')} style={{ cursor: 'pointer' }}>
              Graphs
            </li>
            <li>Settings</li>
          </ul>
        </div>
      </nav>

      <aside className="doc-sidebar">
        <div className="doc-section">
          <input 
            type="text" 
            placeholder="Search notes..." 
            className="search-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            autoFocus
          />
        </div>
        <div className="doc-section orange-bg" style={{ paddingTop: '20px' }}>
          <button 
            className={`nav-item ${view === 'active' ? "active-doc" : ""}`} 
            onClick={() => { setView('active'); setSearchTerm(''); }}
          >
            My Documents
          </button>
          <button 
            className={`nav-item ${view === 'trash' ? "active-doc" : ""}`} 
            onClick={() => { setView('trash'); setSearchTerm(''); }}
          >
            Trash
          </button>

          {view === 'active' && (
            <div style={{ padding: '0 15px', color: 'white' }}>
              <RecentConcepts concepts={recentConcepts} />
            </div>
          )}
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <h2>{view === 'trash' ? 'Trash' : 'My Documents'}</h2>
          
          <div className="header-actions">
            {view === 'active' && (
              <div style={{ display: 'flex', gap: '15px', marginRight: '20px' }}>
                <StatCard label="Total Nodes" value={stats.totalNodes} />
                <StatCard label="Relationships" value={stats.totalEdges} />
              </div>
            )}

            <div className="status-info">
              <span className={`stat-badge ${view === 'trash' ? 'trash-count' : ''}`}>
                {view === 'trash' ? 'Deleted Items: ' : 'Total Notes: '} 
                <strong>{filteredNotes.length}</strong>
              </span>
              <span className="sync-status" style={{ color: '#27ae60' }}>● Cloud Sync Active</span>
            </div>
            {view === 'active' && (
              <button 
                className="add-note-btn" 
                onClick={() => { setEditNote(null); setIsEditorOpen(true); }}
              >
                <span className="plus-icon">+</span> New Note
              </button>
            )}
          </div>
        </header>

        <div className="sync-section">
          <h4>{view === 'trash' ? 'Recently Deleted' : 'My Notes'}</h4>
          
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div 
                key={note.id} 
                className="note-list-item" 
                onClick={() => openEditMode(note)} 
                style={{ cursor: view === 'trash' ? 'default' : 'pointer' }}
              >
                <div className="note-item-header">
                  <span className="note-item-title">{note.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span className="note-item-date">{note.date}</span>
                    {view === 'trash' && (
                       <button onClick={(e) => restoreNote(e, note.id)} className="delete-icon-btn">↩️</button>
                    )}
                    <button onClick={(e) => handleDelete(e, note.id)} className="delete-icon-btn">
                      {view === 'trash' ? '❌' : '🗑️'}
                    </button>
                  </div>
                </div>
                <p className="note-item-description">{note.content}</p>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ textAlign: 'center', marginTop: '40px', color: '#666' }}>
              {searchTerm ? `No results for "${searchTerm}"` : "Nothing to see here."}
            </div>
          )}
        </div>
      </main>

      <NoteEditor 
        isOpen={isEditorOpen} 
        editNote={editNote}
        onClose={() => { setIsEditorOpen(false); setEditNote(null); }} 
        onSave={handleSaveNote} 
      />
    </div>
  );
}
