import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import {
  calculateMaturityScore,
  calculatePropensity,
  calculatePriority
} from "@/lib/enrichment"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { companyId } = body

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 }
    )
  }

  // Get company with relations
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      stacks: true,
      contacts: true,
      benchmarks: true
    }
  })

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  // Calculate scores
  const maturityScore = calculateMaturityScore(company.stacks)
  const propensity = calculatePropensity({
    ...company,
    maturityScore,
    contacts: company.contacts,
    stacks: company.stacks
  })
  const priority = calculatePriority({
    ...company,
    maturityScore,
    financial: company.financial
  })

  // Update company with scores
  await prisma.company.update({
    where: { id: companyId },
    data: {
      financial: {
        ...(company.financial as any || {}),
        maturityScore,
        propensity,
        priority
      }
    }
  })

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: (session.user as any).id,
      action: 'SCORING',
      resource: 'Company',
      resourceId: companyId,
      changes: { maturityScore, propensity, priority }
    }
  })

  return NextResponse.json({
    success: true,
    companyId,
    scores: {
      maturityScore,
      propensity,
      priority
    }
  })
}

