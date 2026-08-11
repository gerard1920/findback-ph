import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ data: null }, { status: 401 });
    }
    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        full_name: user.displayName,
        username: user.username,
        role: user.role,
        status: user.status,
      },
    });
  } catch {
    return NextResponse.json({ data: null }, { status: 500 });
  }
}
