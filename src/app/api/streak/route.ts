import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const KEY = "leetcode-streak";

export async function GET() {
  const days: string[] = (await kv.get(KEY)) ?? [];
  return NextResponse.json({ days });
}

export async function POST(request: NextRequest) {
  const { day, action } = await request.json();

  if (!day || typeof day !== "string") {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  const days: string[] = (await kv.get(KEY)) ?? [];
  const set = new Set(days);

  if (action === "remove") {
    set.delete(day);
  } else {
    set.add(day);
  }

  const sorted = [...set].sort();
  await kv.set(KEY, sorted);

  return NextResponse.json({ days: sorted });
}
