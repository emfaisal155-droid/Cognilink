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
        : `https://localhost:7174/api/graph/filter?noteId=${filterNoteId}&username=${user}`;

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

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (format) => {
    console.log(`Exporting as ${format}...`);
    setShowExportMenu(false);
  };

  return (
    <div className="dashboard-container">
      {/* Primary Sidebar */}
      <nav className="side-menu">
        <div className="menu-group">
          <h3>Menu</h3>
          <ul>
            <li onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
              Notes
            </li>
            <li className="active" style={{ cursor: 'pointer' }}>
              Graphs
            </li>
            <li>Settings</li>
          </ul>
        </div>
      </nav>

      {/* Secondary Sidebar */}
      <aside className="doc-sidebar">
        <div className="doc-section orange-bg" style={{ paddingTop: '20px' }}>
          <button className="nav-item active-doc">Knowledge Map</button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="workspace" style={{ display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0, fontWeight: 'bold' }}>Graph</h2>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search..." 
              style={{ padding: '8px', border: '1px solid #000' }}
            />
            
            <select 
              value={filterNoteId} 
              onChange={(e) => setFilterNoteId(e.target.value)}
              style={{ padding: '8px', border: '1px solid #000', backgroundColor: '#eee', cursor: 'pointer' }}
            >
              <option value="all">Filter: All</option>
              {notes.map(note => (
                  <option key={note.id || note.Id} value={note.id || note.Id}>
                      {note.title || note.Title}
                  </option>
              ))}
            </select>

            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{ padding: '8px 15px', backgroundColor: '#333', color: '#fff', border: '1px solid #000', cursor: 'pointer' }}
              >
                Export
              </button>
              {showExportMenu && (
                <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: '#ccc', border: '2px solid #000', width: '100px', zIndex: 100, marginTop: '5px' }}>
                  <div onClick={() => handleExport('PNG')} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #999', backgroundColor: '#bbb', margin: '2px' }}>PNG</div>
                  <div onClick={() => handleExport('SVG')} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #999', backgroundColor: '#bbb', margin: '2px' }}>SVG</div>
                  <div onClick={() => handleExport('JPG')} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#bbb', margin: '2px' }}>JPG</div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, position: 'relative', border: '2px solid #D35400', backgroundColor: '#fff', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontStyle: 'italic', color: '#D35400' }}>Mapping hidden connections...</div>
          ) : (
            <GraphCanvas data={graphData} />
          )}
        </div>
      </main>
    </div>
  );
}
