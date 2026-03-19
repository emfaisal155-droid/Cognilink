export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo">
        <h2 style={{ color: '#D35400', margin: 0 }}>CogniLink</h2>
      </div>
      <div className="nav-links">
        <span>Our Blog</span>
        <span>Use Cases</span>
        <span>Solution</span>
      </div>
      <div className="demo">
        <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Watch a Demo</span>
      </div>
    </nav>
  );
}