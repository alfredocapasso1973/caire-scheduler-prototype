import { NextResponse } from "next/server";
/*
  Proxy for submitting a route-plan solve request to Timefold.
  Sends the input JSON to /route-plans and returns the solver job metadata/ID.
  Keeps API key on the server.
*/
const base = process.env.TIMEFOLD_API_BASE as string;
const key = process.env.TIMEFOLD_API_KEY as string;

export async function POST(req: Request) {
  const body = await req.json();
  const res = await fetch(`${base}/route-plans`, {
    method: "POST",
    headers: {
      "X-API-KEY": key,
      accept: "application/json",
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
