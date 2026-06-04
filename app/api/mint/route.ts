import { NextRequest, NextResponse } from "next/server";

const ENGINE_URL = process.env.ENGINE_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${ENGINE_URL}/mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
