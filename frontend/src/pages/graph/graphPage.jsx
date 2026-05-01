import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import GraphCanvas from '../../components/graphCanvas';

export default function GraphPage() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [filterNoteId, setFilterNoteId] = useState('all'); 
  const [filterType, setFilterType] = useState('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]); 
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const graphCanvasRef = useRef();

  useEffect(() => {
    const fetchInitialData = async () => {
      const user = localStorage.getItem('username');
      if (!user) return;

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
      
      const url = filterNoteId === 'all' 
        ? `https://localhost:7174/api/graph/${user}` 
        : `https://localhost:7174/api/graph/filter?noteId=${filterNoteId}&username=${user}`;

      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          
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
  }, [filterNoteId, refreshTrigger]);

  const filteredGraphData = useMemo(() => {
    let nodes = [...graphData.nodes];
    if (filterType === 'important') {
      nodes = nodes.filter(n => n.frequency >= 2);
    } else if (filterType === 'recent') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      nodes = nodes.filter(n => new Date(n.createdAt) >= thirtyDaysAgo);
    }
    
    const nodeIds = new Set(nodes.map(n => n.id));
    const edges = graphData.edges.filter(e => nodeIds.has(e.source.id || e.source) && nodeIds.has(e.target.id || e.target));
    
    return { nodes, edges };
  }, [graphData, filterType]);

  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = async (format) => {
    if (format === 'JSON_FILTERED') {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredGraphData, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "cognilink_filtered_graph.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } else if (format === 'JSON_FULL') {
      const user = localStorage.getItem('username');
      try {
        const res = await fetch(`https://localhost:7174/api/graph/export/${user}`);
        if (res.ok) {
          const json = await res.json();
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, null, 2));
          const downloadAnchorNode = document.createElement('a');
          downloadAnchorNode.setAttribute("href", dataStr);
          downloadAnchorNode.setAttribute("download", "cognilink_full_backup.json");
          document.body.appendChild(downloadAnchorNode);
          downloadAnchorNode.click();
          downloadAnchorNode.remove();
        } else {
          alert('Failed to export full graph from server.');
        }
      } catch (err) {
        console.error("Export failed:", err);
      }
    } else if (graphCanvasRef.current && graphCanvasRef.current.exportGraph) {
      graphCanvasRef.current.exportGraph(format);
    }
    setShowExportMenu(false);
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
            <li className="active" style={{ cursor: 'pointer' }}>
              Graphs
            </li>
            <Link to="/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
              <li style={{ cursor: 'pointer' }}>
                Settings
              </li>
            </Link>
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
              placeholder="Focus Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '8px', border: '1px solid #000' }}
            />
            
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{ padding: '8px', border: '1px solid #000', backgroundColor: '#eee', cursor: 'pointer' }}
            >
              <option value="none">Sort: All</option>
              <option value="important">High Importance</option>
              <option value="recent">Recent (30 Days)</option>
            </select>
            
            <select 
              value={filterNoteId} 
              onChange={(e) => setFilterNoteId(e.target.value)}
              style={{ padding: '8px', border: '1px solid #000', backgroundColor: '#eee', cursor: 'pointer' }}
            >
              <option value="all">Filter Note: All</option>
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
                <div style={{ position: 'absolute', top: '100%', right: 0, backgroundColor: '#ccc', border: '2px solid #000', width: '180px', zIndex: 100, marginTop: '5px' }}>
                  <div onClick={() => handleExport('PNG')} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #999', backgroundColor: '#bbb', margin: '2px' }}>Export PNG</div>
                  <div onClick={() => handleExport('JSON_FILTERED')} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #999', backgroundColor: '#bbb', margin: '2px' }}>JSON (Current View)</div>
                  <div onClick={() => handleExport('JSON_FULL')} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#bbb', margin: '2px' }}>JSON (Full Backup)</div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={{ flex: 1, position: 'relative', border: '2px solid #D35400', backgroundColor: '#fff', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', fontStyle: 'italic', color: '#D35400' }}>Mapping hidden connections...</div>
          ) : (
            <GraphCanvas 
              ref={graphCanvasRef} 
              data={filteredGraphData} 
              searchQuery={searchQuery} 
              onGraphUpdate={() => setRefreshTrigger(prev => prev + 1)} 
              onViewConnected={(node) => setSearchQuery(node.label)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
