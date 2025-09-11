import React from "react";
export default function Register() {
    return (
        <main style={{ fontFamily: "system-ui, sans-serif", padding: 40, maxWidth: 500, margin: "40px auto", background: "#fff", borderRadius: 16, boxShadow: "0 4px 32px #0002" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: 24 }}>Register</h2>
            <form>
                <label>Email<br /><input type="email" required style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 16 }} /></label>
                <label>Password<br /><input type="password" required style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 24 }} /></label>
                <button type="submit" style={{ background: "#2563eb", color: "#fff", borderRadius: 8, padding: "10px 24px", fontWeight: 600, fontSize: "1.1rem", border: "none", cursor: "pointer" }}>Create Account</button>
            </form>
        </main>
    );
}