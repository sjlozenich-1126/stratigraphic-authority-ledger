import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://stratigraphic-authority-ledger.vercel.app";
const FIDUCIA_TOKEN = "";

const STRATA = [
  { code: "01-Inherent", name: "Inherent Identity", short: "S01", color: "#4ade80", desc: "DNA, lineage, biological identity" },
  { code: "02-Constitutional", name: "Constitutional", short: "S02", color: "#818cf8", desc: "Charters, constitutions, covenants" },
  { code: "03-Statutory", name: "Statutory", short: "S03", color: "#a78bfa", desc: "Rules, policies, compliance" },
  { code: "04-Administrative", name: "Administrative", short: "S04", color: "#60a5fa", desc: "Execution, enforcement, ops" },
  { code: "05-Certificatory", name: "Certificatory", short: "S05", color: "#34d399", desc: "Attestations, notarizations" },
  { code: "06-Provenance", name: "Provenance", short: "S06", color: "#fbbf24", desc: "Chain of title, records" },
  { code: "07-Hereditary", name: "Hereditary / Majorat", short: "S07", color: "#f472b6", desc: "Lineage-based, heir authority" },
  { code: "08-Procedural", name: "Procedural Legal", short: "S08", color: "#fb923c", desc: "Court filings, legal actions" },
];

const ACTION_TOKENS = {
  "REGISTER_IDENTITY": { label: "Register Identity", stratum: "01-Inherent", tier: 8, level: 8 },
  "REGISTER_INSTRUMENT": { label: "Register Instrument", stratum: "02-Constitutional", tier: 8, level: 4 },
  "MINT_FDC": { label: "Mint FDC", stratum: "07-Operational", tier: 8, level: 4 },
  "TRANSFER_FDC": { label: "Transfer FDC", stratum: "04-Administrative", tier: 3, level: 3 },
  "REDEEM_FDC": { label: "Redeem FDC", stratum: "05-Certificatory", tier: 5, level: 3 },
  "REGISTER_DOC": { label: "Register Document", stratum: "06-Provenance", tier: 3, level: 4 },
  "ATTEST_DOC": { label: "Attest Document", stratum: "05-Certificatory", tier: 4, level: 4 },
  "FILE_QUIET_TITLE": { label: "File Quiet Title", stratum: "08-Procedural", tier: 3, level: 4 },
  "INITIATE_LEGAL_PROCEEDING": { label: "Initiate Legal Proceeding", stratum: "08-Procedural", tier: 3, level: 4 },
  "REGISTER_AUTHORITY_MODEL": { label: "Register Authority Model", stratum: "02-Constitutional", tier: 8, level: 4 },
};

const INSTRUMENTS = ["currency", "identity", "credit", "certificate", "doc_provenance", "legal_filing", "legal_procedure", "governance", "monetary_instrument_definition", "authority_framework"];

