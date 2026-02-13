import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
    const response = NextResponse.json({ success: true });
    
    // On crée un cookie sécurisé qui expire après 24h
    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true, // Le JavaScript du navigateur ne peut pas lire ce cookie (anti-XSS)
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 heures
      path: "/",
    });

    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}