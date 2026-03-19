import React, { useState, useEffect } from 'react';
import NoteEditor from '../../components/noteEditor';

export default function Dashboard() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editNote, setEditNote] = useState(null); 
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('active'); 

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('cognilink_notes');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Neural Networks Architecture', content: 'Deep dive into CNNs and RNNs.', date: '02:30 PM', deleted: false },
      { id: 2, title: 'SQL Database Schema', content: 'Designing the relational model for the project.', date: '11:15 AM', deleted: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('cognilink_notes', JSON.stringify(notes));
  }, [notes]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSaveNote = (savedNote) => {
    const timestamp = getCurrentTime();
    if (editNote) {
      const hasChanged = editNote.title !== savedNote.title || editNote.content !== savedNote.content;
      setNotes(notes.map(n => n.id === savedNote.id ? { 
        ...savedNote, 
        date: hasChanged ? timestamp : n.date, 
        deleted: false 
      } : n));
    } else {
      setNotes([{ ...savedNote, id: Date.now(), date: timestamp, deleted: false }, ...notes]);
    }
    setEditNote(null);
    setIsEditorOpen(false);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); 
    const message = view === 'trash' ? "Permanently delete this note?" : "Move this note to Trash?";
    if (window.confirm(message)) {
      if (view === 'trash') {
        setNotes(notes.filter(note => note.id !== id));
      } else {
        setNotes(notes.map(n => n.id === id ? { ...n, deleted: true } : n));
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

  // --- THE CRITICAL FIX ---
  // We calculate this EVERY render. When setSearchTerm runs, React re-renders. 
  // On that re-render, searchTerm is 'A', and this filter runs IMMEDIATELY.
  const lowerSearch = searchTerm.toLowerCase().trim();
  const filteredNotes = notes.filter(note => {
    const matchesView = view === 'trash' ? note.deleted : !note.deleted;
    
    // If no search, just show the view
    if (!lowerSearch) return matchesView;

    // Direct string check
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
            // Logic: Update state. This triggers a re-render where filteredNotes is re-calculated.
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
        </div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <h2>{view === 'trash' ? 'Trash' : 'My Documents'}</h2>
          
          <div className="header-actions">
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