import { NextResponse } from "next/server";
import { predict } from "@/lib/model";

export const runtime = "nodejs";
const MAX_CHARS = 500;

export async function POST(req: Request) {
  let text: unknown;
  try {
    ({ text } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof text !== "string") return NextResponse.json({ error: "text must be a string" }, { status: 400 });
  const t0 = performance.now();
  const result = predict(text.slice(0, MAX_CHARS));
  return NextResponse.json({ ...result, ms: Math.round((performance.now() - t0) * 10) / 10 });
}
