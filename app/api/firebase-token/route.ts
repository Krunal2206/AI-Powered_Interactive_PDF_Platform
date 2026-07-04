import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const firebaseToken = await adminAuth.createCustomToken(userId);
    return NextResponse.json({ firebaseToken });
  } catch (error) {
    console.error("Failed to create Firebase token:", error);
    return NextResponse.json(
      { error: "Failed to create Firebase token" },
      { status: 500 },
    );
  }
}
