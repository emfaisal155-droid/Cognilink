// src/components/statCard.jsx
import React from 'react';

export default function StatCard({ label, value }) {
  return (
    <div className="stat-card-mini">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}