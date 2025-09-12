import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import OccuCalc from "./OccuCalc";
import Register from "./Register";

const TOOLS = [
  {
    name: "OccuCalc",
    desc: "Efficient occupant load calculator for architects and engineers. Instantly estimate safe occupancy for any space.",
    price: "$19/month",
    active: true,
    link: "/occucalc"
  },
  {
    name: "ParkCore",
    desc: "Advanced parking design and analysis tool. Optimize layouts, maximize efficiency, and ensure compliance.",
    price: "$29/month",
    active: false,
    comingSoon: true,
    link: "#"
  },
];

function Home() {
  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      background: "linear-gradient(120deg,#f8fafc 0%,#e3eafc 100%)",
      minHeight: "100vh",
      padding: 0,
      margin: 0,
    }}>
      <Link to="/register" style={{ position: 'absolute', right: 32, top: 32, background: '#2563eb', color: '#fff', borderRadius: 6, padding: '6px 16px', fontWeight: 500, textDecoration: 'none', fontSize: '1rem', boxShadow: '0 2px 8px #0001' }}>Register</Link>
      <header style={{
        background: "#1a365d",
        color: "#fff",
        padding: "32px 0 24px 0",
        textAlign: "center",
        boxShadow: "0 2px 8px #0001"
      }}>
        <h1 style={{ fontSize: "2.8rem", margin: 0, fontWeight: 700, letterSpacing: 1 }}>GenFab Tools</h1>
        <p style={{ fontSize: "1.2rem", marginTop: 8, opacity: 0.85 }}>
          Efficient, practical tools for architects, engineers, and designers.
        </p>
      </header>

      <main style={{
        maxWidth: 900,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 32px #0002",
        padding: "40px 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        <section>
          <h2 style={{ fontSize: "2rem", marginBottom: 8 }}>Our Tools</h2>
          <div style={{
            display: "flex",
            gap: 32,
            flexWrap: "wrap",
            marginBottom: 32,
          }}>
            {TOOLS.map(tool => (
              <div key={tool.name} style={{
                flex: "1 1 320px",
                background: tool.active ? "#f6faff" : "#f8f8f8",
                border: tool.active ? "2px solid #1a365d" : "2px dashed #bbb",
                borderRadius: 12,
                padding: "24px 20px",
                boxShadow: tool.active ? "0 2px 12px #1a365d22" : "none",
                opacity: tool.active ? 1 : 0.7,
                position: "relative"
              }}>
                <h3 style={{
                  fontSize: "1.4rem",
                  margin: 0,
                  color: "#1a365d",
                  fontWeight: 600,
                  letterSpacing: 0.5
                }}>{tool.name}</h3>
                <p style={{ margin: "12px 0 18px 0", fontSize: "1.05rem", color: "#222" }}>{tool.desc}</p>
                <div style={{
                  fontWeight: 500,
                  fontSize: "1.1rem",
                  color: "#1a365d",
                  marginBottom: 8
                }}>Price: {tool.price}</div>
                {tool.active && (
                  <Link to={tool.link} style={{
                    display: "inline-block",
                    background: "#1a365d",
                    color: "#fff",
                    borderRadius: 6,
                    padding: "6px 16px",
                    fontSize: "1rem",
                    fontWeight: 500,
                    marginTop: 6,
                    textDecoration: "none"
                  }}>Open Tool</Link>
                )}
                {tool.comingSoon && (
                  <span style={{
                    display: "inline-block",
                    background: "#bbb",
                    color: "#fff",
                    borderRadius: 6,
                    padding: "4px 12px",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    marginTop: 6
                  }}>Coming Soon</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: "1.3rem", marginBottom: 8 }}>About GenFab Tools</h2>
          <p style={{ color: "#444", fontSize: "1.05rem" }}>
            GenFab Tools delivers practical, efficient solutions for building professionals.
            Our mission is to simplify complex calculations and design tasks, saving you time and ensuring compliance.
          </p>
          <ul style={{ color: "#444", fontSize: "1.05rem", marginTop: 10 }}>
            <li>Fast, reliable tools for everyday design needs</li>
            <li>Transparent pricing, no hidden fees</li>
            <li>Continuous updates and new features</li>
            <li>Dedicated support for subscribers</li>
          </ul>
        </section>
      </main>

      <footer style={{
        textAlign: "center",
        padding: "24px 0",
        color: "#888",
        fontSize: "1rem",
        background: "#f6faff",
        marginTop: 40,
        borderTop: "1px solid #e3eafc"
      }}>
        &copy; {new Date().getFullYear()} GenFab Tools. All rights reserved.
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/occucalc" element={<OccuCalc />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}