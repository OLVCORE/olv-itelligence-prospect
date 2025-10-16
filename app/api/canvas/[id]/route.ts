import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {

  const canvas = await prisma.canvas.findUnique({
    where: { id: params.id }
  })

  if (!canvas) {
    return NextResponse.json({ error: "Canvas not found" }, { status: 404 })
  }

  return NextResponse.json({ canvas })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json()
  const { name, structure, mode } = body

  const canvas = await prisma.canvas.update({
    where: { id: params.id },
    data: {
      name,
      structure: structure ? JSON.stringify(structure) : undefined,
      mode
    }
  })

  return NextResponse.json({ canvas })
}

