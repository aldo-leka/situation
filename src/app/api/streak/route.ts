import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

const KEY = "leetcode-streak";

export async function GET() {
  const days: string[] = (await redis.get(KEY)) ?? [];
  return NextResponse.json({ days });
}

export async function POST(request: NextRequest) {
  const { day, action } = await request.json();

  if (!day || typeof day !== "string") {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  const days: string[] = (await redis.get(KEY)) ?? [];
  const set = new Set(days);

  if (action === "remove") {
    set.delete(day);
  } else {
    set.add(day);
  }

  const sorted = [...set].sort();
  await redis.set(KEY, sorted);

  return NextResponse.json({ days: sorted });
}
