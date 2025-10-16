import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { 
  enrichCadastral, 
  enrichDomain, 
  enrichTechStack, 
  enrichDNS,
  enrichContacts,
  calculateConfidence
} from "@/lib/enrichment"

export async function POST(request: NextRequest) {
  // Demo: sem autenticação por enquanto

  const body = await request.json()
  const { companyId, type } = body

  if (!companyId) {
    return NextResponse.json(
      { error: "companyId is required" },
      { status: 400 }
    )
  }

  // Get company
  const company = await prisma.company.findUnique({
    where: { id: companyId }
  })

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  const results: any = {}

  try {
    // Enrich based on type or run all
    if (!type || type === 'cadastral') {
      if (company.cnpj) {
        const cadastralResult = await enrichCadastral(company.cnpj)
        results.cadastral = cadastralResult
        
        if (cadastralResult.success && cadastralResult.data) {
          // Update company with cadastral data
          await prisma.company.update({
            where: { id: companyId },
            data: {
              industry: cadastralResult.data.cnae || company.industry,
              size: cadastralResult.data.porte || company.size,
              location: cadastralResult.data.endereco || company.location
            }
          })
        }
      }
    }

    if (!type || type === 'domain') {
      if (company.domain) {
        const domainResult = await enrichDomain(company.domain)
        results.domain = domainResult
      }
    }

    if (!type || type === 'stack') {
      if (company.domain) {
        const stackResult = await enrichTechStack(company.domain)
        results.stack = stackResult
        
        if (stackResult.success && Array.isArray(stackResult.data)) {
          // Save detected stacks
          for (const tech of stackResult.data) {
            await prisma.techStack.create({
              data: {
                companyId,
                category: tech.category,
                product: tech.product,
                vendor: tech.vendor,
                status: tech.status,
                confidence: tech.confidence,
                evidence: tech.evidence,
                source: 'HTTP Headers',
                validatedAt: new Date()
              }
            })
          }
        }
      }
    }

    if (!type || type === 'dns') {
      if (company.domain) {
        const dnsResult = await enrichDNS(company.domain)
        results.dns = dnsResult
      }
    }

    if (!type || type === 'contacts') {
      if (company.domain) {
        const contactsResult = await enrichContacts(company.domain)
        results.contacts = contactsResult
        
        if (contactsResult.success && Array.isArray(contactsResult.data)) {
          // Save contacts
          for (const contact of contactsResult.data) {
            await prisma.contact.create({
              data: {
                companyId,
                name: contact.name,
                title: contact.title,
                department: contact.department,
                email: contact.email,
                linkedin: contact.linkedin,
                source: 'Apollo.io',
                score: contact.score,
                verifiedAt: new Date()
              }
            })
          }
        }
      }
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'ENRICHMENT',
        resource: 'Company',
        resourceId: companyId,
        changes: { type, results }
      }
    })

    return NextResponse.json({ 
      success: true, 
      companyId,
      results 
    })

  } catch (error) {
    console.error('Enrichment error:', error)
    return NextResponse.json(
      { error: "Enrichment failed", details: (error as Error).message },
      { status: 500 }
    )
  }
}

