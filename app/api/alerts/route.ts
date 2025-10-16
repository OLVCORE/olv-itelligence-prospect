import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  // Demo: sem autenticação por enquanto

  const searchParams = request.nextUrl.searchParams
  const projectId = searchParams.get("projectId")
  const status = searchParams.get("status")

  const where: any = {}
  if (projectId) where.projectId = projectId
  if (status) where.status = status

  const alerts = await prisma.alert.findMany({
    where,
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'desc' }
    ],
    take: 50
  })

  return NextResponse.json({ alerts })
}

export async function POST(request: NextRequest) {
  // Demo: sem autenticação por enquanto

  const body = await request.json()
  const { projectId, type, title, description, priority, metadata, dueAt } = body

  if (!projectId || !type || !title || !description) {
    return NextResponse.json(
      { error: "projectId, type, title, and description are required" },
      { status: 400 }
    )
  }

  const alert = await prisma.alert.create({
    data: {
      projectId,
      type,
      title,
      description,
      priority: priority || 'medium',
      metadata,
      dueAt: dueAt ? new Date(dueAt) : null
    }
  })

  return NextResponse.json({ alert }, { status: 201 })
}

