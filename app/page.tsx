'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function IntegratedSovereignDashboard() {
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const stratum06ViewerRef = useRef<HTMLDivElement>(null);

  // Active form state tracking your exact Vercel parameters
  const [formData, setFormData] = useState({
    stratum_level: 'STRATUM 02',
    stratum_title: 'CONSTITUTIONAL / ORGANIC LAW',
    functional_jurisdiction: 'Central Trust Securities (Legal Frameworks)',
    sovereign_issuer: 'Shane Jonathan Lozenich',
    claim_payload: ''
  });

  // Keep your current live API data synchronization active
  const fetchLedger = async () => {
    try {
      const res = await fetch('/api/ledger');
      const json = await res.json();
      if (json.success) setLedgerEntries(json.data);
    } catch (err) {
      console.error('Data pipeline exception:', err);
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
        await fetchLedger();
        if (stratum06ViewerRef.current) {
          stratum06ViewerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        setFormData(prev => ({ ...prev, claim_payload: '' }));
      }
    } catch (error) {
      console.error('Pipeline write exception:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f0e6] text-[#1c1c1c] p-4 md:p-6 lg:p-8 selection:bg-[#0e2c1e]/10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* ==========================================
            CUSTOM LOGO & EMBEDDED ENGINE HEADER
           ========================================== */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-baseline border-b border-[#1c1c1c] pb-6 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-[#0e2c1e] animate-pulse"></div>
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#0e2c1e] font-bold">System Active — Epoch 2847.3</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif text-[#0e2c1e] tracking-wide">PROVENANCE LEDGER</h1>
            <p className="font-mono text-[10px] text-[#7c7565] tracking-widest uppercase mt-1">STRATUM AUTHORITY PORTAL & SYSTEMIC INGESTION ENGINE</p>
          </div>
          <div className="text-left md:text-right font-mono text-xs uppercase tracking-wider text-[#1c1c1c] mt-4 md:mt-0">
            <div className="font-bold">Shane Jonathan Lozenich</div>
            <div className="text-[#7c7565] text-[10px]">FIDUCIA CENTRALE / CENTRAL TRUST SECURITIES</div>
          </div>
        </header>

        {/* ==========================================
            NEW NEW LAYOUT METRICS PANEL (INTEGRATED FROM CODE)
           ========================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e2dcce] p-4 rounded-sm shadow-sm">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#7c7565] mb-1">Total Strata Tracked</div>
            <div className="font-serif text-3xl text-[#0e2c1e] font-light">2,847</div>
            <div className="text-[10px] font-mono text-emerald-700 mt-1">▲ +12.4% vs Baseline</div>
          </div>
          <div className="bg-white border border-[#e2dcce] p-4 rounded-sm shadow-sm">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#7c7565] mb-1">Provenance Chains</div>
            <div className="font-serif text-3xl text-[#0e2c1e] font-light">14,209</div>
            <div className="text-[10px] font-mono text-emerald-700 mt-1">✓ 99.7% Integrity Verified</div>
          </div>
          <div className="bg-white border border-[#e2dcce] p-4 rounded-sm shadow-sm">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#7c7565] mb-1">Active Authority Nodes</div>
            <div className="font-serif text-3xl text-[#0e2c1e] font-light">384</div>
            <div className="text-[10px] font-mono text-amber-700 mt-1">⌁ All Operations Nominal</div>
          </div>
          <div className="bg-white border border-[#e2dcce] p-4 rounded-sm shadow-sm">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#7c7565] mb-1">Pipeline Clearance Velocity</div>
            <div className="font-serif text-3xl text-[#0e2c1e] font-medium">98.6%</div>
            <div className="text-[10px] font-mono text-[#0e2c1e] font-bold mt-1">Consensus Locked (100%)</div>
          </div>
        </div>

        {/* ==========================================
            MAIN SPLIT OPERATIONS CANVAS
           ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN: CORE INPUT & IMMUTABLE LEDGER DISPLAY */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STRATUM-07 MINTING INTERFACE CARD */}
            <section className="bg-white border border-[#e2dcce] p-6 md:p-8 shadow-sm">
              <h2 className="font-mono text-xs font-bold tracking-wider text-[#1c1c1c] uppercase mb-4 pb-2 border-b border-[#f2efe4]">
                STRATUM-07 AUTHORITY MINTING INTERFACE
              </h2>
              
              <form onSubmit={handleMintSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#fcfbfa] border border-[#e2dcce] p-3">
                    <label className="block text-[9px] font-mono tracking-widest text-[#7c7565] uppercase mb-1">Select Target Stratum Level</label>
                    <select 
                      value={formData.stratum_level}
                      onChange={(e) => setFormData({...formData, stratum_level: e.target.value})}
                      className="w-full bg-transparent font-serif text-sm border-none focus:outline-none text-[#0e2c1e] font-medium"
                    >
                      <option value="STRATUM 01">STRATUM 01 — INHERENT / ANCESTRAL AUTHORITY</option>
                      <option value="STRATUM 02">STRATUM 02 — CONSTITUTIONAL / ORGANIC LAW</option>
                    </select>
                  </div>
                  <div className="bg-[#fcfbfa] border border-[#e2dcce] p-3">
                    <label className="block text-[9px] font-mono tracking-widest text-[#7c7565] uppercase mb-1">Functional Jurisdiction / Custodian</label>
                    <input type="text" readOnly value={formData.functional_jurisdiction} className="w-full bg-transparent font-serif text-sm text-[#5c5545] focus:outline-none" />
                  </div>
                </div>

                <div className="bg-[#fdfcf9] border border-[#e2dcce] p-3 text-xs font-mono">
                  <span className="font-bold text-[#0e2c1e]">ACTIVE CONTEXT: STRATUM 01 — INHERENT / ANCESTRAL AUTHORITY</span>
                  <div className="text-[#7c7565] mt-1">Scope: Inherent individual sovereignty that predates statutory creation.</div>
                  <div className="text-[#7c7565]">Weight: Absolute / Origin of moving power</div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider font-bold text-[#1c1c1c] uppercase mb-1.5">Substantive Claim / Statement of Fact</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.claim_payload}
                    onChange={(e) => setFormData({ ...formData, claim_payload: e.target.value })}
                    placeholder="Enter the authoritative declaration, constitutional boundary, or trust framework details..."
                    className="w-full bg-[#fcfbfa] border border-[#e2dcce] p-3 font-serif text-sm leading-relaxed focus:outline-none focus:border-[#0e2c1e]"
                  />
                </div>

                <div className="flex justify-end">
                  <button type="submit" className="bg-[#0e2c1e] text-[#f4f0e6] font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-[#153f2b] transition-all">
                    Ingest Authoritative Query
                  </button>
                </div>
              </form>
            </section>

            {/* STRATUM LEVEL 06: IMMUTABLE TRANSACTION STREAM CONTAINER */}
            <section ref={stratum06ViewerRef} className="bg-white border border-[#e2dcce] p-6 shadow-sm scroll-mt-6">
              <h2 className="font-mono text-xs font-bold tracking-wider text-[#1c1c1c] uppercase mb-4 pb-2 border-b border-[#f2efe4]">
                STRATUM LEVEL 06: IMMUTABLE TRANSACTION LOGS & CREDENTIAL MINTING
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-[11px]">
                  <thead>
                    <tr className="border-b-2 border-[#1c1c1c] text-[#7c7565] uppercase tracking-wider text-[10px]">
                      <th className="py-2">Timestamp</th>
                      <th className="py-2">Action Token</th>
                      <th className="py-2">Target Strata</th>
                      <th className="py-2 text-right">Status Baseline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f2efe4]">
                    {ledgerEntries.map((entry, idx) => (
                      <tr key={entry.id || idx} className="hover:bg-[#fcfbfa]">
                        <td className="py-3 text-[#7c7565]">{new Date(entry.timestamp || Date.now()).toISOString()}</td>
                        <td className="py-3 font-bold text-[#0e2c1e]">DOC-00{idx + 1}</td>
                        <td className="py-3 font-serif text-xs text-[#1c1c1c]">{entry.stratum_level}</td>
                        <td className="py-3 text-right">
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold tracking-wider">
                            Approved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: ANALYTICS & TELEMETRY SIDEBAR GRID */}
          <div className="space-y-6">
            
            {/* SIDEBAR PANEL 1: PROCEDURAL ACTIONS ENGINE */}
            <div className="bg-white border border-[#e2dcce] p-5 shadow-sm">
              <h3 className="font-mono text-[11px] font-bold tracking-wider text-[#7c7565] uppercase mb-4">Procedural Actions</h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 bg-[#fcfbfa] border border-[#e2dcce] flex justify-between items-center group cursor-pointer hover:border-[#0e2c1e]">
                  <div>
                    <span className="text-[#7c7565] block text-[9px]">ACT-001</span>
                    <span className="text-[#1c1c1c] font-medium">Query Inceptive Ancestral Roots</span>
                  </div>
                  <span className="text-[10px] text-[#7c7565] group-hover:text-[#0e2c1e] font-bold">AUDIT →</span>
                </div>
                <div className="p-3 bg-[#fcfbfa] border border-[#e2dcce] flex justify-between items-center group cursor-pointer hover:border-[#0e2c1e]">
                  <div>
                    <span className="text-[#7c7565] block text-[9px]">ACT-002</span>
                    <span className="text-[#1c1c1c] font-medium">Modify Superior Court Structure</span>
                  </div>
                  <span className="text-[10px] text-[#7c7565] group-hover:text-[#0e2c1e] font-bold">AUDIT →</span>
                </div>
              </div>
            </div>

            {/* SIDEBAR PANEL 2: NEW INTEGRATED LIVE PROVENANCE FEED */}
            <div className="bg-white border border-[#e2dcce] p-5 shadow-sm relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[#0e2c1e]">
                <div className="w-full h-8 bg-gradient-to-b from-[#0e2c1e] to-transparent animate-pulse"></div>
              </div>
              <h3 className="font-mono text-[11px] font-bold tracking-wider text-[#7c7565] uppercase mb-3">Live Provenance Feed</h3>
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-[#f2efe4]">
                  <div>
                    <div className="text-[11px] font-medium text-[#1c1c1c]">Chain validation complete</div>
                    <div className="text-[9px] text-[#7c7565]">0xf7a2…3c1d</div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0e2c1e]"></div>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#f2efe4]">
                  <div>
                    <div className="text-[11px] font-medium text-[#1c1c1c]">Stratum ledger sealed</div>
                    <div className="text-[9px] text-[#7c7565]">0x8b3e…9f02</div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0e2c1e]"></div>
                </div>
              </div>
            </div>

            {/* SIDEBAR PANEL 3: NEW INTEGRATED AUTHORITY TOPOLOGY */}
            <div className="bg-white border border-[#e2dcce] p-5 shadow-sm">
              <h3 className="font-mono text-[11px] font-bold tracking-wider text-[#7c7565] uppercase mb-3">Authority Topology Map</h3>
              <div className="grid grid-cols-4 gap-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="aspect-square border border-[#e2dcce] bg-[#fcfbfa] flex items-center justify-center rounded-sm">
                    <div className={`w-2 h-2 rounded-full ${i % 4 !== 0 ? 'bg-[#0e2c1e] opacity-80' : 'bg-[#7c7565] opacity-40'}`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* SIDEBAR PANEL 4: NEW INTEGRATED RECENT ATTESTATIONS */}
            <div className="bg-white border border-[#e2dcce] p-5 shadow-sm">
              <h3 className="font-mono text-[11px] font-bold tracking-wider text-[#7c7565] uppercase mb-3">Recent Attestations</h3>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="flex justify-between items-center py-2 px-3 bg-[#fdfcf9] border border-[#e2dcce]">
                  <div>
                    <span className="text-[#1c1c1c] font-bold">ATT-2847-A</span>
                    <span className="text-[#7c7565] ml-2">Node α-12</span>
                  </div>
                  <span className="text-[#0e2c1e] font-bold">99.2%</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-[#fdfcf9] border border-[#e2dcce]">
                  <div>
                    <span className="text-[#1c1c1c] font-bold">ATT-2847-B</span>
                    <span className="text-[#7c7565] ml-2">Node β-07</span>
                  </div>
                  <span className="text-[#0e2c1e] font-bold">100%</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}