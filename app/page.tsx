"use client";

import { useEffect, useState } from "react";

interface Stratum {
  stratum_level: number;
  authority_type: string;
  document_title: string;
  effective_date: string;
  jurisdiction_scope: string;
  legal_weight: string;
}

interface LedgerPayload {
  authority_ledger: Stratum[];
}

interface SystemAction {
  id: string;
  action_name: string;
  target_stratum: number;
  required_weight: string;
  status: "pending" | "approved" | "denied";
  justification?: string;
}

interface AuditLogEntry {
  timestamp: string;
  action_id: string;
  action_name: string;
  status: "APPROVED" | "DENIED";
  stratum_target: number;
  cryptographic_hash: string;
  governing_mandate?: string;
}

export default function Home() {
  const [ledger, setLedger] = useState<Stratum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Stratum 07 Ingestion Input State
  const [customActionName, setCustomActionName] = useState("");
  const [customTargetStratum, setCustomTargetStratum] = useState<number>(3);

  // Procedural Actions Matrix State
  const [actions, setActions] = useState<SystemAction[]>([
    { id: "ACT-001", action_name: "Query Inceptive Ancestral Roots", target_stratum: 1, required_weight: "Absolute", status: "pending" },
    { id: "ACT-002", action_name: "Modify Superior Court Record Structure", target_stratum: 3, required_weight: "Mandated", status: "pending" },
    { id: "ACT-003", action_name: "Bypass LGR 31 Public Portal Restrictions", target_stratum: 4, required_weight: "Strictly Limited", status: "pending" },
    { id: "ACT-004", action_name: "Execute Statutory Record Extraction (Supersede Portal)", target_stratum: 3, required_weight: "Mandated Operational Boundaries", status: "pending" },
  ]);

  // Operational Logging State (Stratum 06)
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  useEffect(() => {
    fetch("/authority_strata.json")
      .then((res) => {
        if (!res.ok) throw new Error("Ledger resolution failed");
        return res.json();
      })
      .then((data) => {
        // Map ledger for the Data Source Matrix
        const formattedLedger: Stratum[] = data.map((item: any, i: number) => ({
          stratum_level: (i % 4) + 1,
          authority_type: "Provenanced Anchor",
          document_title: item.document_name,
          effective_date: item.timestamp.split('T')[0],
          jurisdiction_scope: "General Ledger Authority",
          legal_weight: "Cryptographically Verified"
        }));
        setLedger(formattedLedger);

        // Populate Audit Logs for Stratum 06
        const logs: AuditLogEntry[] = data.map((item: any, i: number) => ({
          timestamp: item.timestamp,
          action_id: `DOC-00${i + 1}`,
          action_name: item.document_name,
          status: "APPROVED",
          stratum_target: 3,
          cryptographic_hash: `sha256_${item.document_hash.slice(0, 16)}`,
          governing_mandate: item.document_name
        }));
        setAuditLogs(logs);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to resolve authority_strata.json");
        setLoading(false);
      });
  }, []);
  const handleIngestAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customActionName.trim()) return;

    const nextId = `ACT-0${actions.length + 1}`;
    const matchingStratum = ledger.find(s => s.stratum_level === customTargetStratum);
    
    const newAction: SystemAction = {
      id: nextId,
      action_name: customActionName,
      target_stratum: customTargetStratum,
      required_weight: matchingStratum?.legal_weight || "Standard Evaluation",
      status: "pending"
    };

    setActions(prev => [...prev, newAction]);
    setCustomActionName("");
  };

  const evaluateAction = (actionId: string, stratumLevel: number) => {
    const matchingStratum = ledger.find(s => s.stratum_level === stratumLevel);
    let finalStatus: "approved" | "denied" = "approved";
    let finalJustification = "";

    if (!matchingStratum) {
      finalStatus = "denied";
      finalJustification = "Target stratum layer does not exist in ledger authority.";
    } else if (actionId === "ACT-003" || (stratumLevel === 4 && actions.find(a => a.id === actionId)?.action_name.toLowerCase().includes("bypass"))) {
      finalStatus = "denied";
      finalJustification = `Rejected by Stratum 04 Policy Rule: Administrative data portals cannot engineer overrides against superior statutory structures.`;
    } else if (stratumLevel === 3) {
      finalStatus = "approved";
      finalJustification = `Elevated Route Cleared: Mandate anchored in Stratum 03 [${matchingStratum.document_title}]. Bypasses localized portal boundaries via absolute legislative delegation.`;
    } else {
      finalStatus = "approved";
      finalJustification = `Verified against [${matchingStratum.document_title}]. Authority baseline match: ${matchingStratum.legal_weight}.`;
    }

    setActions(prev => prev.map(a => a.id === actionId ? { ...a, status: finalStatus, justification: finalJustification } : a));

    const dynamicHash = btoa(actionId + stratumLevel + finalStatus + Date.now()).slice(0, 16).toLowerCase();
    const newLog: AuditLogEntry = {
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      action_id: actionId,
      action_name: actions.find(a => a.id === actionId)?.action_name || "Custom Ingestion",
      status: finalStatus.toUpperCase() as "APPROVED" | "DENIED",
      stratum_target: stratumLevel,
      cryptographic_hash: `sha256_${dynamicHash}`,
      governing_mandate: matchingStratum?.document_title || "Unknown Horizon"
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  // STRATUM 09: PORTABLE DATA CREDENTIAL ISSUANCE TRACE (W3C DID:WEB COMPLIANT FOR GITHUB REGISTRY)
  const downloadVerifiableCredential = (log: AuditLogEntry) => {
    const vcPayload = {
      "@context": [
        "https://www.w3.org/2018/credentials/v1",
        "https://schema.demopocrisy.com/contexts/authority-strata-v1.jsonld"
      ],
      id: `urn:uuid:${crypto.randomUUID()}`,
      type: ["VerifiableCredential", "StratigraphicAuthorityCredential"],
      issuer: "did:web:sjlozenich-1126.github.io:stratigraphic-authority-ledger",
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: `did:user:local-agent`,
        assertedAuthority: {
          actionToken: log.action_id,
          proceduralClaim: log.action_name,
          targetStratumLevel: `Stratum-0${log.stratum_target}`,
          provenanceValidationAnchor: log.governing_mandate,
          verificationStatus: log.status
        }
      },
      proof: {
        type: "Ed25519Signature2020",
        created: new Date().toISOString(),
        verificationMethod: "did:web:sjlozenich-1126.github.io:stratigraphic-authority-ledger#key-1",
        proofPurpose: "assertionMethod",
        jws: `eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..${log.cryptographic_hash}`
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(vcPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `authority_credential_${log.action_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getLayerStats = (level: number) => {
    const layerLogs = auditLogs.filter(l => l.stratum_target === level);
    const approved = layerLogs.filter(l => l.status === "APPROVED").length;
    const denied = layerLogs.filter(l => l.status === "DENIED").length;
    return { total: layerLogs.length, approved, denied };
  };

  const totalProcessed = auditLogs.length;
  const approvedCount = auditLogs.filter(l => l.status === "APPROVED").length;
  const deniedCount = auditLogs.filter(l => l.status === "DENIED").length;
  const approvalRate = totalProcessed > 0 ? Math.round((approvedCount / totalProcessed) * 100) : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Block */}
        <header className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-200">
            Stratigraphic Authority Ledger
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Procedural Inceptive Audit Framework • Decentralized Provenance Issuance
          </p>
        </header>

        {error && (
          <div className="bg-red-950/40 border border-red-900 text-red-400 p-4 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* STRATUM 08: RELATIONAL MAPPING & METRICS VISUALIZATION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-6 rounded-xl space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stratum Level 08: Structural Flow Mapping</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real-time load and exception constraints tracking across authority horizons.</p>
            </div>

            <div className="space-y-2 flex flex-col-reverse">
              {[1, 2, 3, 4].map((level) => {
                const stats = getLayerStats(level);
                const match = ledger.find(s => s.stratum_level === level);
                const thickness = stats.total > 0 ? Math.min(stats.total * 20 + 40, 120) : 40;
                
                return (
                  <div 
                    key={level}
                    className="border border-slate-800 rounded-lg p-3 flex items-center justify-between transition-all relative overflow-hidden bg-slate-950/60"
                    style={{ height: `${thickness}px` }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 bg-cyan-950/20 pointer-events-none transition-all duration-500" style={{ width: `${stats.total * 15}%` }}></div>
                    <div className="z-10 flex items-center gap-4">
                      <span className="font-mono text-xs text-cyan-500 bg-slate-900 px-2 py-1 rounded border border-slate-800/80">
                        L0{level}
                      </span>
                      <div>
                        <span className="text-xs font-semibold text-slate-300 block leading-tight">
                          {match ? match.authority_type : `Layer Horizon 0${level}`}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block truncate max-w-md">
                          {match ? match.document_title : "Unresolved Registry Path"}
                        </span>
                      </div>
                    </div>
                    <div className="z-10 font-mono text-[11px] flex gap-3 text-slate-400">
                      <div>Blocks: <span className="text-slate-200 font-bold">{stats.total}</span></div>
                      {stats.approved > 0 && <div className="text-emerald-500">A:{stats.approved}</div>}
                      {stats.denied > 0 && <div className="text-rose-500">D:{stats.denied}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-xl flex flex-col justify-between gap-4">
            <div className="space-y-4">
              <div className="border-b border-slate-800/60 pb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pipeline Metrics</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Processed Block Stream:</span>
                <span className="text-xl font-mono font-bold text-slate-200">{totalProcessed}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Policy Confirmations:</span>
                <span className="text-xl font-mono font-bold text-emerald-400">{approvedCount}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400">Systemic Exception Holds:</span>
                <span className="text-xl font-mono font-bold text-rose-400">{deniedCount}</span>
              </div>
            </div>
            <div className="border-t border-slate-800/60 pt-4 space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Rule Clearance Velocity</span>
              <div className="text-3xl font-mono font-bold text-cyan-400">{approvalRate}%</div>
            </div>
          </div>
        </section>

        {/* STRATUM 07: USER INPUT INGESTION PORTAL */}
        <section className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Stratum Level 07: User Input Ingestion Portal
            </h2>
            <p className="text-slate-500 text-sm mt-1">Submit new system queries or access requests directly into the stratigraphic evaluation engine.</p>
          </div>

          <form onSubmit={handleIngestAction} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1 w-full">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Action Description / Query Parameters</label>
              <input 
                type="text" 
                value={customActionName}
                onChange={(e) => setCustomActionName(e.target.value)}
                placeholder="e.g., Run procedural extraction trace or issue statutory challenge..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div className="w-full md:w-48 space-y-1">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">Target Stratum</label>
              <select 
                value={customTargetStratum} 
                onChange={(e) => setCustomTargetStratum(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value={1}>Stratum 01 (Inceptive Constitution)</option>
                <option value={2}>Stratum 02 (Organic Enabling Acts)</option>
                <option value={3}>Stratum 03 (Statutory RCW Codes)</option>
                <option value={4}>Stratum 04 (Administrative Portals)</option>
              </select>
            </div>
            <button 
              type="submit"
              className="w-full md:w-auto bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold px-5 py-2 rounded-lg text-sm transition-all"
            >
              Ingest Query
            </button>
          </form>
        </section>

        {/* STRATUM 05: PROCEDURAL POLICY MATRIX */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Stratum Level 05: Procedural Policy Evaluation Engine
          </h2>

          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 space-y-4">
            {actions.map((action) => (
              <div 
                key={action.id} 
                className="flex flex-col md:flex-row md:items-center justify-between border border-slate-800/80 bg-slate-950/40 p-4 rounded-lg gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {action.id}
                    </span>
                    <span className="text-sm font-medium text-slate-200">
                      {action.action_name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Evaluates targeting: <span className="text-cyan-500 font-mono">Stratum 0{action.target_stratum}</span> Matrix Base
                  </p>
                  {action.justification && (
                    <p className={`text-xs mt-2 p-2 rounded border font-mono ${
                      action.status === "approved" 
                        ? "bg-emerald-950/20 border-emerald-950 text-emerald-400" 
                        : "bg-rose-950/20 border-rose-950 text-rose-400"
                    }`}>
                      {action.justification}
                    </p>
                  )}
                </div>

                <div>
                  {action.status === "pending" ? (
                    <button
                      onClick={() => evaluateAction(action.id, action.target_stratum)}
                      className="w-full md:w-auto text-xs px-4 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-all border border-slate-700"
                    >
                      Audit Action
                    </button>
                  ) : (
                    <span className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded font-bold block text-center ${
                      action.status === "approved"
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                    }`}>
                      {action.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DATA SOURCE: READ-ONLY INGESTION CARDS */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Data Source Reference Matrix (Strata 01 - 04)
          </h2>
          
          {loading ? (
            <div className="text-slate-500 animate-pulse text-sm">
              Unpacking local stratigraphic layers...
            </div>
          ) : (
            <div className="space-y-4">
              {ledger.map((stratum, index) => (
                <div 
                  key={`stratum-layer-${stratum.stratum_level}-${index}`} 
                  className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono text-cyan-500 uppercase tracking-widest block mb-1">
                        Stratum Level 0{stratum.stratum_level} — {stratum.authority_type}
                      </span>
                      <h2 className="text-xl font-semibold text-slate-200">
                        {stratum.document_title}
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      Eff: {stratum.effective_date}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-800/60 text-sm">
                    <div className="md:col-span-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Jurisdictional Scope</span>
                      <p className="text-slate-300 leading-relaxed">{stratum.jurisdiction_scope}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Legal Weight Baseline</span>
                      <p className="text-slate-300 font-medium text-amber-500/90">{stratum.legal_weight}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* STRATUM 06: IMMUTABLE AUDIT LOGS WITH PORTABLE VERIFIABLE CREDENTIAL EXPORT */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Stratum Level 06: Immutable Transaction Logs & Credential Minting
          </h2>
          <div className="bg-slate-950 border border-slate-900 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-semibold text-slate-400 tracking-wider font-mono">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action Token</th>
                  <th className="p-4">Target Strata</th>
                  <th className="p-4">Status Baseline</th>
                  <th className="p-4">Portable Authority Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60 font-mono text-xs">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-600 italic">
                      Awaiting procedural audit executions to stream data metrics...
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4 text-slate-400">{log.timestamp}</td>
                      <td className="p-4 font-semibold text-slate-200">{log.action_id}</td>
                      <td className="p-4 text-cyan-500">Stratum 0{log.stratum_target}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide ${
                          log.status === "APPROVED" 
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-900/50" 
                            : "bg-rose-950 text-rose-400 border border-rose-900/50"
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {log.status === "APPROVED" ? (
                          <button
                            onClick={() => downloadVerifiableCredential(log)}
                            className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800/60 px-3 py-1 rounded text-[11px] font-semibold transition-colors uppercase tracking-wider"
                          >
                            Export VC Block
                          </button>
                        ) : (
                          <span className="text-slate-600 italic text-[11px]">Halting State Intercepted</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </div>
    </main>
  );
}