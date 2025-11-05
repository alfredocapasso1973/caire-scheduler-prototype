import { NextResponse } from "next/server";
/*
  Proxy to Timefold demo-data endpoint.
  Next.js route keeps API key server-side.
*/

const base = process.env.TIMEFOLD_API_BASE as string;
const key = process.env.TIMEFOLD_API_KEY as string;

export async function GET() {
  const res = await fetch(`${base}/demo-data`, {
    headers: { "X-API-KEY": key, accept: "application/json" },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
