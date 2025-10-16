import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Mock auth para demo

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      companies: {
        include: {
          stacks: true,
          contacts: true,
          _count: {
            select: {
              stacks: true,
              contacts: true
            }
          }
        }
      },
      canvases: true,
      reports: {
        take: 10,
        orderBy: { createdAt: 'desc' }
      },
      alerts: {
        where: { status: 'pending' },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  return NextResponse.json({ project })
}

