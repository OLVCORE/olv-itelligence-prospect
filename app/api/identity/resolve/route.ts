import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 20 // Identity resolution: 20s

interface ResolveRequest {
  personId?: string
  name: string
  company?: string
  role?: string
  linkedinUrl?: string
  email?: string
  phone?: string
}

/**
 * POST /api/identity/resolve
 * Identity Resolution - Descoberta e validação de perfis sociais
 * 
 * Fluxo:
 * 1. Recebe seed (nome, empresa, linkedin, etc)
 * 2. Gera candidatos (@username + heurísticas)
 * 3. Calcula Confidence Score (0.0 - 1.0)
 * 4. Persiste em Person + IdentityProfile
 * 5. Status: pending (< 0.60) | probable (0.60-0.85) | confirmed (≥ 0.85 com 2+ evidências)
 */
export async function POST(req: NextRequest) {
  try {
    const body: ResolveRequest = await req.json()
    const { personId, name, company, role, linkedinUrl, email, phone } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[Identity Resolve] 🔍 Iniciando resolução para:', { name, company, role })

    // 1. Criar ou atualizar Person
    let person
    if (personId) {
      // Atualizar pessoa existente
      const { data, error } = await supabaseAdmin
        .from('Person')
        .update({
          name,
          role,
          email,
          phone,
          linkedinUrl,
          updatedAt: new Date().toISOString()
        })
        .eq('id', personId)
        .select()
        .single()

      if (error) {
        console.error('[Identity Resolve] Erro ao atualizar pessoa:', error)
        return NextResponse.json({ error: 'Falha ao atualizar pessoa' }, { status: 500 })
      }
      person = data
    } else {
      // Criar nova pessoa
      const { data, error } = await supabaseAdmin
        .from('Person')
        .insert({
          name,
          role,
          email,
          phone,
          linkedinUrl,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('[Identity Resolve] Erro ao criar pessoa:', error)
        return NextResponse.json({ error: 'Falha ao criar pessoa' }, { status: 500 })
      }
      person = data
    }

    // 2. Gerar candidatos de perfis sociais (heurísticas básicas)
    const candidates = await generateSocialCandidates({ name, company, linkedinUrl })

    // 3. Para cada candidato, calcular confidence e criar IdentityProfile
    const profiles = []
    for (const candidate of candidates) {
      const confidence = calculateConfidence(candidate)
      const status = getStatus(confidence, candidate.evidenceCount)

      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('IdentityProfile')
        .upsert({
          personId: person.id,
          network: candidate.network,
          handle: candidate.handle,
          url: candidate.url,
          confidence,
          status,
          metadata: JSON.stringify(candidate.metadata),
          updatedAt: new Date().toISOString()
        }, {
          onConflict: 'personId,network,url'
        })
        .select()
        .single()

      if (!profileErr && profile) {
        profiles.push(profile)
        console.log(`[Identity Resolve] ✅ Perfil ${candidate.network}: ${status} (${(confidence * 100).toFixed(0)}%)`)
      }
    }

    return NextResponse.json({
      success: true,
      person,
      profiles,
      summary: {
        total: profiles.length,
        confirmed: profiles.filter(p => p.status === 'confirmed').length,
        probable: profiles.filter(p => p.status === 'probable').length,
        pending: profiles.filter(p => p.status === 'pending').length
      }
    })

  } catch (error) {
    console.error('[Identity Resolve] Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

/**
 * Gera candidatos de perfis sociais com base em heurísticas
 */
async function generateSocialCandidates(seed: {
  name: string
  company?: string
  linkedinUrl?: string
}): Promise<any[]> {
  const candidates = []
  const firstName = seed.name.split(' ')[0].toLowerCase()
  const lastName = seed.name.split(' ').slice(-1)[0].toLowerCase()

  // LinkedIn (se fornecido)
  if (seed.linkedinUrl) {
    candidates.push({
      network: 'linkedin',
      handle: seed.linkedinUrl.split('/in/')[1]?.split('/')[0] || null,
      url: seed.linkedinUrl,
      metadata: {
        source: 'provided',
        company: seed.company
      },
      evidenceCount: 2 // URL fornecida + nome da empresa
    })
  }

  // Twitter/X (heurísticas)
  const twitterHandles = [
    `${firstName}${lastName}`,
    `${firstName}_${lastName}`,
    `${firstName}${lastName[0]}`,
  ]

  for (const handle of twitterHandles) {
    candidates.push({
      network: 'twitter',
      handle: handle,
      url: `https://twitter.com/${handle}`,
      metadata: {
        source: 'heuristic',
        confidence_reason: 'Nome + sobrenome'
      },
      evidenceCount: 1 // Apenas heurística de nome
    })
  }

  // Instagram (heurísticas)
  candidates.push({
    network: 'instagram',
    handle: `${firstName}${lastName}`,
    url: `https://instagram.com/${firstName}${lastName}`,
    metadata: {
      source: 'heuristic'
    },
    evidenceCount: 1
  })

  // GitHub (para tech roles)
  candidates.push({
    network: 'github',
    handle: `${firstName}${lastName}`,
    url: `https://github.com/${firstName}${lastName}`,
    metadata: {
      source: 'heuristic'
    },
    evidenceCount: 1
  })

  return candidates
}

/**
 * Calcula confidence score (0.0 - 1.0)
 */
function calculateConfidence(candidate: any): number {
  let score = 0.3 // Base score

  // Evidências aumentam o score
  if (candidate.metadata.source === 'provided') {
    score += 0.5 // URL fornecida pelo usuário
  }

  if (candidate.evidenceCount >= 2) {
    score += 0.2 // Múltiplas evidências
  }

  // Rede confiável (LinkedIn)
  if (candidate.network === 'linkedin') {
    score += 0.15
  }

  return Math.min(score, 1.0)
}

/**
 * Determina status baseado em confidence + evidências
 */
function getStatus(confidence: number, evidenceCount: number): string {
  if (confidence >= 0.85 && evidenceCount >= 2) {
    return 'confirmed'
  } else if (confidence >= 0.60) {
    return 'probable'
  } else {
    return 'pending'
  }
}

