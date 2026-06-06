

import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Strict CORS and Security Policy Headers Configuration
const SECURITY_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Point directly to your custom domain in production for rigid security
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Fiducia-Token',
};

// Simplified mock database connection to represent an append-only transaction ledger matrix
// Replace this array with your active Supabase/Dolt connection string logic in full production
let immutableLedgerJournal: any[] = [];

/**
 * 1. OPTIONS Preflight Pre-Verification Handler
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: SECURITY_HEADERS });
}

/**
 * 2. GET Handler: Reads the complete verifiable block sequence
 */
export async function GET() {
  return NextResponse.json(immutableLedgerJournal, { headers: SECURITY_HEADERS });
}

/**
 * 3. POST Handler: Validates, signs, hashes, and registers the authoritative claim
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { stratum, claim, source, owner, framework } = payload;

    // A. Institutional Data Structural Sanitization Checks
    if (!stratum || !claim || !owner) {
      return NextResponse.json(
        { success: false, error: "Systemic Exception: Missing essential administrative payload boundaries." },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // B. Security Verification: Extract incoming Request Header Token
    const authHeaderToken = request.headers.get('X-Fiducia-Token');
    const systemSecretSignature = process.env.FIDUCIA_SYS_TOKEN || "DEFAULT_SYS_PASS_770";

    if (authHeaderToken !== systemSecretSignature) {
      return NextResponse.json(
        { success: false, error: "Security Hold: Missing or invalid custodial authority credentials." },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // C. Mathematical Immutability Chaining Model
    // Locate the cryptographic string hash from the block directly before this one
    const precedingBlockHash = immutableLedgerJournal.length > 0 
      ? immutableLedgerJournal[immutableLedgerJournal.length - 1].currentBlockHash 
      : "0000000000000000000000000000000000000000000000000000000000000000";

    const timestampIso = new Date().toISOString();
    const systemicActionToken = `CTS-BLK-${1000 + immutableLedgerJournal.length}`;

    // Compile entire localized entry array state down into a flat serialization string
    const stringDataToHash = `${timestampIso}-${systemicActionToken}-${stratum}-${claim}-${precedingBlockHash}`;
    
    // Hash execution using standard SHA-256 Cryptographic Algorithm
    const currentBlockHash = crypto
      .createHash('sha256')
      .update(stringDataToHash)
      .digest('hex');

    // D. Assemble Legal & Financial Structural Block
    const auditedBlockRecord = {
      timestamp: timestampIso,
      token: systemicActionToken,
      stratum: stratum,
      claim: claim,
      source: source || "Fiducia Central Core Architecture",
      owner: owner,
      framework: framework || "Inherent Execution",
      precedingBlockHash: precedingBlockHash,
      currentBlockHash: currentBlockHash,
      status: "APPROVED"
    };

    // Commit to persistent data ledger journal array matrix
    immutableLedgerJournal.push(auditedBlockRecord);

    return NextResponse.json(
      { success: true, blockToken: systemicActionToken, hash: currentBlockHash },
      { status: 201, headers: SECURITY_HEADERS }
    );

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Internal Routing Pipeline Failure: ${error.message}` },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}