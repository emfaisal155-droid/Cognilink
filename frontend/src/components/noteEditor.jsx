import React, { useState, useEffect } from 'react';

export default function NoteEditor({ isOpen, onClose, onSave, editNote }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Requirement 2.3: Populate fields if we are editing
  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title || '');
      setContent(editNote.content || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [editNote, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return alert("Title is required!");
    
    // We pass the raw data; the Dashboard handles the timestamp logic
    onSave({
      ...editNote,
      title,
      content,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="editor-box">
        <h3 style={{ color: '#D35400', marginBottom: '15px' }}>
          {editNote ? 'Edit Note' : 'New Note'}
        </h3>
        
        <input 
          type="text" 
          placeholder="Note Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="editor-input"
          style={inputStyle}
        />
        
        <textarea 
          placeholder="Start typing your description..." 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="editor-textarea"
          style={textareaStyle}
        />

        {/* Updated Button Section with spacing and descriptions */}
        <div className="editor-actions" style={actionBarStyle}>
          <button 
            type="button" 
            className="editor-btn cancel-btn" 
            onClick={onClose}
            title="Discard changes"
            style={cancelBtnStyle}
          >
            Cancel
          </button>
          
          <button 
            type="button" 
            className="editor-btn save-btn" 
            onClick={handleSave}
            title="Save to My Documents"
            style={saveBtnStyle}
          >
            Save Note
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline styles for the "prettier" look you requested
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #000', borderRadius: '4px' };
const textareaStyle = { width: '100%', height: '200px', padding: '12px', border: '1px solid #000', borderRadius: '4px', resize: 'none' };
const actionBarStyle = { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' };
const saveBtnStyle = { padding: '10px 20px', backgroundColor: '#D35400', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const cancelBtnStyle = { padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #000', borderRadius: '6px', cursor: 'pointer' };