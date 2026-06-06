'use client';

import React, { useState, useEffect } from 'react';

// Unified type alignment with your backend schema specifications
interface HardenedLedgerBlock {
  stratum: string;
  source: string;
  owner: string;
  concept: string;
  framework: string;
  claim: string;
  evidence: string[];
  timestamp: string;
  actionToken?: string; // Maps to DOC-XXX format dynamically
}

interface StratumMeta {
  title: string;
  shortCode: string;
  scope: string;
  weight: string;
}

const STRATA_REGISTRY: Record<string, StratumMeta> = {
  "01": {
    title: "STRATUM 01 — INHERENT / ANCESTRAL AUTHORITY",
    shortCode: "Stratum 01",
    scope: "Inherent individual sovereignty that predates statutory creation.",
    weight: "Absolute / Origin of moving power"
  },
  "02": {
    title: "STRATUM 02 — CONSTITUTIONAL / ORGANIC LAW",
    shortCode: "Stratum 02",
    scope: "Establishes the three branches of state government, including the limits of the judiciary.",
    weight: "Supreme state authority bounding all courts"
  },
  "03": {
    title: "STRATUM 03 — STATUTORY / LEGISLATIVE FRAMEWORK",
    scope: "Legislative organization of the Superior Court and delegation of record-keeping duties to the County Clerk.",
    shortCode: "Stratum 03",
    weight: "Mandated operational boundaries"
  },
  "04": {
    title: "STRATUM 04 — ADMINISTRATIVE / PORTAL REGULATIONS",
    shortCode: "Stratum 04",
    scope: "Governs public access to digital court records via administrative portals.",
    weight: "Strictly limited to data handling; cannot create new laws"
  }
};

