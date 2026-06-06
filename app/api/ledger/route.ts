import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

// Strict CORS Policy Headers Configuration
const SECURITY_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Points directly to your custom domain in production
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Fiducia-Token',
};

// Initialize Upstash Redis directly from your pulled Vercel Environment Variables
const redis = Redis.fromEnv();

// Database Key Namespace identifier for your immutable ledger chain stream
const DB_LEDGER_KEY = 'fiducia_central_ledger_stream';

/**
 * 1. OPTIONS Preflight Pre-Verification Handler
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: SECURITY_HEADERS });
}

/**
 * 2. GET Handler: Reads the complete verifiable block sequence from Cloud Database
 */
export async function GET() {
  try {
    // Retrieve the complete array transaction log sequence from Upstash Redis storage
    const storedLedger = await redis.get<any[]>(DB_LEDGER_KEY);
    const databaseJournal = storedLedger || [];
    
    return NextResponse.json(databaseJournal, { headers: SECURITY_HEADERS });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: `Database Read Error: ${error.message}` },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

/**
 * 3. POST Handler: Validates, signs, hashes, and registers claims to Cloud Database
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

    // B. Security Verification: Validate incoming Request Header Token
    const authHeaderToken = request.headers.get('X-Fiducia-Token');
    const systemSecretSignature = process.env.FIDUCIA_SYS_TOKEN || "DEFAULT_SYS_PASS_770";

    if (authHeaderToken !== systemSecretSignature) {
      return NextResponse.json(
        { success: false, error: "Security Hold: Missing or invalid custodial authority credentials." },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    // Pull current transaction journal from Upstash Redis database to compute chaining links
    const storedLedger = await redis.get<any[]>(DB_LEDGER_KEY);
    const databaseJournal = storedLedger || [];

    // C. Mathematical Immutability Chaining Model
    const precedingBlockHash = databaseJournal.length > 0 
      ? databaseJournal[databaseJournal.length - 1].currentBlockHash 
      : "0000000000000000000000000000000000000000000000000000000000000000";

    const timestampIso = new Date().toISOString();
    const systemicActionToken = `CTS-BLK-${1000 + databaseJournal.length}`;

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

    // Append the newly minted block record to the existing cloud ledger array
    databaseJournal.push(auditedBlockRecord);

    // Commit the updated array back to permanent Upstash Redis Cloud storage
    await redis.set(DB_LEDGER_KEY, databaseJournal);

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