import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {

  const body = await request.json()
  const { companyId, name, title, department, email, phone, linkedin, source, score, notes } = body

  if (!companyId || !name || !title) {
    return NextResponse.json(
      { error: "companyId, name, and title are required" },
      { status: 400 }
    )
  }

  const contact = await prisma.contact.create({
    data: {
      companyId,
      name,
      title,
      department,
      email,
      phone,
      linkedin,
      source: source || 'Manual',
      score: score || 3,
      notes,
      verifiedAt: email ? new Date() : null
    }
  })

  // Log audit
  const userId = "demo-user"
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CREATE',
      resource: 'Contact',
      resourceId: contact.id,
      changes: JSON.stringify({ created: contact })
    }
  })

  return NextResponse.json({ contact }, { status: 201 })
}