export default function ProvenanceDashboard() {
  // Local Telemetry Metrics State
  const [pipelineMetrics, setPipelineMetrics] = useState({
    processedBlocks: 5,
    policyConfirmations: 5,
    exceptionHolds: 0,
    clearanceVelocity: 100
  });

  // Dynamic ledger array from backend
  const [ledgerLogs, setLedgerLogs] = useState<HardenedLedgerBlock[]>([]);
  const [inputClaim, setInputClaim] = useState('');
  const [selectedStratum, setSelectedStratum] = useState('01');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. GET Hook: Load authoritative state on mount
  const syncLedgerState = async () => {
    try {
      const response = await fetch('/api/ledger');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        // Enforce top-down chronological display
        const reversedLogs = [...data].reverse();
        setLedgerLogs(reversedLogs);
        
        setPipelineMetrics(prev => ({
          ...prev,
          processedBlocks: data.length,
          policyConfirmations: data.length
        }));
      }
    } catch (err) {
      console.error("Transmission interruption: failed to pull active ledger state", err);
    }
  };

  useEffect(() => {
    syncLedgerState();
  }, []);

  // 2. POST Hook: Transmit form context to API route execution
  const handleIngestQuery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputClaim.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const activeMeta = STRATA_REGISTRY[selectedStratum];

    // Formulate pristine schema payload matching backend criteria exactly
    const payload = {
      stratum: selectedStratum,
      source: activeMeta.title,
      owner: "Shane Jonathan Lozenich",
      concept: "Jonathan Shane Concepts",
      framework: activeMeta.weight,
      claim: inputClaim,
      evidence: ["System Authorization Token Signature Baseline"]
    };

    try {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        setInputClaim('');
        // Re-sync full log engine sequence cleanly from data source
        await syncLedgerState();
      } else {
        console.error("Minting validation failed:", result.error);
      }
    } catch (err) {
      console.error("Critical API submission pipeline break:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1C2D24] font-serif p-8 selection:bg-[#1C2D24] selection:text-[#F4F1EA]">
      {/* Structural Branding Header */}
      <header className="max-w-6xl mx-auto border-b border-[#1C2D24] pb-6 mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-normal tracking-wide uppercase">Provenance Ledger</h1>
          <p className="text-xs uppercase tracking-widest font-sans mt-1 text-[#5C6E63]">
            Stratum Authority Portal & Systemic Ingestion Engine
          </p>
        </div>
        <div className="text-left sm:text-right text-xs uppercase tracking-wider font-sans text-[#5C6E63]">
          <div className="font-bold text-[#1C2D24]">Shane Jonathan Lozenich</div>
          <div>Fiducia Centrale / Central Trust Securities</div>
        </div>
      </header>

      {/* Main Structural Matrix Grid Layout */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Execution Matrix Panels */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Stratum-07 Ingestion Form Component */}
          <section className="bg-[#FAF8F5] border border-[#D1C9B7] p-6 shadow-sm">
            <h2 className="text-xs font-sans uppercase font-bold tracking-widest mb-6 pb-2 border-b border-[#E6E1D3]">
              STRATUM-07 AUTHORITY MINTING INTERFACE
            </h2>
            
            <form onSubmit={handleIngestQuery} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase mb-1 text-[#5C6E63]">
                    Select Target Stratum Level
                  </label>
                  <select 
                    value={selectedStratum}
                    onChange={(e) => setSelectedStratum(e.target.value)}
                    className="w-full bg-[#F4F1EA] border border-[#C2BAA8] text-xs p-2.5 outline-none font-sans rounded-none focus:border-[#1C2D24]"
                  >
                    {Object.keys(STRATA_REGISTRY).map((key) => (
                      <option key={key} value={key}>
                        STRATUM {key} — {STRATA_REGISTRY[key].shortCode.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase mb-1 text-[#5C6E63]">
                    Functional Jurisdiction / Custodian
                  </label>
                  <div className="bg-[#EAE5D8] border border-[#C2BAA8] text-xs p-2.5 text-[#4A534D]">
                    Central Trust Securities (Legal Frameworks)
                  </div>
                </div>
              </div>

              {/* Dynamic Read-Out Context Block Context Panel */}
              <div className="bg-[#F4F1EA] border border-[#C2BAA8] p-4 text-xs font-sans space-y-1.5">
                <div className="font-bold uppercase text-[#1C2D24]">
                  Active Context: {STRATA_REGISTRY[selectedStratum].title}
                </div>
                <div className="text-[#4A5D53]"><span className="font-bold">Scope:</span> {STRATA_REGISTRY[selectedStratum].scope}</div>
                <div className="text-[#4A5D53]"><span className="font-bold">Weight:</span> {STRATA_REGISTRY[selectedStratum].weight}</div>
              </div>

              <div>
                <label className="block text-[10px] font-sans font-bold tracking-wider uppercase mb-1 text-[#5C6E63]">
                  Substantive Claim / Statement of Fact
                </label>
                <textarea
                  value={inputClaim}
                  onChange={(e) => setInputClaim(e.target.value)}
                  placeholder="Enter the authoritative declaration, constitutional boundary, or trust framework details..."
                  className="w-full bg-[#F4F1EA] border border-[#C2BAA8] text-sm p-3 h-28 outline-none focus:border-[#1C2D24] font-serif"
                />
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#1C2D24] text-[#F4F1EA] font-sans text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors hover:bg-[#2D4437] disabled:bg-[#A39E93]"
                >
                  {isSubmitting ? "Minting..." : "Ingest Authoritative Query"}
                </button>
              </div>
            </form>
          </section>

          {/* Stratum Level 06 Historical Log Monitor Panel */}
          <section className="bg-[#FAF8F5] border border-[#D1C9B7] p-6 shadow-sm">
            <h2 className="text-xs font-sans uppercase font-bold tracking-widest mb-4 pb-2 border-b border-[#E6E1D3]">
              STRATUM LEVEL 06: IMMUTABLE TRANSACTION LOGS & CREDENTIAL MINTING
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-[#1C2D24] text-[#5C6E63] uppercase tracking-wider text-[10px]">
                    <th className="py-2 font-bold">Timestamp</th>
                    <th className="py-2 font-bold">Action Token</th>
                    <th className="py-2 font-bold">Target Strata</th>
                    <th className="py-2 font-bold text-right">Status Baseline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6E1D3]">
                  {ledgerLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[#5C6E63] italic">
                        No entries currently logged in the stratigraphic state chain.
                      </td>
                    </tr>
                  ) : (
                    ledgerLogs.map((log, idx) => {
                      const displayedToken = log.actionToken || `DOC-00${ledgerLogs.length - idx}`;
                      const stratNum = log.stratum.replace(/\D/g, "");
                      const shortLabel = STRATA_REGISTRY[stratNum]?.shortCode || `Stratum ${log.stratum}`;
                      
                      return (
                        <tr key={idx} className="hover:bg-[#F4F1EA]/50 font-sans text-[11px]">
                          <td className="py-3 font-mono text-[10px] text-[#5C6E63]">
                            {log.timestamp ? new Date(log.timestamp).toISOString() : "PENDING_TS"}
                          </td>
                          <td className="py-3 font-mono font-bold text-[#1C2D24]">{displayedToken}</td>
                          <td className="py-3 text-[#1C643A] font-bold">{shortLabel}</td>
                          <td className="py-3 text-right">
                            <span className="inline-block bg-[#E1EFE6] text-[#1C643A] font-bold px-2 py-0.5 text-[10px] tracking-wide font-sans rounded-sm">
                              APPROVED
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right Metric Telemetry Column Panels */}
        <div className="space-y-6">
          
          {/* Telemetry Indicator Component Block */}
          <section className="border border-[#1C2D24] bg-[#FAF8F5] p-5">
            <h3 className="text-xs font-sans font-bold tracking-widest uppercase mb-4 border-b border-[#1C2D24] pb-2 text-[#1C2D24]">
              Pipeline Metrics Engine
            </h3>
            <div className="space-y-3.5 font-sans text-xs">
              <div className="flex justify-between border-b border-[#E6E1D3] pb-1.5">
                <span className="text-[#5C6E63]">Processed Block Stream:</span>
                <span className="font-bold text-base font-mono text-[#1C2D24]">{pipelineMetrics.processedBlocks}</span>
              </div>
              <div className="flex justify-between border-b border-[#E6E1D3] pb-1.5">
                <span className="text-[#5C6E63]">Policy Confirmations:</span>
                <span className="font-bold text-base font-mono text-[#276F43]">{pipelineMetrics.policyConfirmations}</span>
              </div>
              <div className="flex justify-between border-b border-[#E6E1D3] pb-1.5">
                <span className="text-[#5C6E63]">Systemic Exception Holds:</span>
                <span className="font-bold font-mono text-[#1C2D24]">{pipelineMetrics.exceptionHolds}</span>
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#5C6E63] block mb-1">
                  Rule Clearance Velocity
                </span>
                <div className="text-3xl font-normal font-serif tracking-tight text-[#1C2D24]">
                  {pipelineMetrics.clearanceVelocity}%
                </div>
              </div>
            </div>
          </section>

          {/* Procedural Reference Actions Anchor Card Panel */}
          <section className="border border-[#D1C9B7] bg-[#FAF8F5] p-5">
            <h3 className="text-xs font-sans font-bold tracking-widest uppercase mb-4 border-b border-[#E6E1D3] pb-2 text-[#5C6E63]">
              Procedural Actions
            </h3>
            <div className="space-y-3 font-sans text-[11px]">
              <div className="border border-[#E6E1D3] p-3 bg-white flex justify-between items-center group cursor-pointer hover:border-[#1C2D24]">
                <div>
                  <div className="font-mono text-[9px] text-[#A39E93]">ACT-001</div>
                  <div className="font-bold text-[#1C2D24]">Query Inceptive Ancestral Roots</div>
                </div>
                <span className="text-gray-400 text-xs transition-transform group-hover:translate-x-0.5">AUDIT →</span>
              </div>

              <div className="border border-[#E6E1D3] p-3 bg-white flex justify-between items-center group cursor-pointer hover:border-[#1C2D24]">
                <div>
                  <div className="font-mono text-[9px] text-[#A39E93]">ACT-002</div>
                  <div className="font-bold text-[#1C2D24]">Modify Superior Court Record Structure</div>
                </div>
                <span className="text-gray-400 text-xs transition-transform group-hover:translate-x-0.5">AUDIT →</span>
              </div>

              <div className="border border-[#E6E1D3] p-3 bg-white flex justify-between items-center group cursor-pointer hover:border-[#1C2D24]">
                <div>
                  <div className="font-mono text-[9px] text-[#A39E93]">ACT-003</div>
                  <div className="font-bold text-[#1C2D24]">Bypass LGR 31 Restrictions</div>
                </div>
                <span className="text-gray-400 text-xs transition-transform group-hover:translate-x-0.5">AUDIT →</span>
              </div>
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}