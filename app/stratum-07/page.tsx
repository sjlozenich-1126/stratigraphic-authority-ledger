"use client";

import React, { useState } from 'react';

export default function MintLedgerEntry() {
  const [formData, setFormData] = useState({
    stratum: '01',
    source: 'Inherent / Ancestral Authority',
    owner: 'Shane Jonathan Lozenich',
    concept: 'Jonathan Shane Concepts',
    framework: 'Central Trust Securities (Legal Frameworks)',
    claim: '',
    evidence: ['']
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  // Dynamically switches institutional anchors based on selected Stratum level
  const handleStratumChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let source = '';
    let framework = '';

    switch (val) {
      case '01':
        source = 'Inherent / Ancestral Authority';
        framework = 'Central Trust Securities (Legal/Sovereignty)';
        break;
      case '02':
        source = 'Constitutional / Organic Law';
        framework = 'Central Trust Securities (Constitutional Boundaries)';
        break;
      case '03':
        source = 'Statutory / Legislative Framework';
        framework = 'Central Trust Securities (Statutory Boundaries)';
        break;
      case '04':
        source = 'Administrative / Portal Regulations';
        framework = 'Central Trust Securities (Procedural Rules)';
        break;
      case '05':
        source = 'Custodial Trust Certificate Authority';
        framework = 'Fiducia Centrale (Financial Custody / Asset Trust)';
        break;
      default:
        source = 'System Log / Dynamic Entry';
        framework = 'Jonathan Shane Concepts';
    }

    setFormData({ ...formData, stratum: val, source, framework });
  };

  const handleEvidenceChange = (index: number, value: string) => {
    const updatedEvidence = [...formData.evidence];
    updatedEvidence[index] = value;
    setFormData({ ...formData, evidence: updatedEvidence });
  };

  const addEvidenceField = () => {
    setFormData({ ...formData, evidence: [...formData.evidence, ''] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'Recording entry into provenance engine...' });

    try {
      // Corrected to target your absolute central API path
      const response = await fetch('/api/ledger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          evidence: formData.evidence.filter(item => item.trim() !== ''),
          timestamp: new Date().toISOString()
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({ type: 'success', message: 'Entry successfully committed to public/audit_ledger.json' });
        setFormData({ ...formData, claim: '', evidence: [''] });
      } else {
        throw new Error(data.error || 'Failed to commit entry');
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: `Error: ${error.message || 'Connection failed.'}` });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFE4] text-[#1C1C1C] font-serif p-8 md:p-16 flex justify-center">
      <div className="max-w-3xl w-full border border-[#D9D1C0] p-12 bg-[#FAF6EE] shadow-sm relative">
        
        {/* Institutional Header Block */}
        <div className="border-b border-[#1C1C1C] pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-normal tracking-tight text-[#112F11]">PROVENANCE LEDGER</h1>
            <p className="font-sans text-xs tracking-widest text-[#666] uppercase mt-2">
              Stratum-07 Authority Minting Interface
            </p>
          </div>
          <div className="text-right font-sans text-xs tracking-wider text-[#333]">
            <div className="font-bold">SHANE JONATHAN LOZENICH</div>
            <div>JONATHAN SHANE CONCEPTS</div>
          </div>
        </div>

        {/* Status Reporting Panel */}
        {status.message && (
          <div className={`font-sans text-sm p-4 mb-6 border ${
            status.type === 'success' ? 'bg-[#E2ECE2] border-[#ADC4AD] text-[#1E3B1E]' : 
            status.type === 'error' ? 'bg-[#F2E2E2] border-[#C4ADAD] text-[#3B1E1E]' : 
            'bg-[#EAE6DD] border-[#D1CAB8] text-[#555]'
          }`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 font-sans text-sm">
          
          {/* Automatically Mapped Metadata Framework */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#F0EAE0] p-6 border border-[#D1CAB8]">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#666] mb-1">Select Stratum Level</label>
              <select 
                value={formData.stratum} 
                onChange={handleStratumChange}
                className="w-full p-2 bg-[#FAF6EE] border border-[#C4BBAA] rounded-none focus:outline-none focus:border-[#1C1C1C]"
              >
                <option value="01">Stratum 01 — Inherent / Ancestral Authority</option>
                <option value="02">Stratum 02 — Constitutional / Organic Law</option>
                <option value="03">Stratum 03 — Statutory / Legislative Framework</option>
                <option value="04">Stratum 04 — Administrative / Portal Regulations</option>
                <option value="05">Stratum 05 — Custodial Trust Framework</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#666] mb-1">Primary Source Definition</label>
              <input type="text" value={formData.source} readOnly className="w-full p-2 bg-[#E6DFD3] text-[#444] border border-[#C4BBAA] rounded-none cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#666] mb-1">Functional Jurisdiction / Custodian</label>
              <input type="text" value={formData.framework} readOnly className="w-full p-2 bg-[#E6DFD3] text-[#444] border border-[#C4BBAA] rounded-none cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#666] mb-1">Inherent Sovereign/Issuer</label>
              <input type="text" value={formData.owner} readOnly className="w-full p-2 bg-[#E6DFD3] text-[#444] border border-[#C4BBAA] rounded-none cursor-not-allowed" />
            </div>
          </div>

          {/* Substantive Claim Entry */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#333] font-bold mb-2">
              Substantive Claim / Statement of Fact
            </label>
            <textarea
              required
              rows={5}
              value={formData.claim}
              onChange={(e) => setFormData({ ...formData, claim: e.target.value })}
              placeholder="Enter the authoritative declaration, constitutional boundary, or trust framework declaration details..."
              className="w-full p-3 bg-[#FAF6EE] border border-[#C4BBAA] rounded-none focus:outline-none focus:border-[#1C1C1C] font-serif text-base text-[#1C1C1C]"
            />
          </div>

          {/* Verification Strata Evidence Tracks */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs uppercase tracking-wider text-[#333] font-bold">
                Verification Strata Evidence & Verification Tracks
              </label>
              <button 
                type="button" 
                onClick={addEvidenceField}
                className="text-xs text-[#112F11] hover:underline font-bold uppercase tracking-wider"
              >
                + Add Evidence Line
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.evidence.map((item, index) => (
                <input
                  key={index}
                  type="text"
                  value={item}
                  onChange={(e) => handleEvidenceChange(index, e.target.value)}
                  placeholder={`Verification Document / Filing Reference #${index + 1}`}
                  className="w-full p-2 bg-[#FAF6EE] border border-[#C4BBAA] rounded-none focus:outline-none focus:border-[#1C1C1C]"
                />
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#D9D1C0] flex justify-between items-center">
            <span className="text-xs text-[#777] font-sans">
              System verified for deployment verification checks.
            </span>
            <button
              type="submit"
              className="bg-[#112F11] text-[#FAF6EE] hover:bg-[#224422] px-8 py-3 rounded-none uppercase tracking-widest text-xs font-bold transition-colors"
            >
              Commit Entry to Stratum
            </button>
          </div>
        </form>

        {/* Institutional Footer Accents */}
        <div className="mt-12 pt-6 border-t border-[#D9D1C0] flex justify-between items-center text-[10px] font-sans tracking-widest text-[#888] uppercase">
          <div>Fiducia Centrale // Capital Systems Custody</div>
          <div>Central Trust Securities // Legal Stratum Verification</div>
        </div>
      </div>
    </div>
  );
}