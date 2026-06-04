"use client";

import React, { useEffect, useState } from 'react';

interface LedgerEntry {
  timestamp: string;
  stratum: string;
  source: string;
  owner: string;
  concept: string;
  framework: string;
  claim: string;
  evidence: string[];
}

export default function Stratum06Viewer() {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchLedger() {
      try {
        const response = await fetch('/api/ledger');
        if (!response.ok) throw new Error('Failed to retrieve authority ledger records.');
        const data = await response.json();
        
        // Sort entries so the newest commits appear at the top
        const sortedData = data.sort((a: LedgerEntry, b: LedgerEntry) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        setLedger(sortedData);
      } catch (err: any) {
        setError(err.message || 'System connection failure.');
      } finally {
        setLoading(false);
      }
    }
    fetchLedger();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5EFE4] text-[#1C1C1C] font-serif p-8 md:p-16 flex justify-center">
      <div className="max-w-4xl w-full border border-[#D9D1C0] p-12 bg-[#FAF6EE] shadow-sm relative">
        
        {/* Institutional Document Header */}
        <div className="border-b-2 border-[#1C1C1C] pb-6 mb-12 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-normal tracking-tight text-[#112F11]">STRATIGRAPHIC RECORD</h1>
            <p className="font-sans text-xs tracking-widest text-[#666] uppercase mt-2">
              Stratum-06 System Ledger Ledger Viewer
            </p>
          </div>
          <div className="text-right font-sans text-xs tracking-wider text-[#333]">
            <div className="font-bold">SHANE JONATHAN LOZENICH</div>
            <div>JONATHAN SHANE CONCEPTS</div>
          </div>
        </div>

        {/* Dynamic State Feedback */}
        {loading && (
          <div className="font-sans text-sm text-[#666] italic py-8 text-center border border-dashed border-[#C4BBAA]">
            Decrypting and calling stratigraphic archive ledger layers...
          </div>
        )}

        {error && (
          <div className="font-sans text-sm p-4 bg-[#F2E2E2] border border-[#C4ADAD] text-[#3B1E1E] mb-8">
            {error}
          </div>
        )}

        {!loading && ledger.length === 0 && (
          <div className="font-sans text-sm text-[#555] py-12 text-center border border-dashed border-[#C4BBAA] bg-[#F0EAE0]">
            The stratigraphic ledger is pristine and currently contains zero records.<br />
            <a href="/stratum-07" className="text-[#112F11] font-bold underline mt-2 inline-block">
              Mint First Record Entry via Stratum-07
            </a>
          </div>
        )}

        {/* Main Render Grid */}
        <div className="space-y-12">
          {ledger.map((entry, index) => (
            <div key={index} className="border border-[#D9D1C0] bg-[#FAF6EE] p-8 shadow-sm hover:border-[#1C1C1C] transition-colors relative">
              
              {/* Top Stratum Badge Accent */}
              <div className="flex justify-between items-start border-b border-[#EAE6DD] pb-4 mb-4">
                <div>
                  <span className="font-sans text-xs uppercase bg-[#112F11] text-[#FAF6EE] px-2 py-1 font-bold tracking-widest mr-3">
                    STRATUM {entry.stratum}
                  </span>
                  <span className="font-sans text-xs font-bold tracking-wider text-[#555] uppercase">
                    {entry.source}
                  </span>
                </div>
                <div className="font-sans text-[11px] text-[#777] font-mono">
                  {new Date(entry.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Substantive Declarative Statement */}
              <div className="my-6">
                <h3 className="font-sans text-xs uppercase tracking-wider text-[#666] font-bold mb-2">
                  Substantive Claim / Sovereign Record
                </h3>
                <p className="text-lg leading-relaxed text-[#1C1C1C] text-justify whitespace-pre-wrap">
                  {entry.claim}
                </p>
              </div>

              {/* Institutional Mapping Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F0EAE0] p-4 border border-[#D1CAB8] text-xs font-sans text-[#444] my-4">
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#777]">Jurisdictional Anchor</span>
                  <span className="font-medium text-[#1C1C1C]">{entry.framework}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wider text-[#777]">Inherent Sovereign Issuer</span>
                  <span className="font-medium text-[#1C1C1C]">{entry.owner}</span>
                </div>
              </div>

              {/* Verification Track Lineage */}
              {entry.evidence && entry.evidence.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#EAE6DD]">
                  <h4 className="font-sans text-xs uppercase tracking-wider text-[#666] font-bold mb-2">
                    Verification Strata Evidence Tracks
                  </h4>
                  <ul className="list-none space-y-1 font-sans text-xs text-[#555]">
                    {entry.evidence.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-center">
                        <span className="text-[#112F11] font-bold mr-2">▪</span>
                        <span className="font-mono bg-[#EAE6DD] px-1.5 py-0.5 rounded-sm border border-[#D1CAB8] text-[11px]">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Institutional System Footer */}
        <div className="mt-16 pt-6 border-t-2 border-[#1C1C1C] flex justify-between items-center text-[10px] font-sans tracking-widest text-[#888] uppercase">
          <div>Fiducia Centrale // Operational Audit Registry</div>
          <div>Central Trust Securities // Stratum Verification Authority</div>
        </div>
      </div>
    </div>
  );
}