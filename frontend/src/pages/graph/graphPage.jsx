import React, { useState, useEffect } from 'react';
import GraphCanvas from '../../components/graphCanvas';

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  // Changed filter state to hold a specific Note ID or 'all'
  const [filterNoteId, setFilterNoteId] = useState('all'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGraph = async () => {
      setLoading(true);
      
      // Determine which endpoint to hit based on the filter
      const url = filterNoteId === 'all' 
        ? `https://localhost:7174/api/graph` 
        : `https://localhost:7174/api/graph/filter?noteId=${filterNoteId}`;

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          // Backend returns: { nodes: [...], edges: [...] }
          setGraphData(data);
        }
      } catch (err) {
        console.error("Graph fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [filterNoteId]); // Refetch when the specific note filter changes

  return (
    <div style={pageLayout}>
      <header style={headerStyle}>
        <h2 style={{ color: '#D35400' }}>Knowledge Map</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          
          {/* Modified Select to match the Note Filtering endpoint */}
          <select 
            value={filterNoteId} 
            onChange={(e) => setFilterNoteId(e.target.value)}
            style={selectStyle}
          >
            <option value="all">Full Knowledge Graph</option>
            {/* You would typically map your actual notes here to filter by ID */}
            <option value="1">Focus: Note #1</option> 
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
          {graphData.edges.length} connections across {graphData.nodes.length} concepts.
        </p>
      </footer>
    </div>
  );
}

const pageLayout = { display: 'flex', flexDirection: 'column', height: '100%', padding: '20px' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' };
const canvasArea = { flex: 1, backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee', overflow: 'hidden' };
const selectStyle = { padding: '8px', border: '1px solid #333', borderRadius: '4px' };
const btnStyle = { padding: '8px 15px', backgroundColor: '#eee', border: '1px solid #333', cursor: 'pointer' };
const insightPanel = { marginTop: '15px', padding: '10px', borderTop: '1px solid #eee' };
const loadingOverlay = { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontStyle: 'italic' };
