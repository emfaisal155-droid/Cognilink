// src/components/recentConcepts.jsx
import React from 'react';

export default function RecentConcepts({ concepts }) {
  return (
    <div className="recent-concepts-wrapper">
      <h4 style={{ color: '#fff', marginBottom: '10px', fontSize: '0.9rem' }}>
        Extracted Concepts
      </h4>
      <div className="concept-list">
        {concepts.length === 0 ? (
          <p style={{ color: '#ffd8b1', fontSize: '0.8rem', fontStyle: 'italic' }}>
            No concepts yet...
          </p>
        ) : (
          concepts.map((concept, index) => (
            <div key={index} className="concept-list-item">
              <span>•</span> {concept.name}
            </div>
          ))
        )}
      </div>
    </div>
  );
}