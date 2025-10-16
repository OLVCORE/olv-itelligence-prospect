import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  // Mock user para demo
  const userId = "demo-user"

  const organizations = await prisma.organizationMember.findMany({
    where: { userId },
    include: {
      organization: {
        include: {
          projects: {
            include: {
              _count: {
                select: {
                  companies: true,
                  canvases: true,
                  reports: true,
                  alerts: true
                }
              }
            }
          }
        }
      }
    }
  })

  const projects = organizations.flatMap(org => org.organization.projects)

  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, description, organizationId } = body

  if (!name || !organizationId) {
    return NextResponse.json(
      { error: "Name and organizationId are required" },
      { status: 400 }
    )
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      organizationId
    }
  })

  return NextResponse.json({ project }, { status: 201 })
}

