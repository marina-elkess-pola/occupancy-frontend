// src/OccuCalcTools.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import occuCalcLogo from './assets/occucalc-logo.png';

/* =========================================================
   Code sets (starter defaults, m² per person).
   These are convenience defaults; verify against local code.
   ========================================================= */
const CODE_SETS = {
    IBC_2024: {
        label: "IBC 2024 (Table 1004.5) – starter",
        factors: {
            "Assembly – fixed seats": 1,
            "Assembly – standing": 0.65,
            "Assembly – tables & chairs": 1.4,
            "Classroom": 1.9,
            "Laboratory": 4.6,
            "Library – reading": 4.6,
            "Library – stack area": 9.3,
            "Business/Office": 9.3,
            "Retail / Mercantile – sales floor": 2.8,
            "Retail – storage/back of house": 28,
            "Residential – dwelling unit": 18.6,
            "Residential – hotel/motel": 18.6,
            "Residential – dormitory": 9.3,
            "Industrial – shop/plant": 9.3,
            "Educational – day care": 3.7,
            "Educational – K-12": 1.9,
            "Medical – in-patient": 22.3,
            "Medical – out-patient": 9.3,
            "Storage – general": 46.5,
            "Parking garage": 46.5,
            "Mechanical / Electrical": 28,
            "Corridor": 0.5,
            "Stair": 0.25
        }
    },
    IBC_2018: {
        label: "IBC 2018 (Table 1004.5)",
        factors: {
            "Assembly – fixed seats": 1,
            "Assembly – standing": 0.65,
            "Assembly – tables & chairs": 1.4,
            "Classroom": 1.9,
            "Laboratory": 4.6,
            "Business/Office": 9.3,
            "Retail / Mercantile – sales floor": 2.8,
            "Retail – storage/back of house": 28,
            "Residential – dwelling unit": 18.6,
            "Residential – hotel/motel": 18.6,
            "Residential – dormitory": 9.3,
            "Industrial – shop/plant": 9.3,
            "Educational – day care": 3.7,
            "Educational – K-12": 1.9,
            "Medical – in-patient": 22.3,
            "Medical – out-patient": 9.3,
            "Storage – general": 46.5,
            "Parking garage": 46.5,
            "Mechanical / Electrical": 28,
            "Corridor": 0.5,
            "Stair": 0.25
        }
    },
    NFPA_101_2024: {
        label: "NFPA 101 (2024) – starter",
        factors: {
            "Assembly – standing": 0.65,
            "Assembly – tables & chairs": 1.4,
            "Classroom": 1.9,
            "Laboratory": 4.6,
            "Business/Office": 9.3,
            "Retail / Mercantile – sales floor": 2.8,
            "Residential – hotel/motel": 18.6,
            "Residential – dormitory": 9.3,
            "Industrial – shop/plant": 9.3,
            "Medical – out-patient": 9.3,
            "Storage – general": 46.5,
            "Mechanical / Electrical": 28
        }
    },
    NFPA_5000_2021: {
        label: "NFPA 5000 (2021)",
        factors: {
            "Assembly – standing": 0.65,
            "Assembly – tables & chairs": 1.4,
            "Classroom": 1.9,
            "Laboratory": 4.6,
            "Business/Office": 9.3,
            "Retail / Mercantile – sales floor": 2.8,
            "Residential – hotel/motel": 18.6,
            "Residential – dormitory": 9.3,
            "Industrial – shop/plant": 9.3,
            "Medical – out-patient": 9.3,
            "Storage – general": 46.5,
            "Mechanical / Electrical": 28
        }
    },
    UK_ADB_2023: {
        label: "UK Approved Document B (2023) – starter",
        factors: {
            "Assembly – standing": 0.5,
            "Assembly – tables & chairs": 1,
            "Office": 10,
            "Retail": 2.5,
            "Schools – general": 2,
            "Residential – hotel": 18,
            "Residential – dwelling": 18,
            "Industrial": 10,
            "Storage": 50
        }
    },
    AU_NCC_2019: {
        label: "Australia NCC (2019)",
        factors: {
            "Assembly": 1,
            "Office": 10,
            "Retail": 2.5,
            "Schools": 2,
            "Residential": 18,
            "Industrial": 10,
            "Storage": 50
        }
    },
    CA_NBC_2015: {
        label: "Canada NBC (2015)",
        factors: {
            "Assembly": 0.75,
            "Office": 9.3,
            "Retail": 2.8,
            "Schools": 2,
            "Residential": 18.6,
            "Industrial": 9.3,
            "Storage": 46.5
        }
    },
    EU_Eurocode: {
        label: "EU Eurocode (EN 1991-1-1)",
        factors: {
            "Assembly": 0.5,
            "Office": 10,
            "Retail": 2.5,
            "Schools": 2,
            "Residential": 18,
            "Industrial": 10,
            "Storage": 50
        }
    },
    UAE_FireCode: {
        label: "UAE Fire & Life Safety Code",
        factors: {
            "Assembly": 0.65,
            "Office": 9.3,
            "Retail": 2.8,
            "Schools": 2,
            "Residential": 18.6,
            "Industrial": 9.3,
            "Storage": 46.5
        }
    },
    SAUDI_BuildingCode: {
        label: "Saudi Building Code",
        factors: {
            "Assembly": 0.65,
            "Office": 9.3,
            "Retail": 2.8,
            "Schools": 2,
            "Residential": 18.6,
            "Industrial": 9.3,
            "Storage": 46.5
        }
    },
    EGYPT_BuildingCode: {
        label: "Egypt Building Code",
        factors: {
            "Assembly": 0.65,
            "Office": 9.3,
            "Retail": 2.8,
            "Schools": 2,
            "Residential": 18.6,
            "Industrial": 9.3,
            "Storage": 46.5
        }
    },
    GENERIC: {
        label: "Generic (edit as needed)",
        factors: {
            "Retail": 2.8,
            "Restaurant": 1.4,
            "Administrative": 9.3,
            "Mechanical": 28
        }
    },
    CUSTOM: {
        label: "Custom (user-defined)",
        factors: {}
    }
};

