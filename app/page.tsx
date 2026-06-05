// Place these robust definitions at the top of your unified page file
const strataData = {
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
'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function IntegratedProvenanceLedger() {
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const stratum06ViewerRef = useRef<HTMLDivElement>(null);

  // Form State matching Stratum-07 input matrix fields exactly
  const [formData, setFormData] = useState({
    stratum_level: 'STRATUM 01',
    stratum_title: 'INHERENT / ANCESTRAL AUTHORITY',
    source_definition: 'Inherent / Ancestral Authority',
    functional_jurisdiction: 'Central Trust Securities (Legal Frameworks)',
    sovereign_issuer: 'Shane Jonathan Lozenich',
    claim_payload: ''
  });

  // Automatically sync names and layers depending on the selected stratum dropdown option
  const handleStratumChange = (level: string) => {
    let title = '';
    let source = '';
    if (level === 'STRATUM 01') {
      title = 'INHERENT / ANCESTRAL AUTHORITY';
      source = 'Inherent / Ancestral Authority';
    } else if (level === 'STRATUM 02') {
      title = 'CONSTITUTIONAL / ORGANIC LAW';
      source = 'Washington State Constitution';
    }
    setFormData({ ...formData, stratum_level: level, stratum_title: title, source_definition: source });
  };

  // Fetch streaming blocks from your API endpoint
  const fetchLedger = async () => {
    try {
      const res = await fetch('/api/ledger');
      const json = await res.json();
      if (json.success) setLedgerEntries(json.data);
    } catch (err) {
      console.error('Pipeline streaming exception:', err);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleMintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // 1. Instantly pull fresh data without reloading
        await fetchLedger();

        // 2. Direct viewport focus automatically down to the Stratum-06 block stream
        if (stratum06ViewerRef.current) {
          stratum06ViewerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Clear payload input for next transaction entry
        setFormData(prev => ({ ...prev, claim_payload: '' }));
      }
    } catch (error) {
      console.error('Execution pipeline hold:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f0e6] text-[#1c1c1c] p-8 font-serif selection:bg-[#0e2c1e]/10">
      <div className="max-w-4xl mx-auto space-y-16">

        {/* ==========================================
            STRATUM-07: AUTHORITY MINTING INTERFACE
           ========================================== */}
        <section className="bg-white border border-[#e2dcce] shadow-sm p-10 max-w-3xl mx-auto">
          <div className="flex justify-between items-baseline border-b border-[#1c1c1c] pb-4 mb-8">
            <div>
              <h1 className="text-3xl font-serif tracking-wide text-[#0e2c1e]">PROVENANCE LEDGER</h1>
              <p className="text-xs font-mono tracking-widest text-[#7c7565] uppercase mt-1">STRATUM-07 AUTHORITY MINTING INTERFACE</p>
            </div>
            <div className="text-right font-mono text-xs uppercase tracking-wider text-[#1c1c1c]">
              <div className="font-bold">Shane Jonathan Lozenich</div>
              <div className="text-[#7c7565]">Jonathan Shane Concepts</div>
            </div>
          </div>

          <form onSubmit={handleMintSubmit} className="space-y-6 text-sm">
            {/* Upper Input Layout Grid Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#fcfbfa] border border-[#e2dcce] p-3">
                <label className="block text-[10px] font-mono tracking-widest text-[#7c7565] uppercase mb-1">Select Stratum Level</label>
                <select 
                  value={formData.stratum_level}
                  onChange={(e) => handleStratumChange(e.target.value)}
                  className="w-full bg-transparent font-serif text-sm border-b border-[#cbd5e1] py-1 focus:outline-none"
                >
                  <option value="STRATUM 01">Stratum 01 — Inherent / Ancestral Authority</option>
                  <option value="STRATUM 02">Stratum 02 — Constitutional / Organic Law</option>
                </select>
              </div>

              <div className="bg-[#fcfbfa] border border-[#e2dcce] p-3">
                <label className="block text-[10px] font-mono tracking-widest text-[#7c7565] uppercase mb-1">Primary Source Definition</label>
                <input type="text" readOnly value={formData.source_definition} className="w-full bg-transparent font-serif text-sm text-[#5c5545] focus:outline-none" />
              </div>

              <div className="bg-[#fcfbfa] border border-[#e2dcce] p-3">
                <label className="block text-[10px] font-mono tracking-widest text-[#7c7565] uppercase mb-1">Functional Jurisdiction / Custodian</label>
                <input type="text" readOnly value={formData.functional_jurisdiction} className="w-full bg-transparent font-serif text-sm text-[#5c5545] focus:outline-none" />
              </div>

              <div className="bg-[#fcfbfa] border border-[#e2dcce] p-3">
                <label className="block text-[10px] font-mono tracking-widest text-[#7c7565] uppercase mb-1">Inherent Sovereign/Issuer</label>
                <input type="text" readOnly value={formData.sovereign_issuer} className="w-full bg-transparent font-serif text-sm text-[#5c5545] focus:outline-none" />
              </div>
            </div>

            {/* Substantive Text Input Block */}
            <div>
              <label className="block text-[11px] font-mono tracking-wider font-bold text-[#1c1c1c] uppercase mb-2">Substantive Claim / Statement of Fact</label>
              <textarea
                rows={6}
                required
                value={formData.claim_payload}
                onChange={(e) => setFormData({ ...formData, claim_payload: e.target.value })}
                placeholder="Enter the authoritative declaration, constitutional boundary, or trust framework declaration details..."
                className="w-full bg-[#fcfbfa] border border-[#e2dcce] p-4 font-serif text-base leading-relaxed focus:outline-none focus:border-[#0e2c1e]"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-[#0e2c1e] text-[#f4f0e6] font-mono text-xs uppercase tracking-widest py-3 hover:bg-[#153f2b] transition-all duration-200"
            >
              Commit Substantive Entry to Ledger Pipeline
            </button>
          </form>
        </section>

        {/* ==========================================
            STRATUM-06: TRANSACTION VIEW LOGS STREAM
           ========================================== */}
        <section ref={stratum06ViewerRef} className="pt-10 border-t border-[#cbd5e1] scroll-mt-8">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-xs font-mono tracking-widest text-[#7c7565] uppercase border-b border-[#cbd5e1] pb-2">STRATUM LEVEL 06: IMMUTABLE AUDIT RECORD</h2>
            
            {ledgerEntries.length === 0 ? (
              <div className="text-center p-12 bg-white/60 border border-dashed border-[#e2dcce] text-sm italic text-[#7c7565]">
                Awaiting programmatic validation cycles... Mint an active record block above to populate the ledger framework.
              </div>
            ) : (
              ledgerEntries.map((entry) => (
                <div key={entry.id} className="bg-white border border-[#e2dcce] shadow-sm p-8 space-y-6">
                  {/* Ledger Block Entry Header */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="bg-[#0e2c1e] text-white font-mono text-[10px] tracking-widest font-bold px-2.5 py-1 uppercase">
                        {entry.stratum_level}
                      </span>
                      <span className="font-mono tracking-wider text-[#7c7565] uppercase text-[11px]">
                        {entry.stratum_title}
                      </span>
                    </div>
                    <div className="font-mono text-[#7c7565] text-[11px]">
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </div>

                  {/* Primary Narrative Text Block */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-mono tracking-wider text-[#7c7565] uppercase font-bold">Substantive Claim / Sovereign Record</h4>
                    <p className="text-lg leading-relaxed text-[#1a1a1a] font-serif">
                      {entry.claim_payload}
                    </p>
                  </div>

                  {/* Ledger Anchor Baseline Grid Info */}
                  <div className="grid grid-cols-2 gap-4 border-t border-[#f2efe4] pt-4 text-[11px] font-mono">
                    <div>
                      <span className="text-[#7c7565] block uppercase text-[9px] tracking-tight">Jurisdictional Anchor</span>
                      <span className="text-[#1c1c1c]">{entry.functional_jurisdiction}</span>
                    </div>
                    <div>
                      <span className="text-[#7c7565] block uppercase text-[9px] tracking-tight">Inherent Sovereign Issuer</span>
                      <span className="text-[#1c1c1c]">{entry.sovereign_issuer}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}