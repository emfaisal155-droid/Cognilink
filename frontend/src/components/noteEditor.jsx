import React, { useState, useEffect } from 'react';

export default function NoteEditor({ isOpen, onClose, onSave, editNote }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // NEW: State to track backend extraction progress (User Story 1)
  const [isSyncing, setIsSyncing] = useState(false);

  // Requirement 2.3: Populate fields if we are editing
  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title || '');
      setContent(editNote.content || '');
    } else {
      setTitle('');
      setContent('');
    }
    setIsSyncing(false); // Reset syncing state when opening/closing
  }, [editNote, isOpen]);

  if (!isOpen) return null;

  // UPDATED: handleSave now includes the extraction trigger (Sub-story 4.1)
  const handleSave = async () => {
    if (!title.trim()) return alert("Title is required!");
    
    setIsSyncing(true); // Start visual feedback

    try {
      // 1. Existing save logic (passed to Dashboard)
      await onSave({
        ...editNote,
        title,
        content,
      });

      // 2. NEW: Trigger Automatic Concept Extraction (Sub-story 4.1)
      // Note: This assumes your onSave returns the note ID or you use editNote.id
      const noteId = editNote?.id; 
      if (noteId) {
        await fetch(`https://localhost:7174/api/extraction/trigger/${noteId}`, {
          method: 'POST',
        });
      }

      console.log("Note saved and concepts updated.");
    } catch (error) {
      console.error("Failed to sync concepts:", error);
    } finally {
      setIsSyncing(false); // End visual feedback
    }
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

        <div className="editor-actions" style={actionBarStyle}>
          {/* NEW: Visual feedback for concept extraction (User Story 1) */}
          {isSyncing && (
            <span style={syncingTextStyle}>
              Auto-extracting concepts...
            </span>
          )}

          <button 
            type="button" 
            className="editor-btn cancel-btn" 
            onClick={onClose}
            title="Discard changes"
            style={cancelBtnStyle}
            disabled={isSyncing} // Prevent closing while syncing
          >
            Cancel
          </button>
          
          <button 
            type="button" 
            className="editor-btn save-btn" 
            onClick={handleSave}
            title="Save to My Documents"
            style={saveBtnStyle}
            disabled={isSyncing} // Prevent double-save
          >
            {isSyncing ? 'Syncing...' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Styles
const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', border: '1px solid #000', borderRadius: '4px' };
const textareaStyle = { width: '100%', height: '200px', padding: '12px', border: '1px solid #000', borderRadius: '4px', resize: 'none' };
const actionBarStyle = { display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '20px' };
const saveBtnStyle = { padding: '10px 20px', backgroundColor: '#D35400', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' };
const cancelBtnStyle = { padding: '10px 20px', backgroundColor: '#fff', border: '1px solid #000', borderRadius: '6px', cursor: 'pointer' };

// NEW: Style for the syncing indicator
const syncingTextStyle = { 
  fontSize: '0.8rem', 
  color: '#D35400', 
  fontStyle: 'italic',
  marginRight: 'auto' // Pushes text to the left of buttons
};
