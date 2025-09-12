// src/OccuCalcTools.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { jsPDF } from "jspdf";
// Backend API URL
const API_URL = "https://occupancy-backend-4.onrender.com";

// Example: Call backend when adding a sample room
async function addSampleRoom() {
    try {
        const response = await fetch(`${API_URL}/api/sample-room`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roomName: 'Sample Room', area: 100 })
        });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        console.log('Backend response:', data);
        // TODO: Update state/UI with backend data
    } catch (error) {
        console.error('Failed to fetch:', error);
    }
}

// CODE_SETS object (fix closing brackets)
const CODE_SETS = {
    GENERIC: {
        label: "Generic (edit as needed)",
        factors: {
            "Retail": 2.8,
            "Restaurant": 1.4,
            "Administrative": 9.3,
            "Mechanical": 28
        }
    }
};

const LS_OVERRIDES_KEY = "occuCalc.codeOverrides.v1";
const LS_DATA_MANUAL = "occuCalc.data.manual.v1";
const LS_DATA_UPLOAD = "occuCalc.data.upload.v1";
const LS_UI_PREFS = "occuCalc.ui.prefs.v1";

const normalizeType = (t, list) => {
    const v = (t || "").toString().trim();
    return list.includes(v) ? v : (list[0] || "Retail");
};
const toNumber = (x) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : 0;
};
const ceilDivide = (area, factor) => {
    const a = Number(area);
    const f = Number(factor) > 0 ? Number(factor) : 1;
    if (!Number.isFinite(a) || a <= 0) return 0;
    return Math.ceil(a / f);
};

export default function OccuCalcTools() {
    // Mode and active code-set
    const [mode, setMode] = useState("manual"); // "manual" | "upload"
    const [codeId, setCodeId] = useState("IBC_2024");
    // Unit system state
    const [unitSystem, setUnitSystem] = useState("metric"); // "metric" | "imperial"

    // overrides per code (allow edits)
    const [overrides, setOverrides] = useState({});
    useEffect(() => {
        try {
            const raw = localStorage.getItem(LS_OVERRIDES_KEY);
            if (raw) setOverrides(JSON.parse(raw));
        } catch { }
    }, []);
    useEffect(() => {
        try {
            localStorage.setItem(LS_OVERRIDES_KEY, JSON.stringify(overrides));
        } catch { }
    }, [overrides]);

    // current factors/type list
    const baseFactors = CODE_SETS[codeId]?.factors || CODE_SETS.GENERIC.factors;
    const currentFactors = useMemo(
        () => ({ ...baseFactors, ...(overrides[codeId] || {}) }),
        [baseFactors, overrides, codeId]
    );
    const typeList = useMemo(() => Object.keys(currentFactors), [currentFactors]);

    // -------------------- data (manual + upload) with autosave
    const [manualRows, setManualRows] = useState(() => {
        const saved = localStorage.getItem(LS_DATA_MANUAL);
        return saved
            ? JSON.parse(saved)
            : [{ id: 1, sel: false, number: "1", name: "Space 1", area: "", type: normalizeType("Retail", typeList) }];
    });
    const [gridRows, setGridRows] = useState(() => {
        const saved = localStorage.getItem(LS_DATA_UPLOAD);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(LS_DATA_MANUAL, JSON.stringify(manualRows));
    }, [manualRows]);
    useEffect(() => {
        localStorage.setItem(LS_DATA_UPLOAD, JSON.stringify(gridRows));
    }, [gridRows]);

    // Adjust existing rows if type list changes
    useEffect(() => {
        setManualRows((prev) => prev.map((r) => ({ ...r, type: normalizeType(r.type, typeList) })));
        setGridRows((prev) =>
            prev.map((r) => {
                const t = normalizeType(r["Occupancy Type"], typeList);
                return {
                    ...r,
                    "Occupancy Type": t,
                    "Occupant Load": ceilDivide(r["Area (m²)"], currentFactors[t])
                };
            })
        );
    }, [typeList, currentFactors]);

    // ...existing code for UI, handlers, and rendering (see previous tool calls for full code)...
    return (
        <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 1220, margin: "0 auto" }}>
            <h1 style={{ margin: 0 }}>🏢 OccuCalc</h1>
            <p style={{ color: "#444", marginTop: 6 }}>
                Calculate occupant loads with search, filters, bulk actions, and exports. Factors are editable per code set.
            </p>
            {/* ...rest of the UI and logic... */}
        </div>
    );
}
