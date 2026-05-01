import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
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

  const fetchDashboardData = async () => {
    const user = localStorage.getItem('username'); 
    if (!user) return;

    try {
      const response = await fetch(`https://localhost:7174/api/notes/${user}`);
      if (response.ok) {
        const text = await response.text();
        const data = text ? JSON.parse(text) : [];
        const normalizedNotes = (Array.isArray(data) ? data : []).map(n => ({
          id: n.id || n.Id,
          title: n.title || n.Title || "Untitled",
          content: n.content || n.Content || "",
          date: n.date || n.Date || n.createdAt || n.CreatedAt || "",
          deleted: n.isDeleted || n.IsDeleted || n.deleted || n.Deleted || false
        }));
        setNotes(normalizedNotes);
      }

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
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
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
        const res = await fetch(`https://localhost:7174/api/notes/${user}`);
        const text = await res.text();
        const data = text ? JSON.parse(text) : [];
        const normalizedNotes = (Array.isArray(data) ? data : []).map(n => ({
          id: n.id || n.Id,
          title: n.title || n.Title,
          content: n.content || n.Content,
          date: n.date || n.Date,
          deleted: n.isDeleted || n.IsDeleted || n.deleted || n.Deleted || false
        }));
        setNotes(normalizedNotes);
      }
    } catch (err) {
      console.error("Failed to save note to database:", err);
    }

    setEditNote(null);
    setIsEditorOpen(false);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm(view === 'trash' ? "Permanently delete?" : "Move to Trash?")) {
      try {
        const user = localStorage.getItem('username');
        const response = await fetch(`https://localhost:7174/api/notes/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user })
        });
        if (response.ok) fetchDashboardData();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const restoreNote = async (e, id) => {
    e.stopPropagation();
    const noteToRestore = notes.find(n => n.id === id);
    if (!noteToRestore) return;
    try {
      const user = localStorage.getItem('username');
      const response = await fetch(`https://localhost:7174/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...noteToRestore, username: user, isDeleted: false })
      });
      if (response.ok) fetchDashboardData();
    } catch (err) {
      console.error("Restore failed:", err);
    }
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
      note.title.toLowerCase().includes(lowerSearch) || 
      note.content.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <div className="dashboard-container">
      <nav className="side-menu">
        <div className="menu-group">
          <h3>Menu</h3>
          <ul>
            <li className={view === 'active' || view === 'trash' ? "active" : ""} 
              onClick={() => { setView('active'); setSearchTerm(''); }} style={{ cursor: 'pointer' }}>
              Notes
            </li>
            <Link to="/graph" style={{ textDecoration: 'none', color: 'inherit' }}>
              <li style={{ cursor: 'pointer' }}>
                Graphs
              </li>
            </Link>
            <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
              <li style={{ cursor: 'pointer' }}>
                Settings
              </li>
            </Link>
          </ul>
        </div>
      </nav>

      <aside className="doc-sidebar">
        <div className="doc-section">
          <input type="text" placeholder="Search notes..." className="search-field"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
        </div>
        <div className="doc-section orange-bg" style={{ paddingTop: '20px' }}>
          <button className={`nav-item ${view === 'active' ? "active-doc" : ""}`} 
            onClick={() => { setView('active'); setSearchTerm(''); }}>
            My Documents
          </button>
          <button className={`nav-item ${view === 'trash' ? "active-doc" : ""}`} 
            onClick={() => { setView('trash'); setSearchTerm(''); }}>
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
            </div>
            {view === 'active' && (
              <button className="add-note-btn" onClick={() => { setEditNote(null); setIsEditorOpen(true); }}>
                <span className="plus-icon">+</span> New Note
              </button>
            )}
          </div>
        </header>

        <div className="sync-section">
          <h4>{view === 'trash' ? 'Recently Deleted' : 'My Notes'}</h4>
          {filteredNotes.length > 0 ? (
            filteredNotes.map(note => (
              <div key={note.id} className="note-list-item" onClick={() => openEditMode(note)}>
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
            <div className="empty-state">No notes found.</div>
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