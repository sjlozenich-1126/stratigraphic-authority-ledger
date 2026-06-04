import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "provenance_ledger.json");
    const data = await fs.readFile(filePath, "utf-8");
    const entries = JSON.parse(data);

    return NextResponse.json(entries);
  } catch (err) {
    return NextResponse.json(
      { error: "Could not read ledger" },
      { status: 500 }
    );
  }
}