function hashSimulate(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

function generateId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function timeSince(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

function truncHash(h) {
  if (!h) return "—";
  return h.length > 16 ? h.slice(0, 8) + "…" + h.slice(-4) : h;
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=DM+Serif+Display:ital@0;1&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080a0f; color: #c8ccd4; font-family: 'JetBrains Mono', monospace; }
  .app { min-height: 100vh; padding: 0; }
  .hdr { border-bottom: 1px solid #1a1f2e; padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; background: #0a0c12; position: sticky; top: 0; z-index: 100; }
  .hdr-left { display: flex; align-items: center; gap: 12px; }
  .pulse { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }
  .logo { font-family: 'DM Serif Display', serif; font-size: 20px; color: #f0f2f5; letter-spacing: -0.5px; }
  .logo span { color: #818cf8; font-style: italic; }
  .sub { font-size: 10px; color: #4b5563; letter-spacing: 0.2em; text-transform: uppercase; }
  .tabs { display: flex; gap: 4px; background: #0d1017; border: 1px solid #1a1f2e; border-radius: 8px; padding: 4px; }
  .tab { padding: 6px 14px; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; cursor: pointer; border-radius: 5px; border: none; background: transparent; color: #6b7280; transition: all 0.2s; font-family: 'JetBrains Mono', monospace; }
  .tab.active { background: #1a1f2e; color: #f0f2f5; }
  .tab:hover:not(.active) { color: #c8ccd4; }
  .content { padding: 24px; max-width: 1400px; margin: 0 auto; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
  .card { background: #0d1017; border: 1px solid #1a1f2e; border-radius: 10px; padding: 16px; }
  .card-h { font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: #4b5563; margin-bottom: 12px; }
  .metric-val { font-family: 'DM Serif Display', serif; font-size: 32px; color: #f0f2f5; }
  .metric-sub { font-size: 10px; color: #6b7280; margin-top: 4px; }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; font-size: 10px; letter-spacing: 0.05em; }
  .badge-green { background: rgba(74,222,128,0.12); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
  .badge-purple { background: rgba(129,140,248,0.12); color: #818cf8; border: 1px solid rgba(129,140,248,0.2); }
  .badge-amber { background: rgba(251,191,36,0.12); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
  .badge-red { background: rgba(248,113,113,0.12); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }
  .badge-blue { background: rgba(96,165,250,0.12); color: #60a5fa; border: 1px solid rgba(96,165,250,0.2); }
  .strat-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .strat-label { font-size: 10px; color: #6b7280; width: 130px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .strat-bar-bg { flex: 1; height: 6px; background: #1a1f2e; border-radius: 3px; overflow: hidden; }
  .strat-bar { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(0.22,1,0.36,1); }
  .strat-pct { font-size: 10px; color: #9ca3af; width: 36px; text-align: right; }
  .feed-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #13171f; }
  .feed-item:last-child { border-bottom: none; }
  .feed-action { font-size: 11px; color: #e2e8f0; }
  .feed-hash { font-size: 9px; color: #4b5563; margin-top: 2px; }
  .feed-time { font-size: 9px; color: #6b7280; }
  .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .section-title { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #6b7280; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid #1a1f2e; }
  .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .form-row.single { grid-template-columns: 1fr; }
  .form-row.three { grid-template-columns: 1fr 1fr 1fr; }
  .fld { display: flex; flex-direction: column; gap: 5px; }
  .fld label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; }
  .fld input, .fld select, .fld textarea { background: #0a0c12; border: 1px solid #1a1f2e; border-radius: 6px; color: #c8ccd4; font-family: 'JetBrains Mono', monospace; font-size: 12px; padding: 8px 10px; outline: none; transition: border-color 0.2s; }
  .fld input:focus, .fld select:focus, .fld textarea:focus { border-color: #818cf8; }
  .fld select option { background: #0a0c12; }
  .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; transition: all 0.2s; }
  .btn-primary { background: #818cf8; color: #fff; }
  .btn-primary:hover { background: #6366f1; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-secondary { background: #1a1f2e; color: #c8ccd4; border: 1px solid #2a3040; }
  .btn-secondary:hover { background: #222838; }
  .btn-green { background: #064e3b; color: #4ade80; border: 1px solid #065f46; }
  .btn-green:hover { background: #065f46; }
  .btn-sm { padding: 6px 12px; font-size: 10px; }
  .ledger-tbl { width: 100%; border-collapse: collapse; font-size: 11px; }
  .ledger-tbl th { text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.15em; color: #4b5563; padding: 8px 12px; border-bottom: 1px solid #1a1f2e; font-weight: 400; }
  .ledger-tbl td { padding: 10px 12px; border-bottom: 1px solid #0f1420; vertical-align: top; }
  .ledger-tbl tr:hover td { background: #0f1420; }
  .ledger-tbl tr:last-child td { border-bottom: none; }
  .mono { font-family: 'JetBrains Mono', monospace; }
  .txt-muted { color: #4b5563; }
  .txt-accent { color: #818cf8; }
  .txt-green { color: #4ade80; }
  .txt-amber { color: #fbbf24; }
  .txt-primary { color: #f0f2f5; }
  .authority-triple { display: flex; gap: 6px; flex-wrap: wrap; }
  .auth-chip { font-size: 9px; padding: 2px 6px; border-radius: 3px; letter-spacing: 0.05em; }
  .chip-s { background: rgba(129,140,248,0.15); color: #a5b4fc; }
  .chip-t { background: rgba(74,222,128,0.1); color: #6ee7b7; }
  .chip-l { background: rgba(251,191,36,0.1); color: #fcd34d; }
  .entry-detail { background: #0a0c12; border: 1px solid #1a1f2e; border-radius: 8px; padding: 16px; margin-top: 8px; }
  .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 11px; }
  .detail-row { display: flex; flex-direction: column; gap: 3px; }
  .detail-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: #4b5563; }
  .detail-val { color: #c8ccd4; word-break: break-all; }
  .cert-box { background: #0a0c12; border: 1px solid #2a3040; border-radius: 10px; padding: 24px; position: relative; overflow: hidden; }
  .cert-watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-30deg); font-family: 'DM Serif Display', serif; font-size: 80px; color: rgba(129,140,248,0.04); pointer-events: none; white-space: nowrap; }
  .cert-seal { width: 64px; height: 64px; border-radius: 50%; border: 2px solid #818cf8; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; }
  .cert-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #f0f2f5; margin-bottom: 8px; }
  .cert-subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: 0.3em; color: #6b7280; margin-bottom: 24px; }
  .cert-body { font-size: 12px; color: #9ca3af; line-height: 1.8; margin-bottom: 20px; }
  .cert-field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1a1f2e; font-size: 11px; }
  .cert-field:last-child { border-bottom: none; }
  .cert-hash { font-size: 10px; color: #4b5563; word-break: break-all; margin-top: 20px; padding-top: 16px; border-top: 1px solid #1a1f2e; }
  .topology-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .topo-node { aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 4px; font-size: 9px; }
  .alert { padding: 10px 14px; border-radius: 6px; font-size: 11px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .alert-green { background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2); color: #4ade80; }
  .alert-red { background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); color: #f87171; }
  .alert-blue { background: rgba(96,165,250,0.08); border: 1px solid rgba(96,165,250,0.2); color: #60a5fa; }
  .spinner { width: 14px; height: 14px; border: 2px solid rgba(129,140,248,0.3); border-top-color: #818cf8; border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .gdri-bar { height: 8px; background: #1a1f2e; border-radius: 4px; overflow: hidden; margin: 8px 0; }
  .gdri-fill { height: 100%; background: linear-gradient(90deg, #4ade80, #818cf8); border-radius: 4px; transition: width 1s; }
  .json-view { background: #050709; border: 1px solid #1a1f2e; border-radius: 8px; padding: 14px; font-size: 10px; line-height: 1.7; overflow-x: auto; white-space: pre; color: #9ca3af; max-height: 300px; overflow-y: auto; }
  .row-actions { display: flex; gap: 6px; }
  .empty-state { text-align: center; padding: 40px 20px; color: #4b5563; font-size: 11px; }
  .empty-icon { font-size: 32px; margin-bottom: 12px; opacity: 0.3; }
  .filter-row { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
  .filter-btn { padding: 4px 10px; border: 1px solid #1a1f2e; border-radius: 4px; font-size: 10px; background: transparent; color: #6b7280; cursor: pointer; font-family: 'JetBrains Mono', monospace; transition: all 0.15s; }
  .filter-btn.active { background: #1a1f2e; color: #c8ccd4; border-color: #2a3040; }
  .page-header { margin-bottom: 24px; }
  .page-header h2 { font-family: 'DM Serif Display', serif; font-size: 26px; color: #f0f2f5; margin-bottom: 4px; }
  .page-header p { font-size: 11px; color: #4b5563; }
  .sep { width: 100%; height: 1px; background: #1a1f2e; margin: 20px 0; }
  .int-score { display: flex; align-items: baseline; gap: 6px; }
  .int-score .big { font-family: 'DM Serif Display', serif; font-size: 42px; color: #4ade80; }
  .int-score .unit { font-size: 14px; color: #6b7280; }
`;

const LOCAL_KEY = "fc_ledger_v2";

function loadLocalLedger() {
  try {
    const d = localStorage.getItem(LOCAL_KEY);
    return d ? JSON.parse(d) : [];
  } catch { return []; }
}

function saveLocalLedger(entries) {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(entries)); } catch {}
}

const DEMO_ENTRIES = [
  {
    id: "STRATUM01-IDENTITY-SJL",
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
    asset: { id: "SJL-ARCHAEOGENETIC-IDENTITY", type: "identity_record", label: "Archaeogenetic Identity & Lineage Certification — SJL" },
    action: { token: "REGISTER_IDENTITY", stratum: "01-Inherent", reason: "Establish inherent biological and ancestral identity." },
    parties: { issuer: "Archaeogenetic Laboratory NG-25051", from: null, to: "Shane Jonathan Lozenich" },
    instrument: { type: "identity", unit: null, amount: null, terms_ref: null },
    legal: { jurisdiction: "BIOLOGICAL", forum: "NG-25051 Stratigraphic Profiling", upstream_refs: [], doc_hash: "bb1b36ad40b59127cf5f5c1245d453c4" },
    authority: { stratum: "01-Inherent", tier: 8, level: 8 },
    policy: { gdr_index_delta: null, constraints: ["IDENTITY_VERIFICATION_REQUIRED"] },
    metadata: { tags: ["identity", "lineage", "stratum01", "CLR-AG-2026-009"], notes: "Dual-horizon archaeogenetic identity record; heir-level protection.", version: "1.0" },
  },
  {
    id: "STRATUM02-AUTH-CONSTITUTION-V1",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    asset: { id: "AUTH-CONSTITUTION-V1", type: "authority_framework", label: "Unified Authority Constitution v1.0" },
    action: { token: "REGISTER_AUTHORITY_MODEL", stratum: "02-Constitutional", reason: "Define unified authority framework for identity, finance, and security." },
    parties: { issuer: "Fiducia Centrale", from: null, to: null },
    instrument: { type: "governance", unit: null, amount: null, terms_ref: "AUTH-CONSTITUTION-V1" },
    legal: { jurisdiction: "ON-CHAIN", forum: "Fiducia Centrale — Constitutional Chamber", upstream_refs: [], doc_hash: "AUTH-CONSTITUTION-HASH-V1" },
    authority: { stratum: "02-Constitutional", tier: 8, level: 4 },
    policy: { gdr_index_delta: null, constraints: ["AUTHORITY_MODEL_DEFINITION"] },
    metadata: { tags: ["authority", "constitution", "stratum02"], notes: "Defines unified authority framework (strata, tiers, levels).", version: "1.0" },
  },
  {
    id: "STRATUM02-FDC-CONSTITUTION-V1",
    timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    asset: { id: "FDC-CONSTITUTION-V1", type: "monetary_instrument_definition", label: "Fiducial Credit (FDC) — Monetary Constitution v1.0" },
    action: { token: "REGISTER_INSTRUMENT", stratum: "02-Constitutional", reason: "Establish Fiducial Credit (FDC) as a hybrid institutional currency." },
    parties: { issuer: "Fiducia Centrale — Constitutional Authority", from: null, to: null },
    instrument: { type: "currency", unit: "FDC", amount: null, terms_ref: "FDC-CONSTITUTION-V1" },
    legal: { jurisdiction: "ON-CHAIN", forum: "Fiducia Centrale — Constitutional Chamber", upstream_refs: ["STRATUM01-IDENTITY-SJL"], doc_hash: "FDC-CONSTITUTION-HASH-V1" },
    authority: { stratum: "02-Constitutional", tier: 8, level: 4 },
    policy: { gdr_index_delta: null, constraints: ["ISSUANCE_RULE_PUBLIC_GOOD", "ANNUAL_MINT_CAP"] },
    metadata: { tags: ["currency", "FDC", "constitution", "stratum02"], notes: "Hybrid institutional currency backed by Global Debt Reduction Index.", version: "1.0" },
  },
  {
    id: "STRATUM08-LEGAL-26-2-01443-4-SEA",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    asset: { id: "QUIET-TITLE-SJL-MAJORAT", type: "legal_claim", label: "Petition for Declaratory Judgment & Quiet Title — Seattle-Bremerton Majorat" },
    action: { token: "INITIATE_LEGAL_PROCEEDING", stratum: "08-Procedural", reason: "Exercise procedural authority to assert rights and challenge adverse claims." },
    parties: { issuer: "Shane Jonathan Lozenich", from: "Shane Jonathan Lozenich", to: "King County Superior Court" },
    instrument: { type: "legal_procedure", unit: null, amount: null, terms_ref: null },
    legal: { jurisdiction: "WA-KING-COUNTY", forum: "King County Superior Court", upstream_refs: ["STRATUM01-IDENTITY-SJL"], doc_hash: "PETITION-26-2-01443-4-SEA" },
    authority: { stratum: "08-Procedural", tier: 3, level: 4 },
    policy: { gdr_index_delta: null, constraints: ["PROCEDURAL_AUTHORITY"] },
    metadata: { tags: ["legal", "quiet_title", "majorat", "stratum08"], notes: "Pro se filing; case accepted by King County Superior Court.", version: "1.0" },
  },
];

export default function App() {
  const [tab, setTab] = useState("overview");
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mintForm, setMintForm] = useState({ action_token: "REGISTER_DOC", stratum: "06-Provenance", asset_label: "", asset_type: "doc_provenance", issuer: "Fiducia Centrale", to: "", instrument_type: "doc_provenance", instrument_unit: "", instrument_amount: "", reason: "", jurisdiction: "ON-CHAIN", tier: 4, level: 3, tags: "", notes: "" });
  const [mintStatus, setMintStatus] = useState(null);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [certEntry, setCertEntry] = useState(null);
  const [filterStratum, setFilterStratum] = useState("all");
  const [apiStatus, setApiStatus] = useState("unknown");
  const [gdri, setGdri] = useState(1000000);
  const [fdc, setFdc] = useState(0);

  useEffect(() => {
    const stored = loadLocalLedger();
    if (stored.length === 0) {
      setLedger(DEMO_ENTRIES);
      saveLocalLedger(DEMO_ENTRIES);
    } else {
      setLedger(stored);
    }
    const fdcMints = stored.filter(e => e.action?.token === "MINT_FDC");
    const total = fdcMints.reduce((s, e) => s + (e.instrument?.amount || 0), 0);
    setFdc(total);
    const gdriDelta = stored.reduce((s, e) => s + (e.policy?.gdr_index_delta || 0), 0);
    setGdri(1000000 + gdriDelta);
    pingApi();
  }, []);

  async function pingApi() {
    try {
      const r = await fetch(`${API_BASE}/api/ledger`, { signal: AbortSignal.timeout(4000) });
      if (r.ok) setApiStatus("online");
      else setApiStatus("error");
    } catch {
      setApiStatus("local");
    }
  }

  const filteredLedger = filterStratum === "all" ? ledger : ledger.filter(e => e.authority?.stratum?.startsWith(filterStratum));

  function handleMintChange(k, v) {
    setMintForm(f => {
      const nf = { ...f, [k]: v };
      if (k === "action_token" && ACTION_TOKENS[v]) {
        nf.stratum = ACTION_TOKENS[v].stratum;
        nf.tier = ACTION_TOKENS[v].tier;
        nf.level = ACTION_TOKENS[v].level;
      }
      return nf;
    });
  }

  async function handleMint(e) {
    e.preventDefault();
    setLoading(true);
    setMintStatus(null);
    try {
      const now = new Date().toISOString();
      const id = generateId(mintForm.action_token.slice(0, 6));
      const raw = id + now + mintForm.asset_label + mintForm.reason;
      const entry = {
        id,
        timestamp: now,
        asset: {
          id: generateId("ASSET"),
          type: mintForm.asset_type,
          label: mintForm.asset_label || "Untitled Entry",
        },
        action: {
          token: mintForm.action_token,
          stratum: mintForm.stratum,
          reason: mintForm.reason,
        },
        parties: {
          issuer: mintForm.issuer || "Fiducia Centrale",
          from: mintForm.issuer || null,
          to: mintForm.to || null,
        },
        instrument: {
          type: mintForm.instrument_type,
          unit: mintForm.instrument_unit || null,
          amount: mintForm.instrument_amount ? parseFloat(mintForm.instrument_amount) : null,
          terms_ref: mintForm.action_token === "MINT_FDC" ? "FDC-CONSTITUTION-V1" : null,
        },
        legal: {
          jurisdiction: mintForm.jurisdiction,
          forum: "Fiducia Centrale",
          upstream_refs: [],
          doc_hash: "0x" + hashSimulate(raw),
        },
        authority: {
          stratum: mintForm.stratum,
          tier: parseInt(mintForm.tier),
          level: parseInt(mintForm.level),
        },
        policy: {
          gdr_index_delta: mintForm.action_token === "MINT_FDC" ? -(parseFloat(mintForm.instrument_amount) || 0) : null,
          constraints: [],
        },
        metadata: {
          tags: mintForm.tags ? mintForm.tags.split(",").map(t => t.trim()) : [],
          notes: mintForm.notes,
          version: "1.0",
        },
        _local: true,
      };

      let saved = false;
      if (apiStatus === "online" && FIDUCIA_TOKEN) {
        try {
          const r = await fetch(`${API_BASE}/api/mint`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Fiducia-Token": FIDUCIA_TOKEN },
            body: JSON.stringify(entry),
            signal: AbortSignal.timeout(6000),
          });
          if (r.ok) { saved = true; entry._local = false; }
        } catch {}
      }

      const newLedger = [entry, ...ledger];
      setLedger(newLedger);
      saveLocalLedger(newLedger);
      if (entry.action.token === "MINT_FDC") setFdc(f => f + (entry.instrument.amount || 0));
      if (entry.policy.gdr_index_delta) setGdri(g => g + entry.policy.gdr_index_delta);
      setMintStatus({ ok: true, msg: saved ? "Entry minted and synced to Vercel." : "Entry minted locally (Vercel offline — will sync when reconnected).", id: entry.id });
      setMintForm(f => ({ ...f, asset_label: "", reason: "", notes: "", tags: "", to: "", instrument_amount: "" }));
    } catch (err) {
      setMintStatus({ ok: false, msg: "Minting failed: " + err.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadRemote() {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/ledger`, { signal: AbortSignal.timeout(6000) });
      if (!r.ok) throw new Error("API error " + r.status);
      const data = await r.json();
      if (Array.isArray(data) && data.length > 0) {
        const merged = [...data, ...ledger.filter(e => e._local)];
        setLedger(merged);
        saveLocalLedger(merged);
        setMintStatus({ ok: true, msg: `Loaded ${data.length} entries from Vercel.` });
      } else {
        setMintStatus({ ok: false, msg: "Remote ledger is empty. Your local entries are intact." });
      }
    } catch (err) {
      setMintStatus({ ok: false, msg: "Could not reach remote API: " + err.message });
    } finally {
      setLoading(false);
    }
  }

  function renderAuthority(a) {
    if (!a) return null;
    const s = STRATA.find(x => x.code === a.stratum);
    return (
      <div className="authority-triple">
        <span className="auth-chip chip-s">{s?.short || a.stratum}</span>
        <span className="auth-chip chip-t">T{a.tier}</span>
        <span className="auth-chip chip-l">L{a.level}</span>
      </div>
    );
  }

  function getStratumColor(code) {
    return STRATA.find(s => s.code === code)?.color || "#6b7280";
  }

  function Overview() {
    const counts = STRATA.map(s => ({ ...s, count: ledger.filter(e => e.authority?.stratum === s.code).length }));
    const total = ledger.length;
    const verifiedPct = total > 0 ? Math.round((ledger.filter(e => e.action?.token !== undefined).length / total) * 100) : 0;
    return (
      <div>
        <div className="page-header">
          <h2>Fiducia Centrale</h2>
          <p>Stratigraphic Provenance Engine — Identity · Finance · Security</p>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span className={`badge ${apiStatus === "online" ? "badge-green" : apiStatus === "local" ? "badge-amber" : "badge-blue"}`}>
            ● {apiStatus === "online" ? "API Online" : apiStatus === "local" ? "Local Mode" : "Checking API…"}
          </span>
          <span className="badge badge-purple">● FDC-CONSTITUTION-V1 Active</span>
          <span className="badge badge-blue">● AUTH-CONSTITUTION-V1 Active</span>
        </div>

        <div className="grid4">
          {[
            { label: "Ledger Entries", val: total, sub: "immutable blocks", color: "#818cf8" },
            { label: "FDC Supply", val: fdc.toLocaleString(), sub: "fiducial credits minted", color: "#4ade80" },
            { label: "GDRI Balance", val: gdri.toLocaleString(), sub: "global debt reduction index", color: "#fbbf24" },
            { label: "Integrity", val: verifiedPct + "%", sub: "verified entries", color: "#f472b6" },
          ].map(m => (
            <div className="card" key={m.label}>
              <div className="card-h">{m.label}</div>
              <div className="metric-val" style={{ color: m.color, fontSize: 26 }}>{m.val}</div>
              <div className="metric-sub">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid2">
          <div className="card">
            <div className="card-h">Stratigraphic Authority Layers</div>
            {counts.map((s, i) => (
              <div className="strat-row" key={s.code}>
                <div className="strat-label" title={s.name}>{s.short} · {s.name}</div>
                <div className="strat-bar-bg">
                  <div className="strat-bar" style={{ width: total > 0 ? Math.max((s.count / total) * 100, s.count > 0 ? 6 : 0) + "%" : "0%", background: s.color }} />
                </div>
                <div className="strat-pct">{s.count}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h">Live Provenance Feed</div>
            {ledger.slice(0, 8).map(e => (
              <div className="feed-item" key={e.id}>
                <div>
                  <div className="feed-action">{ACTION_TOKENS[e.action?.token]?.label || e.action?.token}</div>
                  <div className="feed-hash">{truncHash(e.legal?.doc_hash)}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="feed-time">{timeSince(e.timestamp)}</div>
                  <div className="dot" style={{ background: getStratumColor(e.authority?.stratum) }} />
                </div>
              </div>
            ))}
            {ledger.length === 0 && <div className="empty-state"><div className="empty-icon">◈</div>No entries yet. Mint your first block.</div>}
          </div>
        </div>

        <div className="grid2">
          <div className="card">
            <div className="card-h">Authority Models</div>
            {[
              { name: "Model A — Identity & Institutional", axis: "Stratum 01–08", icon: "◆", color: "#818cf8", desc: "Biological identity, constitutional authority, legal procedures" },
              { name: "Model B — Financial & Monetary", axis: "Tier 1–8", icon: "◈", color: "#4ade80", desc: "FDC issuance, monetary governance, GDRI-backed currency" },
              { name: "Model C — Security & Risk", axis: "Level 1–8", icon: "◉", color: "#fbbf24", desc: "Risk classification, heir protection, access control" },
            ].map(m => (
              <div key={m.name} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1f2e" }}>
                <div style={{ fontSize: 20, color: m.color, flexShrink: 0, paddingTop: 2 }}>{m.icon}</div>
                <div>
                  <div style={{ fontSize: 12, color: "#e2e8f0", marginBottom: 2 }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{m.desc}</div>
                  <span className="badge badge-purple" style={{ fontSize: 9 }}>{m.axis}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-h">GDRI — Global Debt Reduction Index</div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>Current balance</div>
              <div className="int-score"><span className="big">{(gdri / 1000000).toFixed(2)}M</span><span className="unit">units</span></div>
            </div>
            <div className="gdri-bar">
              <div className="gdri-fill" style={{ width: Math.max(5, Math.min(100, (gdri / 1000000) * 100)) + "%" }} />
            </div>
            <div style={{ fontSize: 10, color: "#4b5563", marginTop: 8 }}>
              Each FDC minted reduces this index by 1 unit. The currency exists to reduce global debt over time.
            </div>
            <div className="sep" />
            <div className="card-h" style={{ marginBottom: 8 }}>FDC Supply Distribution</div>
            {["MINT_FDC", "TRANSFER_FDC", "REDEEM_FDC"].map(tok => {
              const c = ledger.filter(e => e.action?.token === tok).length;
              return (
                <div key={tok} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "4px 0" }}>
                  <span className="txt-muted">{tok}</span>
                  <span style={{ color: "#c8ccd4" }}>{c}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function Ledger() {
    return (
      <div>
        <div className="page-header">
          <h2>Provenance Ledger</h2>
          <p>All entries — immutable, cryptographically hashed, append-only</p>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="filter-row" style={{ marginBottom: 0 }}>
            <button className={`filter-btn ${filterStratum === "all" ? "active" : ""}`} onClick={() => setFilterStratum("all")}>All</button>
            {STRATA.map(s => (
              <button key={s.code} className={`filter-btn ${filterStratum === s.short ? "active" : ""}`} onClick={() => setFilterStratum(filterStratum === s.short ? "all" : s.short)} style={{ borderColor: filterStratum === s.short ? s.color + "66" : undefined }}>
                {s.short}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleLoadRemote} disabled={loading}>
              {loading ? "…" : "⟳ Sync Remote"}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => { setLedger(DEMO_ENTRIES); saveLocalLedger(DEMO_ENTRIES); }}>
              Reset Demo
            </button>
          </div>
        </div>
        {mintStatus && (
          <div className={`alert ${mintStatus.ok ? "alert-green" : "alert-red"}`}>
            {loading && <div className="spinner" />}
            {mintStatus.msg}
          </div>
        )}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="ledger-tbl">
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Asset</th>
                <th>Authority</th>
                <th>Hash</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#4b5563", fontSize: 11 }}>No entries match this filter.</td></tr>
              )}
              {filteredLedger.map(e => (
                <>
                  <tr key={e.id} style={{ cursor: "pointer" }} onClick={() => setSelectedEntry(selectedEntry?.id === e.id ? null : e)}>
                    <td style={{ fontFamily: "monospace", fontSize: 10, color: "#818cf8", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.id}</td>
                    <td style={{ fontSize: 10, color: "#6b7280", whiteSpace: "nowrap" }}>{new Date(e.timestamp).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: 9 }}>{e.action?.token}</span>
                    </td>
                    <td style={{ fontSize: 11, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={e.asset?.label}>{e.asset?.label}</td>
                    <td>{renderAuthority(e.authority)}</td>
                    <td style={{ fontSize: 9, fontFamily: "monospace", color: "#4b5563" }}>{truncHash(e.legal?.doc_hash)}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-secondary btn-sm" onClick={ev => { ev.stopPropagation(); setCertEntry(e); setTab("certificates"); }}>Cert</button>
                        {e._local && <span className="badge badge-amber" style={{ fontSize: 8 }}>local</span>}
                      </div>
                    </td>
                  </tr>
                  {selectedEntry?.id === e.id && (
                    <tr key={e.id + "-detail"}>
                      <td colSpan={7} style={{ padding: "0 12px 16px" }}>
                        <div className="entry-detail">
                          <div className="detail-grid">
                            {[
                              ["Issuer", e.parties?.issuer],
                              ["To / Recipient", e.parties?.to || "—"],
                              ["Stratum", e.action?.stratum],
                              ["Instrument", e.instrument?.type + (e.instrument?.unit ? " · " + e.instrument.unit : "")],
                              ["Amount", e.instrument?.amount?.toLocaleString() || "—"],
                              ["Jurisdiction", e.legal?.jurisdiction],
                              ["GDR Delta", e.policy?.gdr_index_delta?.toLocaleString() || "—"],
                              ["Tags", (e.metadata?.tags || []).join(", ") || "—"],
                              ["Notes", e.metadata?.notes || "—"],
                              ["Reason", e.action?.reason],
                            ].map(([k, v]) => (
                              <div className="detail-row" key={k}>
                                <div className="detail-label">{k}</div>
                                <div className="detail-val">{v}</div>
                              </div>
                            ))}
                          </div>
                          <div style={{ marginTop: 12 }}>
                            <div className="detail-label" style={{ marginBottom: 4 }}>Full JSON Record</div>
                            <div className="json-view">{JSON.stringify(e, null, 2)}</div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function Mint() {
    return (
      <div>
        <div className="page-header">
          <h2>Mint Entry</h2>
          <p>Create a new immutable ledger block anchored to your authority framework</p>
        </div>
        {mintStatus && (
          <div className={`alert ${mintStatus.ok ? "alert-green" : "alert-red"}`} style={{ marginBottom: 16 }}>
            {loading && <div className="spinner" />}
            {mintStatus.msg}
            {mintStatus.id && <span style={{ marginLeft: 8, fontSize: 10, opacity: 0.7 }}>ID: {mintStatus.id}</span>}
          </div>
        )}
        <div className="grid2">
          <div className="card">
            <div className="section-title">Entry Details</div>
            <form onSubmit={handleMint}>
              <div className="form-row">
                <div className="fld">
                  <label>Action Token</label>
                  <select value={mintForm.action_token} onChange={e => handleMintChange("action_token", e.target.value)}>
                    {Object.entries(ACTION_TOKENS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div className="fld">
                  <label>Stratum</label>
                  <select value={mintForm.stratum} onChange={e => handleMintChange("stratum", e.target.value)}>
                    {STRATA.map(s => <option key={s.code} value={s.code}>{s.short} — {s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row single">
                <div className="fld">
                  <label>Asset / Subject Label</label>
                  <input value={mintForm.asset_label} onChange={e => handleMintChange("asset_label", e.target.value)} placeholder="e.g. Certificate of Provenance — Document 001" />
                </div>
              </div>
              <div className="form-row">
                <div className="fld">
                  <label>Asset Type</label>
                  <select value={mintForm.asset_type} onChange={e => handleMintChange("asset_type", e.target.value)}>
                    {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="fld">
                  <label>Jurisdiction</label>
                  <select value={mintForm.jurisdiction} onChange={e => handleMintChange("jurisdiction", e.target.value)}>
                    {["ON-CHAIN", "WA-KING-COUNTY", "US-FEDERAL", "BIOLOGICAL", "INTERNATIONAL", "INTL"].map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="fld">
                  <label>Issuer</label>
                  <input value={mintForm.issuer} onChange={e => handleMintChange("issuer", e.target.value)} placeholder="Fiducia Centrale" />
                </div>
                <div className="fld">
                  <label>To / Recipient</label>
                  <input value={mintForm.to} onChange={e => handleMintChange("to", e.target.value)} placeholder="e.g. Shane Jonathan Lozenich" />
                </div>
              </div>
              {(mintForm.action_token === "MINT_FDC" || mintForm.action_token === "TRANSFER_FDC" || mintForm.action_token === "REDEEM_FDC") && (
                <div className="form-row">
                  <div className="fld">
                    <label>Instrument Unit</label>
                    <input value={mintForm.instrument_unit} onChange={e => handleMintChange("instrument_unit", e.target.value)} placeholder="FDC" />
                  </div>
                  <div className="fld">
                    <label>Amount</label>
                    <input type="number" value={mintForm.instrument_amount} onChange={e => handleMintChange("instrument_amount", e.target.value)} placeholder="0" />
                  </div>
                </div>
              )}
              <div className="form-row single">
                <div className="fld">
                  <label>Reason / Purpose</label>
                  <input value={mintForm.reason} onChange={e => handleMintChange("reason", e.target.value)} placeholder="Why is this action being taken?" />
                </div>
              </div>
              <div className="form-row single">
                <div className="fld">
                  <label>Notes</label>
                  <textarea value={mintForm.notes} onChange={e => handleMintChange("notes", e.target.value)} rows={2} placeholder="Optional notes for this entry" style={{ resize: "vertical" }} />
                </div>
              </div>
              <div className="form-row single">
                <div className="fld">
                  <label>Tags (comma separated)</label>
                  <input value={mintForm.tags} onChange={e => handleMintChange("tags", e.target.value)} placeholder="identity, legal, stratum01" />
                </div>
              </div>
              <div className="sep" />
              <div className="form-row three">
                <div className="fld">
                  <label>Stratum (auto)</label>
                  <input value={mintForm.stratum} readOnly style={{ opacity: 0.6 }} />
                </div>
                <div className="fld">
                  <label>Financial Tier (1–8)</label>
                  <input type="number" min={1} max={8} value={mintForm.tier} onChange={e => handleMintChange("tier", e.target.value)} />
                </div>
                <div className="fld">
                  <label>Security Level (1–8)</label>
                  <input type="number" min={1} max={8} value={mintForm.level} onChange={e => handleMintChange("level", e.target.value)} />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
                {loading ? "Minting…" : "⬡  Mint Entry to Ledger"}
              </button>
            </form>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="section-title">Authority Reference</div>
              {STRATA.map(s => (
                <div key={s.code} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #1a1f2e", alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 20, background: s.color + "22", border: `1px solid ${s.color}44`, borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: s.color, flexShrink: 0 }}>{s.short}</div>
                  <div>
                    <div style={{ fontSize: 11, color: "#c8ccd4" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#6b7280" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="section-title">Quick Actions</div>
              {[
                { label: "Register Identity Document", token: "REGISTER_IDENTITY", desc: "Anchor a DNA, lineage, or identity record" },
                { label: "Mint FDC Currency", token: "MINT_FDC", desc: "Issue Fiducial Credits (reduces GDRI)" },
                { label: "Register Legal Document", token: "REGISTER_DOC", desc: "Add a court filing or legal document" },
                { label: "Issue Certificate", token: "ATTEST_DOC", desc: "Create a provenance attestation" },
              ].map(qa => (
                <button key={qa.token} className="btn btn-secondary" style={{ width: "100%", textAlign: "left", marginBottom: 8, display: "block", padding: "10px 14px" }} onClick={() => { handleMintChange("action_token", qa.token); setTab("mint"); }}>
                  <div style={{ fontSize: 11, color: "#e2e8f0", marginBottom: 2 }}>{qa.label}</div>
                  <div style={{ fontSize: 10, color: "#6b7280", textTransform: "none", letterSpacing: 0 }}>{qa.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Certificates() {
    const entry = certEntry || ledger[0];
    if (!entry) return <div className="empty-state"><div className="empty-icon">◈</div>No entries to certify.</div>;
    const s = STRATA.find(x => x.code === entry.authority?.stratum);
    const certHash = "0x" + hashSimulate(entry.id + entry.timestamp + (entry.legal?.doc_hash || ""));
    return (
      <div>
        <div className="page-header">
          <h2>Certificate Generator</h2>
          <p>Stratum 05 — Certificatory Authority</p>
        </div>
        <div className="grid2">
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="section-title">Select Entry to Certify</div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {ledger.map(e => (
                  <div key={e.id} onClick={() => setCertEntry(e)} style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer", background: certEntry?.id === e.id ? "#1a1f2e" : "transparent", marginBottom: 4, transition: "background 0.15s" }}>
                    <div style={{ fontSize: 11, color: "#c8ccd4", marginBottom: 2 }}>{e.asset?.label || e.id}</div>
                    <div style={{ fontSize: 9, color: "#4b5563" }}>{e.action?.token} · {timeSince(e.timestamp)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cert-box">
            <div className="cert-watermark">FIDUCIA CENTRALE</div>
            <div className="cert-seal">
              <span style={{ fontSize: 20, color: "#818cf8" }}>◈</span>
            </div>
            <div className="cert-subtitle">Stratigraphic Provenance Certificate</div>
            <div className="cert-title">{entry.asset?.label || "Untitled Entry"}</div>
            <div className="cert-body">
              This certificate attests, under the authority of Fiducia Centrale's Certificatory layer (Stratum 05),
              that the entry identified below has been recorded in the immutable provenance ledger and is
              cryptographically sealed. The integrity of this record cannot be altered without detection.
            </div>
            {[
              ["Entry ID", entry.id],
              ["Action", entry.action?.token],
              ["Stratum", entry.authority?.stratum],
              ["Financial Tier", "Tier " + entry.authority?.tier],
              ["Security Level", "Level " + entry.authority?.level],
              ["Issuing Authority", entry.parties?.issuer],
              ["Jurisdiction", entry.legal?.jurisdiction],
              ["Issued", new Date(entry.timestamp).toLocaleString()],
              ["Source Hash", truncHash(entry.legal?.doc_hash)],
            ].map(([k, v]) => (
              <div className="cert-field" key={k}>
                <span style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>{k}</span>
                <span style={{ fontSize: 11, color: "#c8ccd4", textAlign: "right" }}>{v || "—"}</span>
              </div>
            ))}
            <div className="cert-hash">
              <div style={{ fontSize: 9, color: "#4b5563", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Certificate Hash (SHA-256 Simulated)</div>
              <div style={{ color: "#818cf8", wordBreak: "break-all" }}>{certHash}</div>
            </div>
            <div style={{ marginTop: 20, display: "flex", gap: 8 }}>
              <button className="btn btn-green btn-sm" onClick={() => {
                const text = `FIDUCIA CENTRALE — CERTIFICATE OF PROVENANCE\n\nEntry: ${entry.asset?.label}\nID: ${entry.id}\nAction: ${entry.action?.token}\nStratum: ${entry.authority?.stratum}\nTier: ${entry.authority?.tier} | Level: ${entry.authority?.level}\nIssuer: ${entry.parties?.issuer}\nJurisdiction: ${entry.legal?.jurisdiction}\nDate: ${new Date(entry.timestamp).toLocaleString()}\nSource Hash: ${entry.legal?.doc_hash}\nCert Hash: ${certHash}`;
                navigator.clipboard?.writeText(text).catch(() => {});
              }}>Copy Certificate</button>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                const s = STRATA.find(x => x.code === entry.authority?.stratum);
                alert(`Certificate for: ${entry.asset?.label}\nCert Hash: ${certHash}\n\nThis is a locally-generated certificate. To anchor it on-chain, connect your Vercel API and call /api/mint with action_token: ATTEST_DOC.`);
              }}>Anchor On-Chain</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function Connect() {
    return (
      <div>
        <div className="page-header">
          <h2>Backend Connection</h2>
          <p>Connect your Vercel Next.js instance or local FastAPI backend</p>
        </div>
        <div className="grid2">
          <div className="card">
            <div className="section-title">API Status</div>
            <div className={`alert ${apiStatus === "online" ? "alert-green" : "alert-blue"}`} style={{ marginBottom: 16 }}>
              {apiStatus === "online" ? "✓ Vercel API is reachable" : "◎ Running in local mode — all data stored in browser"}
            </div>
            <div className="fld" style={{ marginBottom: 12 }}>
              <label>Vercel API Base URL</label>
              <input defaultValue={API_BASE} readOnly style={{ opacity: 0.7 }} />
            </div>
            <div className="fld" style={{ marginBottom: 12 }}>
              <label>FIDUCIA_SYS_TOKEN (paste your token)</label>
              <input type="password" placeholder="paste token here — not stored" id="token-input" />
            </div>
            <button className="btn btn-primary" onClick={async () => {
              const tok = document.getElementById("token-input")?.value;
              if (!tok) { alert("Enter your token first"); return; }
              try {
                const r = await fetch(`${API_BASE}/api/ledger`, { headers: { "X-Fiducia-Token": tok }, signal: AbortSignal.timeout(5000) });
                if (r.ok) { setApiStatus("online"); alert("Connected successfully!"); } else { alert("API error: " + r.status); }
              } catch { alert("Could not reach API. Check your Vercel deployment."); }
            }}>Test Connection</button>

            <div className="sep" />
            <div className="section-title">Local Data Management</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => {
                const blob = new Blob([JSON.stringify(ledger, null, 2)], { type: "application/json" });
                const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "fiducia_ledger_export.json"; a.click();
              }}>Export Ledger JSON</button>
              <button className="btn btn-secondary btn-sm" onClick={handleLoadRemote} disabled={loading}>⟳ Pull from Vercel</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { if (confirm("Clear all local entries?")) { setLedger([]); saveLocalLedger([]); }}}>Clear Local</button>
            </div>
          </div>

          <div className="card">
            <div className="section-title">FastAPI Backend Routes Needed</div>
            {[
              { method: "GET", path: "/api/ledger", desc: "Returns full ledger as JSON array" },
              { method: "POST", path: "/api/mint", desc: "Accepts a new ledger entry (requires X-Fiducia-Token header)" },
              { method: "GET", path: "/api/strata", desc: "Returns strata definitions" },
              { method: "GET", path: "/api/balance/:id", desc: "Returns FDC balance for a subject" },
              { method: "GET", path: "/api/certificate/:id", desc: "Returns certificate for an entry" },
            ].map(r => (
              <div key={r.path} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #1a1f2e", fontSize: 11 }}>
                <span className={`badge ${r.method === "GET" ? "badge-green" : "badge-purple"}`} style={{ fontSize: 9, flexShrink: 0 }}>{r.method}</span>
                <div>
                  <div style={{ color: "#818cf8", fontFamily: "monospace", marginBottom: 2 }}>{r.path}</div>
                  <div style={{ color: "#6b7280", fontSize: 10 }}>{r.desc}</div>
                </div>
              </div>
            ))}
            <div className="sep" />
            <div className="section-title">Vercel Filesystem Fix</div>
            <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.7 }}>
              Vercel's runtime filesystem is <span style={{ color: "#f87171" }}>read-only</span>. Your JSON ledger file cannot be written at runtime. Replace with one of:
              <ul style={{ marginTop: 8, paddingLeft: 16, display: "flex", flexDirection: "column", gap: 4 }}>
                <li><span className="badge badge-green" style={{ fontSize: 9 }}>recommended</span> Upstash Redis (already configured in your .env)</li>
                <li>Vercel Postgres / Neon DB</li>
                <li>Supabase (free tier, Postgres)</li>
                <li>PlanetScale / Turso</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">PostgreSQL Bootstrap (copy to your DB)</div>
          <div className="json-view">{`-- Authority Strata (01-08)
INSERT INTO authority_strata (code, name, description) VALUES
('01-Inherent', 'Inherent Identity Authority', 'DNA, lineage, biological identity'),
('02-Constitutional', 'Constitutional Authority', 'Charters, constitutions, covenants'),
('03-Statutory', 'Statutory Authority', 'Rules, policies, compliance'),
('04-Administrative', 'Administrative Authority', 'Execution, enforcement, ops'),
('05-Certificatory', 'Certificatory Authority', 'Attestations, notarizations'),
('06-Provenance', 'Provenance Authority', 'Chain of title, records'),
('07-Hereditary', 'Hereditary / Majorat Authority', 'Lineage-based, heir authority'),
('08-Procedural', 'Procedural Legal Authority', 'Court filings, legal actions');

-- Financial Tiers (1-8)
INSERT INTO financial_tiers (tier, name) VALUES
(1,'Basic Participant'),(2,'Verified Identity'),(3,'Transactional Authority'),
(4,'Custodial Authority'),(5,'Institutional Operator'),(6,'Policy Actor'),
(7,'Constitutional Monetary Authority'),(8,'Sovereign Monetary Authority');

-- Security Levels (1-8)
INSERT INTO security_levels (level, name) VALUES
(1,'Public Profile'),(2,'Basic Privacy'),(3,'Sensitive Personal Data'),
(4,'Elevated Sensitivity'),(5,'Documented Exposure'),(6,'High-Risk Classification'),
(7,'Protected Status'),(8,'Heir-Level / Sovereign Protection');`}</div>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: "overview", label: "Overview" },
    { id: "ledger", label: "Ledger S06" },
    { id: "mint", label: "Mint S07" },
    { id: "certificates", label: "Certs S05" },
    { id: "connect", label: "Connect" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <header className="hdr">
          <div className="hdr-left">
            <div className="pulse" />
            <div>
              <div className="logo">Fiducia <span>Centrale</span></div>
              <div className="sub">Stratigraphic Provenance Engine</div>
            </div>
          </div>
          <div className="tabs">
            {TABS.map(t => <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>)}
          </div>
        </header>
        <div className="content">
          {tab === "overview" && <Overview />}
          {tab === "ledger" && <Ledger />}
          {tab === "mint" && <Mint />}
          {tab === "certificates" && <Certificates />}
          {tab === "connect" && <Connect />}
        </div>
      </div>
    </>
  );
}