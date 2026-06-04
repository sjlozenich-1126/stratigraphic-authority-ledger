import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    const filePath = path.join(process.cwd(), "provenance_ledger.json");
    const data = await fs.readFile(filePath, "utf-8");
    const ledger = JSON.parse(data);

    const entry = ledger.find((e: any) => e.id === id);

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const certificate = {
      certificate_title: "Certificate of Provenance",
      issued_at: new Date().toISOString(),
      entry_id: entry.id,
      document_name: entry.document_name,
      document_hash: entry.document_hash,
      action_token: entry.action_token,
      stratum: entry.stratum,
      case_number: entry.case_number || null,
      narrative_link: entry.narrative_link || null,
      timestamp: entry.timestamp,
      signature: entry.signature,
      signer: "Legal Provenance Engine — Stratum 06 Authority",
    };

    return NextResponse.json(certificate);
  } catch (err) {
    return NextResponse.json(
      { error: "Could not generate certificate" },
      { status: 500 }
    );
  }
}
