import React from "react";
// You can import and reuse your OccuCalcTools here if needed
// import OccuCalcTools from '../../occupancy-calculator/src/OccuCalcTools';

export default function OccuCalc() {
    return (
        <main style={{ fontFamily: "system-ui, sans-serif", padding: 40, maxWidth: 900, margin: "40px auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px #0002" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: 24 }}>OccuCalc Tool</h2>
            <p>Calculate occupant load for any room. Enter details below or add a sample room to try it out.</p>
            {/* TODO: Add your full OccuCalcTools UI and logic here */}
            <div style={{ marginTop: 32, color: '#888' }}>
                <em>OccuCalc tool features coming soon...</em>
            </div>
        </main>
    );
}
