"use client";

import { useState } from "react";

type MintFormData = {
  documentName: string;
  rawContent: string;
  actionToken: string;
  stratum: string;
  caseNumber?: string;
  narrativeLink?: string;
};

export default function Stratum07Page() {
  const [documentName, setDocumentName] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [actionToken, setActionToken] = useState("");
  const [stratum, setStratum] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [narrativeLink, setNarrativeLink] = useState("");

  const [mintedEntry, setMintedEntry] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData: MintFormData = {
      documentName,
      rawContent,
      actionToken,
      stratum,
      caseNumber,
      narrativeLink,
    };

    const res = await fetch("/api/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_name: formData.documentName,
        raw_content: formData.rawContent,
        action_token: formData.actionToken,
        stratum: formData.stratum,
        case_number: formData.caseNumber,
        narrative_link: formData.narrativeLink,
      }),
    });

    const data = await res.json();
    setMintedEntry(data);
    setLoading(false);
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Stratum 07 — Mint Provenance Entry
      </h1>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <input
          type="text"
          placeholder="Document Name"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          required
          style={{ padding: "0.5rem" }}
        />

        <textarea
          placeholder="Raw Content"
          value={rawContent}
          onChange={(e) => setRawContent(e.target.value)}
          required
          rows={8}
          style={{ padding: "0.5rem" }}
        />

        <input
          type="text"
          placeholder="Action Token (e.g., FILED, SERVED, RECEIVED)"
          value={actionToken}
          onChange={(e) => setActionToken(e.target.value)}
          required
          style={{ padding: "0.5rem" }}
        />

        <input
          type="text"
          placeholder="Stratum (e.g., 06)"
          value={stratum}
          onChange={(e) => setStratum(e.target.value)}
          required
          style={{ padding: "0.5rem" }}
        />

        <input
          type="text"
          placeholder="Case Number (optional)"
          value={caseNumber}
          onChange={(e) => setCaseNumber(e.target.value)}
          style={{ padding: "0.5rem" }}
        />

        <input
          type="text"
          placeholder="Narrative Link (optional)"
          value={narrativeLink}
          onChange={(e) => setNarrativeLink(e.target.value)}
          style={{ padding: "0.5rem" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "0.75rem",
            background: "#1e40af",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Minting..." : "Mint Entry"}
        </button>
      </form>

      {mintedEntry && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            border: "1px solid #ccc",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
            Minted Entry
          </h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(mintedEntry, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
