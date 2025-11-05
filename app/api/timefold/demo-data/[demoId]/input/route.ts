import { NextResponse } from "next/server";
/*
  Proxy to retrieve demo input data for a given demoId from Timefold.
  Keeps API key server-side and disables caching to always fetch fresh data.
*/
const base = process.env.TIMEFOLD_API_BASE as string;
const key = process.env.TIMEFOLD_API_KEY as string;

export async function GET(_: Request, ctx: { params: Promise<{ demoId: string }> }) {
  const params = await ctx.params;
  const res = await fetch(`${base}/demo-data/${params.demoId}/input`, {
    headers: { "X-API-KEY": key, accept: "application/json" },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
