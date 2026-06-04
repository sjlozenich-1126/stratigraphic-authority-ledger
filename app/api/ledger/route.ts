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