// localStorage keys
const LS_OVERRIDES_KEY = "occuCalc.codeOverrides.v1";
const LS_DATA_MANUAL = "occuCalc.data.manual.v1";
const LS_DATA_UPLOAD = "occuCalc.data.upload.v1";
const LS_UI_PREFS = "occuCalc.ui.prefs.v1";

// -------------- helpers
const normalizeType = (t, list) => {
    const v = (t || "").toString().trim();
    return list.includes(v) ? v : (list[0] || "Retail");
};
const toNumber = (x) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : 0;
};
const ceilDivide = (area, factor, unitSystem) => {
    let a = Number(area);
    let f = Number(factor) > 0 ? Number(factor) : 1;
    if (unitSystem === 'imperial') {
        // Convert area to ft² if input is m²
        a = a * 10.764;
    }
    if (!Number.isFinite(a) || a <= 0) return 0;
    return Math.ceil(a / f);
};

// =========================================================
// Component
// =========================================================
export default function OccuCalcTools() {
    // Mode and active code-set
    const [mode, setMode] = useState("manual"); // "manual" | "upload"
    const [codeId, setCodeId] = useState("IBC_2024");

    // Metric/Imperial toggle
    const [unitSystem, setUnitSystem] = useState(() => {
        const saved = localStorage.getItem('occuCalc.unitSystem');
        return saved === 'imperial' ? 'imperial' : 'metric';
    });
    useEffect(() => {
        localStorage.setItem('occuCalc.unitSystem', unitSystem);
    }, [unitSystem]);
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

    // --- Fix load calculation: recalculate on area/type/code/unitSystem/manualRows/gridRows change ---
    useEffect(() => {
        setManualRows(rows => rows.map(r => {
            const factor = currentFactors[r.type] || 1;
            return {
                ...r,
                load: ceilDivide(r.area, factor, unitSystem)
            };
        }));
    }, [currentFactors, unitSystem, codeId, manualRows]);
    useEffect(() => {
        setGridRows(rows => rows.map(r => {
            const factor = currentFactors[r["Occupancy Type"]] || 1;
            return {
                ...r,
                Load: ceilDivide(r["Area"], factor, unitSystem)
            };
        }));
    }, [currentFactors, unitSystem, codeId, gridRows]);

    // -------------------- UI state: search/filter/sort & prefs
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [sortKey, setSortKey] = useState("number"); // or "name" | "area" | "type" | "load"
    const [sortDir, setSortDir] = useState("asc");    // "asc" | "desc"
    const [showEditor, setShowEditor] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem(LS_UI_PREFS);
        if (saved) {
            try {
                const prefs = JSON.parse(saved);
                if (prefs.mode) setMode(prefs.mode);
                if (prefs.codeId) setCodeId(prefs.codeId);
                if (prefs.filterType) setFilterType(prefs.filterType);
            } catch { }
        }
    }, []);
    useEffect(() => {
        localStorage.setItem(
            LS_UI_PREFS,
            JSON.stringify({ mode, codeId, filterType })
        );
    }, [mode, codeId, filterType]);

    // -------------------- derived rows (filter/search/sort)
    const displayedManual = useMemo(() => {
        let rows = manualRows.map((r) => ({
            ...r,
            load: ceilDivide(r.area, currentFactors[r.type], unitSystem)
        }));
        if (filterType !== "All") rows = rows.filter((r) => r.type === filterType);
        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter(
                (r) =>
                    String(r.number).toLowerCase().includes(q) ||
                    String(r.name).toLowerCase().includes(q)
            );
        }
        rows.sort((a, b) => {
            const dir = sortDir === "asc" ? 1 : -1;
            const val = (k, x) =>
                k === "area" || k === "load" ? toNumber(x[k]) : String(x[k] || "");
            const va = val(sortKey, a);
            const vb = val(sortKey, b);
            if (va < vb) return -1 * dir;
            if (va > vb) return 1 * dir;
            return 0;
        });
        return rows;
    }, [manualRows, filterType, search, sortKey, sortDir, currentFactors, unitSystem]);

    const displayedGrid = useMemo(() => {
        let rows = gridRows.map((r) => ({
            ...r,
            "Occupant Load": ceilDivide(
                r["Area (m²)"],
                currentFactors[r["Occupancy Type"]],
                unitSystem
            )
        }));
        if (filterType !== "All")
            rows = rows.filter((r) => r["Occupancy Type"] === filterType);
        if (search.trim()) {
            const q = search.toLowerCase();
            rows = rows.filter(
                (r) =>
                    String(r["Room #"]).toLowerCase().includes(q) ||
                    String(r["Room Name"]).toLowerCase().includes(q)
            );
        }
        rows.sort((a, b) => {
            const dir = sortDir === "asc" ? 1 : -1;
            const keyMap = {
                number: "Room #",
                name: "Room Name",
                area: `Area (${unitSystem === 'imperial' ? 'ft²' : 'm²'})`,
                type: "Occupancy Type",
                load: "Occupant Load"
            };
            const col = keyMap[sortKey] || "Room #";
            const va = (col === `Area (${unitSystem === 'imperial' ? 'ft²' : 'm²'})` || col === "Occupant Load") ? toNumber(a[col]) : String(a[col] || "");
            const vb = (col === `Area (${unitSystem === 'imperial' ? 'ft²' : 'm²'})` || col === "Occupant Load") ? toNumber(b[col]) : String(b[col] || "");
            if (va < vb) return -1 * dir;
            if (va > vb) return 1 * dir;
            return 0;
        });
        return rows;
    }, [gridRows, filterType, search, sortKey, sortDir, currentFactors, unitSystem]);

    // -------------------- selection (bulk actions)
    const selCount = useMemo(() => {
        return (mode === "manual" ? manualRows : gridRows).filter((r) => r.sel).length;
    }, [mode, manualRows, gridRows]);

    const setAllSelected = (checked) => {
        if (mode === "manual") {
            setManualRows((prev) => prev.map((r) => ({ ...r, sel: checked })));
        } else {
            setGridRows((prev) => prev.map((r) => ({ ...r, sel: checked })));
        }
    };

    const applyTypeToSelected = (type) => {
        if (!type) return;
        if (mode === "manual") {
            setManualRows((prev) =>
                prev.map((r) =>
                    r.sel ? { ...r, type: normalizeType(type, typeList) } : r
                )
            );
        } else {
            setGridRows((prev) =>
                prev.map((r) =>
                    r.sel
                        ? {
                            ...r,
                            "Occupancy Type": normalizeType(type, typeList),
                            "Occupant Load": ceilDivide(
                                r["Area (m²)"],
                                currentFactors[normalizeType(type, typeList)]
                            )
                        }
                        : r
                )
            );
        }
    };

    const deleteSelected = () => {
        if (mode === "manual") {
            setManualRows((prev) => prev.filter((r) => !r.sel));
        } else {
            setGridRows((prev) => prev.filter((r) => !r.sel));
        }
    };

    const duplicateSelected = () => {
        if (mode === "manual") {
            setManualRows((prev) => {
                const maxId = prev.reduce((m, r) => Math.max(m, r.id), 0);
                let nextId = maxId + 1;
                const dups = prev
                    .filter((r) => r.sel)
                    .map((r) => ({ ...r, id: nextId++, number: String(nextId - 1), sel: false }));
                return [...prev, ...dups];
            });
        } else {
            setGridRows((prev) => {
                const maxId = prev.reduce((m, r) => Math.max(m, r.id), 0);
                let nextId = maxId + 1;
                const dups = prev
                    .filter((r) => r.sel)
                    .map((r) => ({ ...r, id: nextId++, sel: false }));
                return [...prev, ...dups];
            });
        }
    };

    // -------------------- CRUD (manual)
    const addManualRow = (qty = 1) => {
        setManualRows((prev) => {
            const maxId = prev.reduce((m, r) => Math.max(m, r.id), 0);
            const rows = [];
            for (let i = 0; i < qty; i++) {
                const id = maxId + 1 + i;
                rows.push({
                    id,
                    sel: false,
                    number: String(id),
                    name: `Space ${id}`,
                    area: "",
                    type: normalizeType(typeList[0], typeList)
                });
            }
            return [...prev, ...rows];
        });
    };
    const addManualAllTypes = () => {
        setManualRows((prev) => {
            const maxId = prev.reduce((m, r) => Math.max(m, r.id), 0);
            let nextId = maxId + 1;
            const rows = typeList.map((t) => ({
                id: nextId,
                sel: false,
                number: String(nextId++),
                name: t,
                area: "",
                type: t
            }));
            return [...prev, ...rows];
        });
    };
    const updateManual = (id, key, value) => {
        setManualRows((prev) =>
            prev.map((r) => {
                if (r.id !== id) return r;
                if (key === "type") return { ...r, type: normalizeType(value, typeList) };
                return { ...r, [key]: value };
            })
        );
    };
    const removeManualRow = (id) =>
        setManualRows((prev) => prev.filter((r) => r.id !== id));
    const clearManual = () =>
        setManualRows([{ id: 1, sel: false, number: "1", name: "Space 1", area: "", type: normalizeType("Retail", typeList) }]);

    // -------------------- Upload grid
    const fileInputRef = useRef(null);

    const handleUpload = (file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const wb = XLSX.read(evt.target.result, { type: "binary" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json(ws, { defval: "" }).map((row, i) => {
                const number = row["Room #"] ?? row["Room Number"] ?? String(i + 1);
                const name = row["Room Name"] ?? row["Name"] ?? `Space ${i + 1}`;
                const area = row["Area (m²)"] ?? row["Area"] ?? "";
                const tRaw = row["Occupancy Type"] ?? row["Type"];
                const t = normalizeType(tRaw, typeList);
                return {
                    id: i + 1,
                    sel: false,
                    "Room #": String(number),
                    "Room Name": String(name),
                    "Area (m²)": area,
                    "Occupancy Type": t,
                    "Occupant Load": ceilDivide(area, currentFactors[t])
                };
            });
            setGridRows(rows);
        };
        reader.readAsBinaryString(file);
    };

    const onFileInput = (e) => {
        handleUpload(e.target.files?.[0]);
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    // Drag & drop
    const [isDragging, setIsDragging] = useState(false);
    const onDropZone = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && /(\.xlsx|\.xls)$/i.test(file.name)) handleUpload(file);
    };
    const onDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const onDragLeave = () => setIsDragging(false);

    const updateGrid = (id, key, value) => {
        setGridRows((prev) =>
            prev.map((r) => {
                if (r.id !== id) return r;
                const next = { ...r, [key]: value };
                const t = normalizeType(next["Occupancy Type"], typeList);
                next["Occupancy Type"] = t;
                next["Occupant Load"] = ceilDivide(next["Area (m²)"], currentFactors[t]);
                return next;
            })
        );
    };
    const addGridRow = (qty = 1) => {
        setGridRows((prev) => {
            const maxId = prev.reduce((m, r) => Math.max(m, r.id), 0);
            const rows = [];
            for (let i = 0; i < qty; i++) {
                const id = maxId + 1 + i;
                rows.push({
                    id,
                    sel: false,
                    "Room #": String(id),
                    "Room Name": `Space ${id}`,
                    "Area (m²)": "",
                    "Occupancy Type": normalizeType(typeList[0], typeList),
                    "Occupant Load": 0
                });
            }
            return [...prev, ...rows];
        });
    };
    const addGridAllTypes = () => {
        setGridRows((prev) => {
            const maxId = prev.reduce((m, r) => Math.max(m, r.id), 0);
            let nextId = maxId + 1;
            const rows = typeList.map((t) => ({
                id: nextId,
                sel: false,
                "Room #": String(nextId++),
                "Room Name": t,
                "Area (m²)": "",
                "Occupancy Type": t,
                "Occupant Load": 0
            }));
            return [...prev, ...rows];
        });
    };
    const removeGridRow = (id) =>
        setGridRows((prev) => prev.filter((r) => r.id !== id));
    const clearGrid = () => setGridRows([]);

    // -------------------- Exports & template
    const rowsForExport = () => {
        return mode === "manual"
            ? manualRows.map((r) => ({
                "Room #": r.number,
                "Room Name": r.name,
                "Area (m²)": r.area,
                "Occupancy Type": r.type,
                "Occupant Load": ceilDivide(r.area, currentFactors[r.type])
            }))
            : gridRows.map((r) => ({
                "Room #": r["Room #"],
                "Room Name": r["Room Name"],
                "Area (m²)": r["Area (m²)"],
                "Occupancy Type": r["Occupancy Type"],
                "Occupant Load": ceilDivide(r["Area (m²)"], currentFactors[r["Occupancy Type"]])
            }));
    };

    const exportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(rowsForExport(), {
            header: ["Room #", "Room Name", "Area (m²)", "Occupancy Type", "Occupant Load"]
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Occupancy");
        const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        saveAs(new Blob([buf], { type: "application/octet-stream" }), "occupancy_data.xlsx");
    };

    const exportPDFSummary = () => {
        const totals = {};
        let total = 0;
        rowsForExport().forEach((r) => {
            const t = r["Occupancy Type"];
            const l = toNumber(r["Occupant Load"]);
            totals[t] = (totals[t] || 0) + l;
            total += l;
        });

        const doc = new jsPDF({ unit: "pt", format: "a4" });
        let y = 64;
        doc.setFontSize(18);
        doc.text(`Occupancy Summary – ${CODE_SETS[codeId]?.label || codeId}`, 40, y);
        y += 24;

        doc.setFontSize(12);
        Object.entries(totals).forEach(([k, v]) => {
            doc.text(`${k}: ${v} occupants`, 40, y);
            y += 16;
        });

        y += 10;
        doc.setFontSize(14);
        doc.text(`Grand Total: ${total} occupants`, 40, y);
        doc.save("occupancy_summary.pdf");
    };

    const exportPDFDetailed = () => {
        const rows = rowsForExport();
        const doc = new jsPDF({ unit: "pt", format: "a4" });
        let y = 64;

        doc.setFontSize(18);
        doc.text(`Occupancy Detailed Report – ${CODE_SETS[codeId]?.label || codeId}`, 40, y);
        y += 24;

        doc.setFontSize(10);
        doc.text("Room #", 40, y);
        doc.text("Room Name", 110, y);
        doc.text("Area (m²)", 280, y);
        doc.text("Type", 360, y);
        doc.text("Load", 460, y);
        y += 12;
        doc.line(40, y, 520, y);
        y += 12;

        rows.forEach((r) => {
            if (y > 760) {
                doc.addPage();
                y = 64;
            }
            doc.text(String(r["Room #"]), 40, y);
            doc.text(String(r["Room Name"]), 110, y);
            doc.text(String(r["Area (m²)"]), 280, y);
            doc.text(String(r["Occupancy Type"]), 360, y);
            doc.text(String(r["Occupant Load"]), 460, y);
            y += 14;
        });

        y += 12;
        doc.setFontSize(12);
        const grand = rows.reduce((s, r) => s + toNumber(r["Occupant Load"]), 0);
        doc.text(`Grand Total: ${grand} occupants`, 40, y);
        doc.save("occupancy_detailed.pdf");
    };

    const downloadTemplate = () => {
        const example = [
            { "Room #": "101", "Room Name": "Open Office", "Area (m²)": 186, "Occupancy Type": "Business/Office" },
            { "Room #": "102", "Room Name": "Sales Floor", "Area (m²)": 140, "Occupancy Type": "Retail / Mercantile – sales floor" },
            { "Room #": "103", "Room Name": "Lab 1", "Area (m²)": 56, "Occupancy Type": "Laboratory" }
        ];
        const ws = XLSX.utils.json_to_sheet(example, {
            header: ["Room #", "Room Name", "Area (m²)", "Occupancy Type"]
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template");
        const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
        saveAs(new Blob([buf], { type: "application/octet-stream" }), "OccuCalc_template.xlsx");
    };

    // -------------------- factor editing
    const [newTypeName, setNewTypeName] = useState("");
    const setFactorFor = (type, value) => {
        const v = Number(value);
        if (!Number.isFinite(v) || v <= 0) return;
        setOverrides((prev) => ({
            ...prev,
            [codeId]: { ...(prev[codeId] || {}), [type]: v }
        }));
    };
    const addNewType = () => {
        const n = newTypeName.trim();
        if (!n || typeList.includes(n)) return;
        setOverrides((prev) => ({
            ...prev,
            [codeId]: { ...(prev[codeId] || {}), [n]: 10 }
        }));
        setNewTypeName("");
    };
    const deleteType = (type) => {
        if (Object.prototype.hasOwnProperty.call(baseFactors, type)) return; // base types cannot be deleted here
        setOverrides((prev) => {
            const curr = { ...(prev[codeId] || {}) };
            delete curr[type];
            return { ...prev, [codeId]: curr };
        });
    };
    const resetCodeToDefaults = () =>
        setOverrides((prev) => {
            const next = { ...prev };
            delete next[codeId];
            return next;
        });

    // -------------------- UI
    const isManual = mode === "manual";
    const visibleRows = isManual ? displayedManual : displayedGrid;

    const toggleSort = (key) => {
        if (sortKey !== key) {
            setSortKey(key);
            setSortDir("asc");
        } else {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        }
    };

    return (
        <div style={{ fontFamily: "system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", padding: 0, margin: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100vw", overflowX: "hidden" }}>
            <div style={{ maxWidth: 1200, width: "100%", margin: "0 auto", padding: "32px 0 0 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16, justifyContent: "center" }}>
                    <img src={occuCalcLogo} alt="OccuCalc logo" style={{ width: 56, height: 56, marginRight: 8, borderRadius: 12, background: '#fff' }} />
                    <h1 style={{ fontSize: "2.6rem", fontWeight: 700, margin: 0, letterSpacing: 1, textAlign: "center" }}>
                        OccuCalc
                    </h1>
                </div>
                <p style={{ color: "#444", marginTop: 6, textAlign: "center" }}>
                    Calculate occupant loads with search, filters, bulk actions, and exports. Factors are editable per code set.
                </p>

                {/* Control bar */}
                <div style={{ ...bar(), position: "sticky", top: 0, zIndex: 10, background: "#f8fafc", paddingBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <label><strong>Units:</strong></label>
                        <select value={unitSystem} onChange={e => setUnitSystem(e.target.value)} style={select(120)}>
                            <option value="metric">Metric (m²)</option>
                            <option value="imperial">Imperial (ft²)</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                        {/* Add Row and Remove Row buttons for manual mode */}
                        {mode === "manual" && (
                            <>
                                <button onClick={() => addManualRow(1)} style={btn("primary")}>+ Add Row</button>
                                <button
                                    onClick={() => setManualRows(rows => rows.slice(0, -1))}
                                    style={btn("danger")}
                                    disabled={manualRows.length === 0}
                                    title="Remove the last row"
                                >
                                    Remove Row
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => (mode === 'manual' ? addManualRow(1) : addGridRow(1))}
                            style={{ ...btn(), fontSize: 18, fontWeight: 600, marginRight: 8 }}
                            title="Add a new space/room"
                        >
                            ＋ Add Row
                        </button>
                        <label><strong>Mode:</strong></label>
                        <select value={mode} onChange={(e) => setMode(e.target.value)} style={select(160)}>
                            <option value="manual">Manual entry</option>
                            <option value="upload">Upload Excel</option>
                        </select>

                        <label><strong>Code:</strong></label>
                        <select value={codeId} onChange={(e) => setCodeId(e.target.value)} style={select(260)}>
                            {Object.entries(CODE_SETS).map(([id, cfg]) => (
                                <option key={id} value={id}>{cfg.label}</option>
                            ))}
                        </select>

                        <button onClick={() => setShowEditor((s) => !s)} style={btn("ghost")}>
                            {showEditor ? "Hide factors" : "Edit factors"}
                        </button>

                        <label><strong>Type filter:</strong></label>
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={select(200)}>
                            <option>All</option>
                            {typeList.map((t) => <option key={t}>{t}</option>)}
                        </select>

                        <input
                            placeholder="Search room # / name…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={input(220)}
                        />

                        {isManual ? (
                            <>
                                <button onClick={() => addManualRow(1)} style={btn()}>Add 1</button>
                                <button onClick={() => addManualRow(10)} style={btn()}>Add 10</button>
                                <button onClick={addManualAllTypes} style={btn()}>Add one per type</button>
                                <button onClick={clearManual} style={btn("ghost")}>Clear</button>
                            </>
                        ) : (
                            <>
                                <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={onFileInput} title="Upload Excel" />
                                <button onClick={addGridRow} style={btn()}>Add 1</button>
                                <button onClick={() => addGridRow(10)} style={btn()}>Add 10</button>
                                <button onClick={addGridAllTypes} style={btn()}>Add one per type</button>
                                <button onClick={clearGrid} style={btn("ghost")}>Clear</button>
                                <button onClick={downloadTemplate} style={btn("ghost")}>Template</button>
                            </>
                        )}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={exportExcel} style={btn()}>Export Excel</button>
                        <button onClick={exportPDFSummary} style={btn()}>PDF Summary</button>
                        <button onClick={exportPDFDetailed} style={btn()}>PDF Detailed</button>
                    </div>
                </div>

                {/* Factor editor */}
                {showEditor && (
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 12, marginTop: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                            <strong>Factors for: {CODE_SETS[codeId]?.label || codeId}</strong>
                            <button onClick={resetCodeToDefaults} style={btn("danger")}>Reset to defaults</button>
                        </div>
                        <div style={{ overflowX: "auto", marginTop: 10 }}>
                            <table style={table()}>
                                <thead>
                                    <tr>
                                        <th style={th(320)}>Occupancy Type</th>
                                        <th style={th(200)}>{`Factor (${unitSystem === 'imperial' ? 'ft²' : 'm²'}/person)`}</th>
                                        <th style={th(120)}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {typeList.map((t) => (
                                        <tr key={t}>
                                            <td style={td(320)}>{t}</td>
                                            <td style={td(200)}>
                                                <input
                                                    type="number"
                                                    min="0.01"
                                                    step="0.01"
                                                    value={currentFactors[t]}
                                                    onChange={(e) => setFactorFor(t, e.target.value)}
                                                    style={input(180)}
                                                />
                                            </td>
                                            <td style={td(120)}>
                                                {!Object.prototype.hasOwnProperty.call(baseFactors, t) && (
                                                    <button onClick={() => deleteType(t)} style={btn("danger")}>Delete</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td style={td(320)}>
                                            <input
                                                placeholder="Add new type (e.g., Assembly – exhibition)"
                                                value={newTypeName}
                                                onChange={(e) => setNewTypeName(e.target.value)}
                                                style={input(300)}
                                            />
                                        </td>
                                        <td style={td(200)}>
                                            <em style={{ color: "#666" }}>Default 10 m²/person (edit after adding)</em>
                                        </td>
                                        <td style={td(120)}>
                                            <button onClick={addNewType} style={btn()}>Add type</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p style={{ color: "#888", marginTop: 8 }}>
                            These are convenience defaults. Always verify against the official code adopted in your project’s jurisdiction.
                        </p>
                    </div>
                )}

                {/* Drag & drop zone for upload mode */}
                {!isManual && (
                    <div
                        onDrop={onDropZone}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        style={{
                            marginTop: 12,
                            padding: 14,
                            border: "2px dashed #cbd5e1",
                            borderRadius: 10,
                            textAlign: "center",
                            background: isDragging ? "#f0f9ff" : "#fafafa"
                        }}
                    >
                        Drag & drop an Excel file (.xlsx / .xls) here, or use the file picker above.
                    </div>
                )}

                {/* Grid + Summary */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginTop: 16, height: "70vh" }}>
                    <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: 10, background: "#fafafa", display: "flex", alignItems: "center", gap: 8, position: "sticky", top: 0, zIndex: 2 }}>
                            <strong>{isManual ? "Manual Entry" : "Uploaded / Editable Grid"}</strong>
                            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                                <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <input
                                        type="checkbox"
                                        checked={visibleRows.length > 0 && visibleRows.every((r) => r.sel)}
                                        onChange={(e) => setAllSelected(e.target.checked)}
                                    />
                                    Select all ({selCount})
                                </label>

                                {/* Bulk actions */}
                                <select
                                    onChange={(e) => {
                                        if (e.target.value === "__") return;
                                        applyTypeToSelected(e.target.value);
                                        e.target.value = "__";
                                    }}
                                    defaultValue="__"
                                    style={select(200)}
                                    title="Apply type to selected rows"
                                >
                                    <option value="__" disabled>Apply type to selected…</option>
                                    {typeList.map((t) => <option key={t}>{t}</option>)}
                                </select>
                                <button onClick={duplicateSelected} disabled={selCount === 0} style={btn("ghost")}>Duplicate</button>
                                <button
                                    onClick={deleteSelected}
                                    disabled={selCount === 0}
                                    style={btn("danger")}
                                    title="Delete only selected rows"
                                >
                                    Delete Selected
                                </button>
                                <button
                                    onClick={() => {
                                        if (mode === "manual") setManualRows([]);
                                        else setGridRows([]);
                                    }}
                                    style={btn("danger")}
                                    title="Delete all rows in the grid"
                                >
                                    Delete All
                                </button>
                            </div>
                        </div>

                        <div style={{ overflowX: "auto", overflowY: "auto", flex: 1, minHeight: 0 }}>
                            {isManual ? (
                                <table style={table()}>
                                    <thead>
                                        <tr>
                                            <th style={th(40)}></th>
                                            <Th label="#" onClick={() => toggleSort("number")} active={sortKey === "number"} dir={sortDir} />
                                            <Th label="Room Name" onClick={() => toggleSort("name")} active={sortKey === "name"} dir={sortDir} />
                                            <Th label={`Area (${unitSystem === 'imperial' ? 'ft²' : 'm²'})`} width={120} onClick={() => toggleSort("area")} active={sortKey === "area"} dir={sortDir} />
                                            <Th label="Occupancy Type" width={240} onClick={() => toggleSort("type")} active={sortKey === "type"} dir={sortDir} />
                                            <Th label="Load" width={100} onClick={() => toggleSort("load")} active={sortKey === "load"} dir={sortDir} />
                                            <th style={th(60)}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedManual.map((r) => (
                                            <tr key={r.id}>
                                                <td style={td(40)}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!r.sel}
                                                        onChange={(e) =>
                                                            setManualRows((prev) => prev.map((x) => x.id === r.id ? { ...x, sel: e.target.checked } : x))
                                                        }
                                                    />
                                                </td>
                                                <td style={td(80)}>
                                                    <input value={r.number} onChange={(e) => updateManual(r.id, "number", e.target.value)} style={input(70)} />
                                                </td>
                                                <td style={td()}>
                                                    <input value={r.name} onChange={(e) => updateManual(r.id, "name", e.target.value)} style={input()} />
                                                </td>
                                                <td style={td(120)}>
                                                    <input
                                                        value={r.area}
                                                        onChange={(e) => updateManual(r.id, "area", e.target.value)}
                                                        style={input(100)}
                                                        inputMode="decimal"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td style={td(240)}>
                                                    <select
                                                        value={r.type}
                                                        onChange={(e) => updateManual(r.id, "type", e.target.value)}
                                                        style={select(220)}
                                                    >
                                                        {typeList.map((t) => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </td>
                                                <td style={td(100)}><span style={pill()}>{r.load}</span></td>
                                                <td style={td(60)}>
                                                    <button onClick={() => removeManualRow(r.id)} style={btn("danger")}>×</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {displayedManual.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ padding: 16, textAlign: "center", color: "#666" }}>
                                                    No rows match your filters. Try clearing search/type filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            ) : (
                                <table style={table()}>
                                    <thead>
                                        <tr>
                                            <th style={th(40)}></th>
                                            <Th label="Room #" width={100} onClick={() => toggleSort("number")} active={sortKey === "number"} dir={sortDir} />
                                            <Th label="Room Name" onClick={() => toggleSort("name")} active={sortKey === "name"} dir={sortDir} />
                                            <Th label={`Area (${unitSystem === 'imperial' ? 'ft²' : 'm²'})`} width={120} onClick={() => toggleSort("area")} active={sortKey === "area"} dir={sortDir} />
                                            <Th label="Occupancy Type" width={260} onClick={() => toggleSort("type")} active={sortKey === "type"} dir={sortDir} />
                                            <Th label="Load" width={100} onClick={() => toggleSort("load")} active={sortKey === "load"} dir={sortDir} />
                                            <th style={th(60)}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayedGrid.map((r) => (
                                            <tr key={r.id}>
                                                <td style={td(40)}>
                                                    <input
                                                        type="checkbox"
                                                        checked={!!r.sel}
                                                        onChange={(e) =>
                                                            setGridRows((prev) => prev.map((x) => x.id === r.id ? { ...x, sel: e.target.checked } : x))
                                                        }
                                                    />
                                                </td>
                                                <td style={td(100)}>
                                                    <input value={r["Room #"]} onChange={(e) => updateGrid(r.id, "Room #", e.target.value)} style={input(90)} />
                                                </td>
                                                <td style={td()}>
                                                    <input value={r["Room Name"]} onChange={(e) => updateGrid(r.id, "Room Name", e.target.value)} style={input()} />
                                                </td>
                                                <td style={td(120)}>
                                                    <input
                                                        value={r["Area (m²)"]}
                                                        onChange={(e) => updateGrid(r.id, "Area (m²)", e.target.value)}
                                                        style={input(100)}
                                                        inputMode="decimal"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td style={td(260)}>
                                                    <select
                                                        value={r["Occupancy Type"]}
                                                        onChange={(e) => updateGrid(r.id, "Occupancy Type", e.target.value)}
                                                        style={select(240)}
                                                    >
                                                        {typeList.map((t) => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </td>
                                                <td style={td(100)}><span style={pill()}>{r["Occupant Load"]}</span></td>
                                                <td style={td(60)}>
                                                    <button onClick={() => removeGridRow(r.id)} style={btn("danger")}>×</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {displayedGrid.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ padding: 16, textAlign: "center", color: "#666" }}>
                                                    No rows match your filters. Try clearing search/type filter.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Totals */}
                    <aside style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16, height: "fit-content" }}>
                        <h3 style={{ marginTop: 0 }}>Totals</h3>
                        <div style={{ marginBottom: 8, color: "#666" }}>Code: {CODE_SETS[codeId]?.label || codeId}</div>
                        <TotalsPanel rows={rowsForExport()} />
                    </aside>
                </div>
            </div>
        </div>
    );
}

/* ===================== small pieces ===================== */
function TotalsPanel({ rows }) {
    const grouped = useMemo(() => {
        const out = {};
        let grand = 0;
        rows.forEach((r) => {
            const t = r["Occupancy Type"];
            const l = toNumber(r["Occupant Load"]);
            out[t] = (out[t] || 0) + l;
            grand += l;
        });
        return { out, grand };
    }, [rows]);

    return (
        <>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {Object.entries(grouped.out).map(([t, v]) => (
                    <li key={t} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                        <span>{t}</span>
                        <strong>{v}</strong>
                    </li>
                ))}
            </ul>
            <hr style={{ margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Grand Total</span>
                <strong>{grouped.grand}</strong>
            </div>
        </>
    );
}

function Th({ label, onClick, active, dir, width }) {
    return (
        <th style={th(width)} onClick={onClick}>
            <span style={{ cursor: "pointer", userSelect: "none" }}>
                {label} {active ? (dir === "asc" ? "▲" : "▼") : ""}
            </span>
        </th>
    );
}

/* ===================== styles ===================== */
const bar = () => ({
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 12,
    marginTop: 12
});
const table = () => ({ width: "100%", borderCollapse: "separate", borderSpacing: 0 });
const th = (w) => ({
    textAlign: "left",
    background: "#f8fafc",
    padding: "10px 12px",
    borderBottom: "1px solid #e5e7eb",
    width: w,
    whiteSpace: "nowrap",
    fontWeight: 700,
    fontSize: 13
});
const td = (w) => ({
    padding: "8px 12px",
    borderBottom: "1px solid #f1f5f9",
    width: w,
    verticalAlign: "middle"
});
const input = (w) => ({
    width: w || "100%",
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14
});
const select = (w) => ({
    width: w || "100%",
    padding: "6px 8px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    fontSize: 14,
    background: "#fff"
});
const btn = (variant = "primary") => {
    const base =
        variant === "danger"
            ? { background: "#ef4444", color: "#fff", border: "1px solid #dc2626" }
            : variant === "ghost"
                ? { background: "#fff", color: "#111", border: "1px solid #e5e7eb" }
                : { background: "#2563eb", color: "#fff", border: "1px solid #1d4ed8" };
    return { ...base, borderRadius: 8, padding: "8px 12px", fontSize: 14, cursor: "pointer" };
};
const pill = () => ({
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 999,
    background: "#111827",
    color: "#fff",
    fontSize: 13,
    lineHeight: 1.4
});
