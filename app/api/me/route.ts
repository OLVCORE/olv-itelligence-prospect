import { NextResponse } from "next/server"

export async function GET() {
  // Mock user para demo
  const user = { 
    id: "demo-user",
    name: "Demo User", 
    email: "demo@olv.com",
    role: "ADMIN"
  }

  return NextResponse.json({ user })
}

