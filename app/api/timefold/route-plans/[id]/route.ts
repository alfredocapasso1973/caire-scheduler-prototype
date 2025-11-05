import { NextResponse } from "next/server";
/*
  Proxy to fetch the current status/solution for a specific Timefold route-plan job.
  Called repeatedly (polling) until the solver finishes.
  API key stays server-side and caching is disabled.
*/
const base = process.env.TIMEFOLD_API_BASE as string;
const key = process.env.TIMEFOLD_API_KEY as string;

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const res = await fetch(`${base}/route-plans/${params.id}`, {
    headers: { "X-API-KEY": key, accept: "application/json" },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
