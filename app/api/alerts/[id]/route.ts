import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

