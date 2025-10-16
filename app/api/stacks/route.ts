import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { companyId, category, product, vendor, status, confidence, evidence, source } = body

  if (!companyId || !category || !product) {
    return NextResponse.json(
      { error: "companyId, category, and product are required" },
      { status: 400 }
    )
  }

  const stack = await prisma.techStack.create({
    data: {
      companyId,
      category,
      product,
      vendor,
      status: status || 'Indeterminado',
      confidence: confidence || 0,
      evidence: evidence ? JSON.stringify(evidence) : "{}",
      source,
      validatedAt: status === 'Confirmado' ? new Date() : null
    }
  })

  // Log audit
  const userId = "demo-user"
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'CREATE',
      resource: 'TechStack',
      resourceId: stack.id,
      changes: JSON.stringify({ created: stack })
    }
  })

  return NextResponse.json({ stack }, { status: 201 })
}

