import React, { useState, useEffect } from 'react';
import NoteEditor from '../../components/noteEditor';
// NEW COMPONENTS IMPORT
import StatCard from '../../components/statCard';
import RecentConcepts from '../../components/recentConcepts';

export default function Dashboard() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editNote, setEditNote] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('active'); 
  const [notes, setNotes] = useState([]);

  // NEW: State for Dashboard Expansion requirements
  const [stats, setStats] = useState({ totalNodes: 0, totalEdges: 0 });
  const [recentConcepts, setRecentConcepts] = useState([]);

  // 1. Load Notes from Backend on startup
  useEffect(() => {
    const fetchNotes = async () => {
      const user = localStorage.getItem('username'); 
      if (!user) return;

      try {
        const response = await fetch(`https://localhost:7174/api/notes/${user}`);
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        }

        // NEW: Fetch At-a-Glance Stats (Expansion Requirement)
        const statsRes = await fetch(`https://localhost:7174/api/dashboard/stats/${user}`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // NEW: Fetch Recently Extracted Concepts (Sub-story 1.2)
        const conceptRes = await fetch(`https://localhost:7174/api/concepts/recent/${user}`);
        if (conceptRes.ok) {
          const conceptData = await conceptRes.json();
          setRecentConcepts(conceptData);
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

  // 2. Save or Update Note in DB
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
        // Refresh notes from server to ensure UI is in sync with DB
        const res = await fetch(`https://localhost:7174/api/notes/${user}`);
        const data = await res.json();
        setNotes(data);

        // NEW: Refresh stats and concepts after a save (Sub-story 4.1)
        const statsRes = await fetch(`https://localhost:7174/api/dashboard/stats/${user}`);
        const conceptRes = await fetch(`https://localhost:7174/api/concepts/recent/${user}`);
        if (statsRes.ok) setStats(await statsRes.json());
        if (conceptRes.ok) setRecentConcepts(await conceptRes.json());
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
    setEditNote(null);
    setIsEditorOpen(false);
  };

  // 3. Delete Note from DB
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const user = localStorage.getItem('username');
    const message = view === 'trash' ? "Permanently delete this note?" : "Move this note to Trash?";
    
    if (window.confirm(message)) {
      try {
        const response = await fetch(`https://localhost:7174/api/notes/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          setNotes(notes.filter(n => n.id !== id));
          
          // NEW: Refresh stats as node/edges may be removed (Sub-story 4.2)
          const statsRes = await fetch(`https://localhost:7174/api/dashboard/stats/${user}`);
          if (statsRes.ok) setStats(await statsRes.json());
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

    const titleMatch = (note.title || "").toLowerCase().includes(lowerSearch);
    const contentMatch = (note.content || "").toLowerCase().includes(lowerSearch);
    
    return matchesView && (titleMatch || contentMatch);
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
            {/* LINK TO GRAPH VIEW COULD BE ADDED HERE */}
            <li>Graphs</li>
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

          {/* NEW: Recent Concepts Section in Sidebar (User Story 1) */}
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
            {/* NEW: Dashboard Expansion Stats integrated into header */}
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
                title="Create a new note"
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
                       <button 
                        onClick={(e) => restoreNote(e, note.id)} 
                        className="delete-icon-btn" 
                        title="Restore Note" 
                       >
                         ↩️
                       </button>
                    )}
                    
                    <button 
                      onClick={(e) => handleDelete(e, note.id)} 
                      className="delete-icon-btn"
                      title={view === 'trash' ? "Permanently Delete" : "Move to Trash"}
                    >
                      {view === 'trash' ? '❌' : '🗑️'}
                    </button>
                  </div>
                </div>
                <p className="note-item-description">{note.content}</p>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ textAlign: 'center', marginTop: '40px', color: '#666', fontStyle: 'italic' }}>
              {searchTerm 
                ? `No results found for "${searchTerm}"` 
                : (view === 'trash' ? 'Your trash is currently empty.' : 'Start your first note!')
              }
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
