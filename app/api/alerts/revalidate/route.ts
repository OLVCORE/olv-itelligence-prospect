import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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
      metadata: {
        companyId,
        scheduledBy: (session.user as any).id
      },
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    }
  })

  return NextResponse.json({ alert }, { status: 201 })
}

