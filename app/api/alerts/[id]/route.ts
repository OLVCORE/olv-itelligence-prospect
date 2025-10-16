import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // Demo: sem autenticação por enquanto
  const params = await context.params

  const body = await request.json()
  const { status } = body

  if (!status) {
    return NextResponse.json(
      { error: "status is required" },
      { status: 400 }
    )
  }

  const alert = await prisma.alert.update({
    where: { id: params.id },
    data: {
      status,
      resolvedAt: status === 'resolved' ? new Date() : null
    }
  })

  return NextResponse.json({ alert })
}

