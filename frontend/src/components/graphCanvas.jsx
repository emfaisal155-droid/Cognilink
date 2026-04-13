// src/components/graphCanvas.jsx
import React from 'react';

export default function GraphCanvas({ data }) {
  return (
    <div className="graph-canvas-container" style={{ height: '500px' }}>
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
          NODES: {data.nodes?.length || 0}
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
          EDGES: {data.edges?.length || 0}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100%',
        padding: '40px' 
      }}>
        {(!data.nodes || data.nodes.length === 0) ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>
            Waiting for backend extraction...
          </p>
        ) : (
          data.nodes.map((node) => (
            <div key={node.id} className="graph-node">
              {node.label}
            </div>
          ))
        )}
      </div>

      {/* Zoom Controls */}
      <div className="graph-controls">
        <button className="control-btn">+</button>
        <button className="control-btn">-</button>
      </div>
    </div>
  );
}