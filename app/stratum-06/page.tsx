"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

type LedgerEntry = {
  id: string;
  document_name: string;
  document_hash: string;
  action_token: string;
  stratum: string;
  timestamp: string;
};

export default function Stratum06Page() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLedger() {
      const res = await fetch("/api/ledger");
      const data = await res.json();
      setEntries(data as LedgerEntry[]);
      setLoading(false);
    }
    loadLedger();
  }, []);

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading ledger…</div>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Stratum 06 — Provenance Ledger
      </h1>

      {entries.length === 0 && <p>No entries minted yet.</p>}

      {entries.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Document</th>
              <th style={th}>Hash</th>
              <th style={th}>Action</th>
              <th style={th}>Stratum</th>
              <th style={th}>Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {entries.map((entry, i) => (
              <tr key={i}>
                <td style={td}>{entry.id}</td>
                <td style={td}>{entry.document_name}</td>
                <td style={td}>
                  <code>{entry.document_hash.slice(0, 16)}…</code>
                </td>
                <td style={td}>{entry.action_token}</td>
                <td style={td}>{entry.stratum}</td>
                <td style={td}>{entry.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th: CSSProperties = {
  borderBottom: "2px solid #ccc",
  padding: "0.5rem",
  textAlign: "left",
  fontWeight: "bold",
};

const td: CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "0.5rem",
};
