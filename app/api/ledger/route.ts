import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const getLedgerPath = () => path.join(process.cwd(), 'public', 'audit_ledger.json');

// GET: Reads entries for the Stratum-06 Viewer
export async function GET() {
  try {
    const filePath = getLedgerPath();
    if (!fs.existsSync(filePath)) return NextResponse.json([]);
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const ledgerData = JSON.parse(fileContent || '[]');
    return NextResponse.json(ledgerData);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to read ledger: ' + error.message }, { status: 500 });
  }
}

// POST: Mints new entries from the Stratum-07 Form
export async function POST(request: Request) {
  try {
    const incomingData = await request.json();
    const filePath = getLedgerPath();
    
    let currentLedger = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      currentLedger = JSON.parse(fileContent || '[]');
    }
    
    // Construct a pristine stratigraphic block matching the build plan specification
    const formattedEntry = {
      stratum: incomingData.stratum || "01",
      source: incomingData.source || "Inherent / Ancestral Authority",
      owner: incomingData.owner || "Shane Jonathan Lozenich",
      concept: incomingData.concept || "Jonathan Shane Concepts",
      framework: incomingData.framework || "",
      claim: incomingData.claim || "",
      evidence: Array.isArray(incomingData.evidence) ? incomingData.evidence.filter((e: string) => e.trim() !== '') : [],
      timestamp: incomingData.timestamp || new Date().toISOString()
    };
    
    currentLedger.push(formattedEntry);
    fs.writeFileSync(filePath, JSON.stringify(currentLedger, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: "Entry successfully minted." });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

