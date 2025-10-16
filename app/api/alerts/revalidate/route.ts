import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  // Demo: sem autenticação por enquanto

  const body = await request.json()
  const { projectId, companyId, type } = body

  if (!projectId) {
    return NextResponse.json(
      { error: "projectId is required" },
      { status: 400 }
    )
  }

  // Create revalidation alert
  const alert = await prisma.alert.create({
    data: {
      projectId,
      type: type || 'revalidation',
      title: 'Revalidação agendada',
      description: companyId 
        ? 'Revalidação de dados da empresa agendada' 
        : 'Revalidação de dados do projeto agendada',
      priority: 'medium',
      metadata: JSON.stringify({
        companyId,
        scheduledBy: 'demo-user' // Mock auth
      }),
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
  })

  return NextResponse.json({ alert }, { status: 201 })
}

