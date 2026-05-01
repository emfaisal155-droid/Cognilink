import React, { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const GraphCanvas = forwardRef(({ data, searchQuery, onGraphUpdate, onViewConnected }, ref) => {
  const fgRef = useRef();
  const [contextMenu, setContextMenu] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());

  const [linkMode, setLinkMode] = useState(false);
  const [linkSource, setLinkSource] = useState(null);

  useImperativeHandle(ref, () => ({
    exportGraph: (format) => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) {
        const dataUrl = canvas.toDataURL(`image/${format.toLowerCase()}`);
        const link = document.createElement('a');
        link.download = `graph_export.${format.toLowerCase()}`;
        link.href = dataUrl;
        link.click();
      }
    }
  }));

  // Resize canvas to fit container
  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Normalizing data for react-force-graph
  const normalizedNodes = data.nodes || [];
  const normalizedLinks = data.edges || [];

  // Handle Focus Search highlighting
  useEffect(() => {
    if (!searchQuery) {
      setHighlightNodes(new Set());
      setHighlightLinks(new Set());
      return;
    }

    const query = searchQuery.toLowerCase();
    const matchedNodeIds = new Set();
    const neighborNodeIds = new Set();
    const matchedLinks = new Set();

    normalizedNodes.forEach(node => {
      if (node.label && node.label.toLowerCase().includes(query)) {
        matchedNodeIds.add(node.id);
      }
    });

    normalizedLinks.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      if (matchedNodeIds.has(sourceId)) {
        neighborNodeIds.add(targetId);
        matchedLinks.add(link);
      }
      if (matchedNodeIds.has(targetId)) {
        neighborNodeIds.add(sourceId);
        matchedLinks.add(link);
      }
    });

    setHighlightNodes(new Set([...matchedNodeIds, ...neighborNodeIds]));
    setHighlightLinks(matchedLinks);
  }, [searchQuery, normalizedNodes, normalizedLinks]);

  const graphData = { nodes: normalizedNodes, links: normalizedLinks };

  const handleZoomIn = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom * 1.5, 400);
    }
  };

  const handleZoomOut = () => {
    if (fgRef.current) {
      const currentZoom = fgRef.current.zoom();
      fgRef.current.zoom(currentZoom / 1.5, 400);
    }
  };

  const handleNodeClick = async (node) => {
    if (linkMode) {
      if (!linkSource) {
        setLinkSource(node);
      } else {
        if (linkSource.id !== node.id) {
          try {
            const res = await fetch(`https://localhost:7174/api/graph/edge/manual`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sourceConceptId: linkSource.id, targetConceptId: node.id })
            });
            if (res.ok && onGraphUpdate) {
               onGraphUpdate();
            } else if (res.status === 409) {
               alert("Relationship already exists!");
            }
          } catch(err) {
             console.error(err);
          }
        }
        setLinkSource(null);
        setLinkMode(false);
      }
    }
  };

  const handleNodeRightClick = useCallback((node, event) => {
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id,
      node: node,
      type: 'node'
    });
  }, []);

  const handleLinkRightClick = useCallback((link, event) => {
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      linkId: link.id,
      link: link,
      type: 'link'
    });
  }, []);

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleEdit = async (e) => {
    e.stopPropagation();
    if (!contextMenu) return;
    const newName = prompt("Enter new name for the concept:", contextMenu.node.label);
    if (newName && newName.trim() !== '') {
      try {
        const res = await fetch(`https://localhost:7174/api/graph/node/${contextMenu.nodeId}/rename`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newName: newName.trim() })
        });
        if (res.ok && onGraphUpdate) {
          onGraphUpdate();
        }
      } catch (err) {
        console.error(err);
      }
    }
    closeContextMenu();
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!contextMenu) return;

    if (contextMenu.type === 'node') {
      if (window.confirm("Are you sure you want to delete this concept and its connections?")) {
        try {
          const res = await fetch(`https://localhost:7174/api/graph/node/${contextMenu.nodeId}`, {
            method: 'DELETE'
          });
          if (res.ok && onGraphUpdate) {
            onGraphUpdate();
          }
        } catch (err) {
          console.error(err);
        }
      }
    } else if (contextMenu.type === 'link') {
      if (window.confirm("Are you sure you want to delete this connection?")) {
        try {
          const res = await fetch(`https://localhost:7174/api/graph/edge/${contextMenu.linkId}`, {
            method: 'DELETE'
          });
          if (res.ok && onGraphUpdate) {
            onGraphUpdate();
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    closeContextMenu();
  };

  const handleViewConnected = (e) => {
    e.stopPropagation();
    if (!contextMenu) return;
    if (onViewConnected) {
      onViewConnected(contextMenu.node);
    }
    closeContextMenu();
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} onClick={closeContextMenu}>
      {/* Legend / Stats Overlay */}
      <div style={{ 
        position: 'absolute', 
        top: '15px', 
        left: '15px', 
        zIndex: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '10px',
        border: '1px solid #000'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
          NODES: {graphData.nodes.length}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
          EDGES: {graphData.links.length}
        </div>
      </div>

      {(!graphData.nodes || graphData.nodes.length === 0) ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <p style={{ color: '#999', fontStyle: 'italic' }}>
            Waiting for backend extraction...
          </p>
        </div>
      ) : (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="label"
          nodeRelSize={6}
          nodeColor={() => '#ffffff'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.label;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.4); 
            
            const isHighlighted = highlightNodes.size === 0 || highlightNodes.has(node.id);
            const isLinkSource = linkSource && linkSource.id === node.id;
            const alpha = isHighlighted ? 1 : 0.2;
            
            ctx.beginPath();
            ctx.arc(node.x, node.y, bckgDimensions[0] / 1.5, 0, 2 * Math.PI, false);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
            ctx.lineWidth = isLinkSource ? 3 / globalScale : 1 / globalScale;
            ctx.strokeStyle = isLinkSource ? `rgba(211, 84, 0, ${alpha})` : `rgba(0, 0, 0, ${alpha})`;
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillText(label, node.x, node.y);
            
            node.__bckgDimensions = bckgDimensions; 
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            const bckgDimensions = node.__bckgDimensions;
            if (bckgDimensions) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, bckgDimensions[0] / 1.5, 0, 2 * Math.PI, false);
              ctx.fill();
            }
          }}
          linkColor={link => (highlightNodes.size === 0 || highlightLinks.has(link)) ? '#999' : 'rgba(153, 153, 153, 0.1)'}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          onNodeClick={handleNodeClick}
          onNodeRightClick={handleNodeRightClick}
          onLinkRightClick={handleLinkRightClick}
        />
      )}

      {/* Zoom and Link Controls */}
      <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button onClick={handleZoomIn} style={{ padding: '8px 12px', fontSize: '18px', backgroundColor: '#ccc', border: '1px solid #000', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Zoom In">🔍+</button>
        <button onClick={handleZoomOut} style={{ padding: '8px 12px', fontSize: '18px', backgroundColor: '#ccc', border: '1px solid #000', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Zoom Out">🔍-</button>
        <button 
          onClick={() => { setLinkMode(!linkMode); setLinkSource(null); }} 
          style={{ padding: '8px 12px', fontSize: '18px', backgroundColor: linkMode ? '#D35400' : '#ccc', color: linkMode ? '#fff' : '#000', border: '1px solid #000', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          title="Link Tool"
        >
          🔗
        </button>
      </div>

      {/* Link Mode Indicator */}
      {linkMode && (
        <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#D35400', color: '#fff', padding: '10px 20px', borderRadius: '20px', fontWeight: 'bold' }}>
          {linkSource ? `Select target node to connect to "${linkSource.label}"` : 'Select source node'}
          <button onClick={() => { setLinkMode(false); setLinkSource(null); }} style={{ marginLeft: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div style={{
          position: 'fixed',
          top: contextMenu.y,
          left: contextMenu.x,
          backgroundColor: '#ccc',
          border: '2px solid #000',
          boxShadow: '4px 4px 0px #000',
          zIndex: 1000,
          minWidth: '150px'
        }}>
          {contextMenu.type === 'node' && (
            <>
              <div onClick={handleEdit} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #999', backgroundColor: '#bbb', margin: '2px' }}>Edit</div>
              <div onClick={handleDelete} style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #999', backgroundColor: '#bbb', margin: '2px' }}>Delete Node</div>
              <div onClick={handleViewConnected} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#bbb', margin: '2px' }}>View Connected Concepts</div>
            </>
          )}
          {contextMenu.type === 'link' && (
            <div onClick={handleDelete} style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#bbb', margin: '2px' }}>Delete Connection</div>
          )}
        </div>
      )}
    </div>
  );
});

export default GraphCanvas;
