import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const meta = JSON.parse(readFileSync(path.join(process.cwd(), "model", "meta.json"), "utf8"));
  return NextResponse.json({
    labels: meta.labels,
    groups: meta.groups,
    metrics: meta.metrics,
    nTerms: meta.n_terms,
  });
}
