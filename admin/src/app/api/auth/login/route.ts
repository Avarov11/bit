import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createToken, COOKIE, MAX_AGE } from "@/lib/session";

export const dynamic = "force-dynamic";

const USERS: Record<string, { hash: string; role: "admin" | "readonly" }> = {
  Biteez: { hash: process.env.ADMIN_HASH  ?? "", role: "admin"    },
  Read:   { hash: process.env.READER_HASH ?? "", role: "readonly" },
};

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const user = USERS[username];
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const hash = createHash("sha256").update(password ?? "").digest("hex");
  if (hash !== user.hash) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

  const token = await createToken({ username, role: user.role });
  const res = NextResponse.json({ ok: true, role: user.role });
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   MAX_AGE,
    path:     "/",
  });
  return res;
}
