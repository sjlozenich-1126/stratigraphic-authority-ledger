"use client";

import { useState } from "react";

export default function CertificateViewer() {
  const [entryId, setEntryId] = useState("");
  const [certificate, setCertificate] = useState<any>(null);

  async function fetchCertificate() {
    const res = await fetch("/api/certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entryId }),
    });

    const data = await res.json();
    setCertificate(data);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Stratum 05 — Certificate of Provenance
      </h1>

      <input
        type="text"
        placeholder="Enter Entry ID"
        value={entryId}
        onChange={(e) => setEntryId(e.target.value)}
        style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
      />

      <button
        onClick={fetchCertificate}
        style={{
          padding: "0.75rem",
          background: "#1e40af",
          color: "white",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Generate Certificate
      </button>

      {certificate && (
        <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Certificate of Provenance
          </h2>

          <div style={{ marginBottom: "1rem" }}>
            <strong>Document:</strong> {certificate.document_name} <br />
            <strong>Entry ID:</strong> {certificate.entry_id} <br />
            <strong>Issued:</strong> {certificate.issued_at} <br />
            <strong>Action:</strong> {certificate.action_token} <br />
            <strong>Stratum:</strong> {certificate.stratum} <br />
            <strong>Case Number:</strong> {certificate.case_number || "—"} <br />
            <strong>Narrative Link:</strong> {certificate.narrative_link || "—"} <br />
            <strong>Hash:</strong> <code>{certificate.document_hash}</code> <br />
            <strong>Signature:</strong> <code>{certificate.signature}</code> <br />
            <strong>Signer:</strong> {certificate.signer}
          </div>

          <h3>Raw Certificate JSON</h3>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(certificate, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
