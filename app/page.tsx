'use client';

import React, { useState, useEffect } from 'react';

// Explicit strict typing interfaces for production build safety
interface StratumDetail {
  title: string;
  scope: string;
  weight: string;
  effectiveDate: string;
}

interface StrataMap {
  [key: string]: StratumDetail;
}

interface LedgerEntry {
  id: string;
  timestamp: string;
  token: string;
  target: string;
  claim: string;
  precedingBlockHash: string;
  currentBlockHash: string;
  status: string;
}

interface PipelineMetrics {
  processedBlocks: number;
  policyConfirmations: number;
  exceptionHolds: number;
  clearanceVelocity: number;
}

// Immutable authority baseline maps
const STRATA_REGISTRY: StrataMap = {
  "stratum-01": {
    title: "STRATUM 01 — INHERENT / ANCESTRAL AUTHORITY",
    scope: "Inherent individual sovereignty that predates statutory creation.",
    weight: "Absolute / Origin of moving power",
    effectiveDate: "1776-07-04"
  },
  "stratum-02": {
    title: "STRATUM 02 — CONSTITUTIONAL / ORGANIC LAW",
    scope: "Establishes the three branches of state government, including the limits of the judiciary.",
    weight: "Supreme state authority bounding all courts",
    effectiveDate: "1889-11-11"
  },
  "stratum-03": {
    title: "STRATUM 03 — STATUTORY / LEGISLATIVE FRAMEWORK",
    scope: "Legislative organization of the Superior Court and delegation of record-keeping duties to the County Clerk.",
    weight: "Mandated operational boundaries",
    effectiveDate: "1951-05-01"
  },
  "stratum-04": {
    title: "STRATUM 04 — ADMINISTRATIVE / PORTAL REGULATIONS",
    scope: "Governs public access to digital court records via administrative portals.",
    weight: "Strictly limited to data handling; cannot create new laws",
    effectiveDate: "2004-11-01"
  }
};

const PROCEDURAL_ACTIONS = [
  { code: "ACT-001", label: "Query Inceptive Ancestral Roots" },
  { code: "ACT-002", label: "Modify Superior Court Record Structure" },
  { code: "ACT-003", label: "Bypass LGR 31 Restrictions" }
];

