import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Mock auth para demo
  const params = await context.params

  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      stacks: {
        orderBy: { confidence: 'desc' }
      },
      contacts: {
        orderBy: { score: 'desc' }
      },
      benchmarks: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  return NextResponse.json({ company })
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  const body = await request.json()
  const { name, cnpj, domain, cnae, industry, size, location, financial } = body

  const existingCompany = await prisma.company.findUnique({
    where: { id: params.id }
  })

  if (!existingCompany) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  const company = await prisma.company.update({
    where: { id: params.id },
    data: {
      name,
      cnpj,
      domain,
      cnae,
      industry,
      size,
      location: location ? JSON.stringify(location) : null,
      financial: financial ? JSON.stringify(financial) : null
    }
  })

  // Log audit
  const userId = "demo-user"
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'UPDATE',
      resource: 'Company',
      resourceId: company.id,
      changes: JSON.stringify({ before: existingCompany, after: company })
    }
  })

  return NextResponse.json({ company })
}

