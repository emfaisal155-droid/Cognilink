import React, { useRef, useState, useCallback, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

export default function GraphCanvas({ data }) {
  const fgRef = useRef();
  const [contextMenu, setContextMenu] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

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
  const graphData = {
    nodes: data.nodes || [],
    links: data.edges || []
  };

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

  const handleNodeRightClick = useCallback((node, event) => {
    // ForceGraph2D handles event.preventDefault internally for right clicks
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      nodeId: node.id
    });
  }, []);

  const closeContextMenu = () => {
    setContextMenu(null);
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
            
            // Draw ellipse/circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, bckgDimensions[0] / 1.5, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.lineWidth = 1 / globalScale;
            ctx.strokeStyle = '#000';
            ctx.stroke();

            // Draw text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000';
            ctx.fillText(label, node.x, node.y);
            
            node.__bckgDimensions = bckgDimensions; 
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            ctx.fillStyle = color;
            const bckgDimensions = node.__bckgDimensions;
            bckgDimensions && ctx.arc(node.x, node.y, bckgDimensions[0] / 1.5, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          linkColor={() => '#999'}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          onNodeRightClick={handleNodeRightClick}
        />
      )}

      {/* Zoom Controls */}
      <div style={{ position: 'absolute', top: '15px', right: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button onClick={handleZoomIn} style={{ padding: '8px 12px', fontSize: '18px', backgroundColor: '#ccc', border: '1px solid #000', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🔍+</button>
        <button onClick={handleZoomOut} style={{ padding: '8px 12px', fontSize: '18px', backgroundColor: '#ccc', border: '1px solid #000', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🔍-</button>
      </div>

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
          <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #999', backgroundColor: '#bbb', margin: '2px' }}>Edit</div>
          <div style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #999', backgroundColor: '#bbb', margin: '2px' }}>Delete</div>
          <div style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#bbb', margin: '2px' }}>View Connected Concepts</div>
        </div>
      )}
    </div>
  );
}
