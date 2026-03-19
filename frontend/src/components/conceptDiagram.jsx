export default function ConceptDiagram() {
  return (
    <svg width="500" height="400" viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Arrows / Connectors */}
      <path d="M250 100 L150 150" stroke="black" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <path d="M250 100 L350 150" stroke="black" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <path d="M150 200 L150 250" stroke="black" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <path d="M350 200 L350 250" stroke="black" strokeWidth="2" markerEnd="url(#arrowhead)" />
      <path d="M250 100 L250 300" stroke="black" strokeWidth="2" markerEnd="url(#arrowhead)" />

      {/* Top Circle Node */}
      <circle cx="250" cy="70" r="40" fill="#802020" />

      {/* Middle Row Nodes */}
      <rect x="80" y="150" width="140" height="50" fill="#F1C40F" />
      <rect x="280" y="150" width="140" height="50" fill="#802020" />

      {/* Bottom Row Nodes */}
      <rect x="80" y="250" width="140" height="50" fill="#802020" />
      <rect x="280" y="250" width="140" height="50" fill="#F1C40F" />
      <rect x="180" y="320" width="140" height="50" fill="#E67E22" />

      {/* Arrowhead Definition */}
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="black" />
        </marker>
      </defs>
    </svg>
  );
}