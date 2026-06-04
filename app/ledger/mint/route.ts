import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// This targets your exact ledger path in the public folder
const getLedgerPath = () => path.join(process.cwd(), 'public', 'audit_ledger.json');

// GET Handler: Reads the ledger data for your viewer interface
export async function GET() {
  try {
    const filePath = getLedgerPath();
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([]); // Returns a clean empty array if the file doesn't exist yet
    }
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const ledgerData = JSON.parse(fileContent || '[]');
    return NextResponse.json(ledgerData);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to read ledger: ' + error.message }, { status: 500 });
  }
}

// POST Handler: Receives form entries and writes them to the ledger file
export async function POST(request: Request) {
  try {
    const entryData = await request.json();
    const filePath = getLedgerPath();
    
    let currentLedger = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      currentLedger = JSON.parse(fileContent || '[]');
    }
    
    // Append the incoming entry block
    currentLedger.push(entryData);
    
    // Save to public/audit_ledger.json with crisp formatting
    fs.writeFileSync(filePath, JSON.stringify(currentLedger, null, 2), 'utf8');
    
    return NextResponse.json({ success: true, message: "Entry successfully committed to public/audit_ledger.json" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
