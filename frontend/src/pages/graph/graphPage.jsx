import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for back navigation
import GraphCanvas from '../../components/graphCanvas';

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [filterNoteId, setFilterNoteId] = useState('all'); 
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]); // To populate the dropdown dynamically
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      const user = localStorage.getItem('username');
      if (!user) return;

      // Fetch notes list to populate the dropdown filter
      try {
        const res = await fetch(`https://localhost:7174/api/notes/${user}`);
        if (res.ok) {
          const text = await res.text();
          const data = text ? JSON.parse(text) : [];
          setNotes(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to fetch notes for filter:", err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      const user = localStorage.getItem('username');
      
      // Update URLs to include the user context if your backend requires it
      // Example: /api/graph/{username}
      const url = filterNoteId === 'all' 
        ? `https://localhost:7174/api/graph/${user}` 
        : `https://localhost:7174/api/graph/filter?noteId=${filterNoteId}`;

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          
          // NORMALIZE: Ensure properties match lowercase keys used by most Graph libraries
          const normalizedData = {
            nodes: data.nodes || data.Nodes || [],
            edges: data.edges || data.Edges || []
          };
          
          setGraphData(normalizedData);
        }
      } catch (err) {
        console.error("Graph fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [filterNoteId]);

  return (
    <div style={pageLayout}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => navigate('/dashboard')} style={backBtnStyle}>← Back</button>
            <h2 style={{ color: '#D35400', margin: 0 }}>Knowledge Map</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={filterNoteId} 
            onChange={(e) => setFilterNoteId(e.target.value)}
            style={selectStyle}
          >
            <option value="all">Full Knowledge Graph</option>
            {notes.map(note => (
                <option key={note.id || note.Id} value={note.id || note.Id}>
                    Focus: {note.title || note.Title}
                </option>
            ))}
          </select>

          <button style={btnStyle} onClick={() => window.print()}>Export PDF</button>
        </div>
      </header>

      <main style={canvasArea}>
        {loading ? (
          <div style={loadingOverlay}>Mapping hidden connections...</div>
        ) : (
          <GraphCanvas data={graphData} />
        )}
      </main>

      <footer style={insightPanel}>
        <p style={{ fontSize: '0.85rem', color: '#666' }}>
          <strong>Relationship Insight:</strong> Visualizing 
          {" "}{graphData.edges.length} connections across {graphData.nodes.length} concepts.
        </p>
      </footer>
    </div>
  );
}

// Styles
const pageLayout = { display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px', boxSizing: 'border-box' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const canvasArea = { flex: 1, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', position: 'relative', overflow: 'hidden' };
const selectStyle = { padding: '8px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' };
const btnStyle = { padding: '8px 15px', backgroundColor: '#fff', border: '1px solid #333', cursor: 'pointer', borderRadius: '4px' };
const backBtnStyle = { padding: '8px 12px', background: 'none', border: 'none', cursor: 'pointer', color: '#D35400', fontWeight: 'bold' };
const insightPanel = { marginTop: '15px', padding: '10px', borderTop: '1px solid #eee' };
const loadingOverlay = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontStyle: 'italic', color: '#D35400' };