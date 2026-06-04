import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "provenance_ledger.json");
    const data = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(data);
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: "Could not read ledger" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newEntry = await request.json();

    const filePath = path.join(process.cwd(), "provenance_ledger.json");
    const data = fs.readFileSync(filePath, "utf8");
    const ledger = JSON.parse(data);

    ledger.entries.push({
      ...newEntry,
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(filePath, JSON.stringify(ledger, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Could not write to ledger" }, { status: 500 });
  }
}

