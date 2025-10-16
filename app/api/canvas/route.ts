import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { projectId, name, structure, mode } = body

  if (!projectId || !name) {
    return NextResponse.json(
      { error: "projectId and name are required" },
      { status: 400 }
    )
  }

  const canvas = await prisma.canvas.create({
    data: {
      projectId,
      name,
      structure: structure ? JSON.stringify(structure) : JSON.stringify({ nodes: [], edges: [] }),
      mode: mode || 'canva'
    }
  })

  return NextResponse.json({ canvas }, { status: 201 })
}