export default function ProvenanceDashboard() {
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics>({
    processedBlocks: 0,
    policyConfirmations: 0,
    exceptionHolds: 0,
    clearanceVelocity: 100
  });

  const [ledgerLogs, setLedgerLogs] = useState<LedgerEntry[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [sysToken, setSysToken] = useState('');
  const [selectedStratum, setSelectedStratum] = useState('stratum-01');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, text: string }>({ type: null, text: '' });

  // 1. GET Request Lifecycle Hook: Sync backend ledger logs with UI state
  const refreshLedgerState = async () => {
    try {
      const response = await fetch('/api/ledger');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        const UIFormattedLogs: LedgerEntry[] = data.map((item: any, index: number) => {
          const cleanTarget = item.stratum.toLowerCase().includes('stratum') 
            ? item.stratum.replace(/\b\w/g, (c: string) => c.toUpperCase())
            : `Stratum ${item.stratum}`;

          return {
            id: item.id || `log-${index}`,
            timestamp: item.timestamp,
            token: item.token || `CTS-BLK-${1000 + index}`,
            target: cleanTarget,
            claim: item.claim || '',
            precedingBlockHash: item.precedingBlockHash || '',
            currentBlockHash: item.currentBlockHash || '',
            status: item.status || "APPROVED"
          };
        });

        setLedgerLogs([...UIFormattedLogs].reverse());
        
        setPipelineMetrics(prev => ({
          ...prev,
          processedBlocks: data.length,
          policyConfirmations: data.length,
          exceptionHolds: 0
        }));
      } else if (data.error) {
        console.error("Backend response error status:", data.error);
        setPipelineMetrics(prev => ({ ...prev, exceptionHolds: 1 }));
      }
    } catch (err) {
      console.error("Failed to sync structural log parameters with API endpoint:", err);
    }
  };

  useEffect(() => {
    refreshLedgerState();
  }, []);

  // 2. POST Request Transaction Processing
  const handleIngestQuery = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputQuery.trim() || isLoading) return;

    setIsLoading(true);
    setStatusMessage({ type: null, text: '' });

    const backendStratumCode = selectedStratum.replace('stratum-', '');

    const targetPayload = {
      stratum: backendStratumCode,
      claim: inputQuery,
      source: STRATA_REGISTRY[selectedStratum].title,
      owner: "Shane Jonathan Lozenich",
      framework: STRATA_REGISTRY[selectedStratum].weight
    };

    try {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Fiducia-Token': sysToken // Secure handshake signature header
        },
        body: JSON.stringify(targetPayload)
      });

      const result = await response.json();

      if (result.success) {
        setInputQuery('');
        setStatusMessage({ type: 'success', text: `Successfully verified and minted block token: ${result.blockToken}` });
        await refreshLedgerState();
      } else {
        setStatusMessage({ type: 'error', text: result.error || 'Authorization failed.' });
        setPipelineMetrics(prev => ({ ...prev, exceptionHolds: prev.exceptionHolds + 1 }));
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: `Transmission interface error: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#1C2D24] font-serif p-8 selection:bg-[#1C2D24] selection:text-[#F4F1EA]">
      {/* Top Ledger Header Area */}
      <header className="max-w-5xl mx-auto border-b-2 border-[#1C2D24] pb-6 mb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-normal tracking-wide uppercase">Provenance Ledger</h1>
          <p className="text-xs uppercase tracking-widest font-sans mt-2 text-[#4A5D53]">
            Stratum Authority Portal & Systemic Ingestion Engine
          </p>
        </div>
        <div className="text-left sm:text-right text-xs uppercase tracking-wider font-sans text-[#4A5D53]">
          <div className="font-bold text-[#1C2D24]">Shane Jonathan Lozenich</div>
          <div>Fiducia Centrale / Central Trust Securities</div>
        </div>
      </header>

      {/* Main Structural Matrix Layout */}
      <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Interactive Workspace (Left Content Block) */}
        <div className="md:col-span-2 space-y-10">
          
          {/* Data Ingestion Influx Point */}
          <section className="bg-[#FAF8F5] border border-[#D1C9B7] p-6 shadow-sm">
            <h2 className="text-xs font-sans uppercase font-bold tracking-widest mb-6 pb-2 border-b border-[#E6E1D3]">
              STRATUM AUTHORITY MINTING INTERFACE
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
                    className="w-full bg-[#F4F1EA] border border-[#C2BAA8] text-xs p-2.5 outline-none focus:border-[#1C2D24]"
                  >
                    {Object.keys(STRATA_REGISTRY).map((key) => (
                      <option key={key} value={key}>
                        {STRATA_REGISTRY[key].title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold tracking-wider uppercase mb-1 text-[#5C6E63]">
                    X-Fiducia Handshake Token
                  </label>
                  <input
                    type="password"
                    value={sysToken}
                    onChange={(e) => setSysToken(e.target.value)}
                    placeholder="Enter system deployment secret passphrase..."
                    className="w-full bg-[#F4F1EA] border border-[#C2BAA8] text-xs p-2.5 outline-none focus:border-[#1C2D24] font-mono"
                  />
                </div>
              </div>

              {/* Active Overview Meta Box */}
              <div className="bg-[#F4F1EA] border border-[#C2BAA8] p-4 text-xs font-sans space-y-1">
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
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="Enter the authoritative declaration, constitutional boundary, or trust framework details..."
                  className="w-full bg-[#F4F1EA] border border-[#C2BAA8] text-sm p-3 h-28 outline-none focus:border-[#1C2D24] font-serif"
                />
              </div>

              {statusMessage.text && (
                <div className={`p-3 font-sans text-xs border ${
                  statusMessage.type === 'success' ? 'bg-[#E1EFE6] border-[#B2D8C0] text-[#1C643A]' : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {statusMessage.text}
                </div>
              )}

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#1C2D24] text-[#F4F1EA] font-sans text-xs font-bold uppercase tracking-widest px-6 py-3 transition-colors hover:bg-[#2D4437] disabled:bg-[#A39E93]"
                >
                  {isLoading ? "Minting Entry..." : "Ingest Authoritative Query"}
                </button>
              </div>
            </form>
          </section>

          {/* Immutable Cryptographic Table Logging */}
          <section className="bg-[#FAF8F5] border border-[#D1C9B7] p-6 shadow-sm">
            <h2 className="text-xs font-sans uppercase font-bold tracking-widest mb-4 pb-2 border-b border-[#E6E1D3]">
              IMMUTABLE LEGISLATIVE BLOCKS & VERIFIABLE TRANSACTIONS
            </h2>
            <div className="space-y-6">
              {ledgerLogs.length === 0 ? (
                <div className="py-4 text-center text-xs italic text-[#5C6E63] font-sans">
                  Synchronizing tracking data indexes from Upstash database stream...
                </div>
              ) : (
                ledgerLogs.map((log) => (
                  <div key={log.id} className="border border-[#E6E1D3] bg-[#FAF8F5] p-4 text-xs space-y-3 font-sans">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E6E1D3] pb-2 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-[#1C2D24]">{log.token}</span>
                        <span className="bg-[#EAE5D8] px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] text-[#4A5D53]">
                          {log.target}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[10px] text-[#5C6E63]">
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="bg-[#E1EFE6] text-[#1C643A] font-bold px-1.5 py-0.5 rounded text-[9px]">
                          {log.status}
                        </span>
                      </div>
                    </div>

                    <div className="font-serif text-sm text-[#1C2D24] italic bg-white p-3 border border-[#F0EFEA] leading-relaxed whitespace-pre-wrap">
                      "{log.claim}"
                    </div>

                    <div className="space-y-1 font-mono text-[9px] text-[#6B7C70] bg-[#F4F1EA]/60 p-2 border border-[#E6E1D3]">
                      <div className="truncate"><span className="font-bold uppercase text-[#4A5D53]">Block Hash:</span> {log.currentBlockHash}</div>
                      <div className="truncate"><span className="font-bold uppercase text-[#4A5D53]">Parent Hash:</span> {log.precedingBlockHash}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Real-time Telemetry Pipeline Display Panel (Right Sidebar) */}
        <div className="space-y-6">
          <section className="border-2 border-[#1C2D24] bg-[#FAF8F5] p-5">
            <h3 className="text-xs font-sans font-bold tracking-widest uppercase mb-4 border-b border-[#1C2D24] pb-2">
              Pipeline Metrics Engine
            </h3>
            <div className="space-y-3 font-sans text-xs">
              <div className="flex justify-between border-b border-[#E6E1D3] pb-1.5">
                <span className="text-[#5C6E63]">Processed Block Stream:</span>
                <span className="font-bold text-base font-mono">{pipelineMetrics.processedBlocks}</span>
              </div>
              <div className="flex justify-between border-b border-[#E6E1D3] pb-1.5">
                <span className="text-[#5C6E63]">Policy Confirmations:</span>
                <span className="font-bold text-base font-mono text-[#276F43]">{pipelineMetrics.policyConfirmations}</span>
              </div>
              <div className="flex justify-between border-b border-[#E6E1D3] pb-1.5">
                <span className="text-[#5C6E63]">Systemic Exception Holds:</span>
                <span className={`font-bold font-mono ${pipelineMetrics.exceptionHolds > 0 ? 'text-red-700' : 'text-[#5C6E63]'}`}>
                  {pipelineMetrics.exceptionHolds}
                </span>
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

          {/* Quick-Audit Operational Actions Menu */}
          <section className="bg-[#FAF8F5] border border-[#D1C9B7] p-5 space-y-3">
            <h3 className="text-xs font-sans font-bold tracking-widest uppercase mb-2 text-[#5C6E63]">
              Procedural Actions
            </h3>
            {PROCEDURAL_ACTIONS.map((action) => (
              <button 
                key={action.code}
                type="button"
                className="w-full text-left bg-[#F4F1EA] border border-[#C2BAA8] p-2.5 font-sans text-xs flex justify-between items-center transition-all hover:bg-[#1C2D24] hover:text-[#F4F1EA] group"
              >
                <div>
                  <span className="font-mono text-[10px] mr-2 opacity-60">{action.code}</span>
                  <span className="font-medium">{action.label}</span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-60 group-hover:opacity-100">
                  Audit →
                </span>
              </button>
            ))}
          </section>
        </div>

      </main>
    </div>
  );
}