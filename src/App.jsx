import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:5050";

const TOOLS = [
  {
    name: "OccuCalc",
    desc: "Efficient occupant load calculator for architects and engineers. Instantly estimate safe occupancy for any space.",
    price: "$19/month",
    active: true,
  },
  {
    name: "ParkCore",
    desc: "Advanced parking design and analysis tool. Optimize layouts, maximize efficiency, and ensure compliance.",
    price: "$29/month",
    active: false,
    comingSoon: true,
  },
];

export default function App() {
  const [rooms, setRooms] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    try {
      const res = await fetch(`${API}/rooms`);
      const data = await res.json();
      setRooms(data);
    } catch (e) { setErr(String(e)); }
  }

  async function addSample() {
    setBusy(true); setErr("");
    try {
      const res = await fetch(`${API}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: "101", name: "Lobby", area: 120, occupancyType: "Assembly" })
      });
      if (!res.ok) throw new Error(await res.text());
      await load();
    } finally { setBusy(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <div style={{
      fontFamily: "system-ui, sans-serif",
      background: "linear-gradient(120deg,#f8fafc 0%,#e3eafc 100%)",
      minHeight: "100vh",
      padding: 0,
      margin: 0,
    }}>
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
                  <span style={{
                    display: "inline-block",
                    background: "#1a365d",
                    color: "#fff",
                    borderRadius: 6,
                    padding: "4px 12px",
                    fontSize: "0.95rem",
                    fontWeight: 500,
                    marginTop: 6
                  }}>Available</span>
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
          <h2 style={{ fontSize: "1.7rem", marginBottom: 12 }}>OccuCalc Tool</h2>
          <p style={{ marginBottom: 18, color: "#333" }}>
            Calculate occupant load for any room. Enter details below or add a sample room to try it out.
          </p>
          <div style={{
            background: "#f6faff",
            borderRadius: 10,
            padding: "24px 18px",
            boxShadow: "0 2px 8px #1a365d11",
            marginBottom: 24,
            maxWidth: 500
          }}>
            <button
              onClick={addSample}
              disabled={busy}
              style={{
                background: "#1a365d",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 22px",
                fontSize: "1.1rem",
                fontWeight: 500,
                cursor: busy ? "not-allowed" : "pointer",
                marginBottom: 12,
                boxShadow: "0 1px 4px #1a365d22"
              }}
            >
              {busy ? "Adding…" : "Add Sample Room"}
            </button>
            {err && <p style={{ color: "crimson", marginTop: 8 }}>{err}</p>}
            <pre style={{
              background: "#fff",
              padding: 12,
              borderRadius: 6,
              marginTop: 10,
              fontSize: "1rem",
              color: "#222",
              boxShadow: "0 1px 4px #0001"
            }}>
              {JSON.stringify(rooms, null, 2)}
            </pre>
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