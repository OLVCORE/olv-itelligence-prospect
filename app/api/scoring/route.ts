import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  calculateMaturityScore,
  calculatePropensity,
  calculatePriority
} from "@/lib/enrichment"

export const runtime = 'nodejs'
export const maxDuration = 15 // Scoring calculations with DB queries: 15s

export async function POST(request: NextRequest) {
  // Demo: sem autenticação por enquanto

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

  // Log audit (TODO: Re-enable when auth is active)
  // await prisma.auditLog.create({
  //   data: {
  //     userId: 'system', // Demo mode
  //     action: 'SCORING',
  //     resource: 'Company',
  //     resourceId: companyId,
  //     changes: { maturityScore, propensity, priority }
  //   }
  // })

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

