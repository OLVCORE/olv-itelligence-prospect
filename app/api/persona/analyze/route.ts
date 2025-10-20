import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { networkScanner } from '@/lib/services/network-scanner'
import { nlpClassifier } from '@/lib/services/nlp-classifier'
import { personaExtractor } from '@/lib/services/persona-extractor'

export const runtime = 'nodejs'
export const maxDuration = 30 // Persona analysis with network scanning: 30s

/**
 * POST /api/persona/analyze
 * Pipeline completo: Scan → Classify → Extract Persona → Generate Playbook
 * 
 * Fluxo:
 * 1. Carrega perfis confirmados da pessoa
 * 2. Scan posts de cada perfil (Network Scanner)
 * 3. Classifica posts (NLP Classifier)
 * 4. Extrai vetor de persona (Persona Extractor)
 * 5. Salva em PersonaFeatures
 */
export async function POST(req: NextRequest) {
  try {
    const { personId, vendor = 'TOTVS' } = await req.json()

    if (!personId) {
      return NextResponse.json(
        { error: 'personId é obrigatório' },
        { status: 400 }
      )
    }

    console.log(`[Persona Analyze] 🧠 Iniciando análise para pessoa ${personId}`)

    // 1. Carregar perfis confirmados
    const { data: profiles, error: profilesErr } = await supabaseAdmin
      .from('IdentityProfile')
      .select('*')
      .eq('personId', personId)
      .eq('status', 'confirmed')

    if (profilesErr || !profiles || profiles.length === 0) {
      console.error('[Persona Analyze] ❌ Nenhum perfil confirmado encontrado')
      return NextResponse.json(
        { error: 'Nenhum perfil confirmado encontrado' },
        { status: 404 }
      )
    }

    console.log(`[Persona Analyze] ✅ ${profiles.length} perfis confirmados`)

    // 2. Scan posts de cada perfil
    const allPosts: any[] = []
    for (const profile of profiles) {
      const posts = await networkScanner.scanProfile({
        profileId: profile.id,
        network: profile.network,
        url: profile.url,
        monthsBack: 12,
        maxPosts: 50
      })

      // Salvar posts no banco
      for (const post of posts) {
        const { data: savedPost } = await supabaseAdmin
          .from('IdentityPost')
          .upsert({
            profileId: profile.id,
            network: post.network,
            postedAt: post.postedAt.toISOString(),
            text: post.text,
            link: post.link,
            language: post.language,
            metrics: JSON.stringify(post.metrics),
            createdAt: new Date().toISOString()
          }, {
            onConflict: 'profileId,link'
          })
          .select()
          .single()

        if (savedPost) {
          allPosts.push({ ...post, id: savedPost.id })
        }
      }

      console.log(`[Persona Analyze] 📝 ${posts.length} posts de ${profile.network}`)
    }

    // 3. Classificar todos os posts
    const classifications = await nlpClassifier.classifyBatch(allPosts)

    // Atualizar posts com classificação
    for (const [postId, classification] of classifications.entries()) {
      await supabaseAdmin
        .from('IdentityPost')
        .update({
          topics: classification.topics,
          intent: classification.intent,
          sentiment: classification.sentiment
        })
        .eq('id', postId)
    }

    console.log(`[Persona Analyze] 🏷️ ${classifications.size} posts classificados`)

    // 4. Extrair vetor de persona
    const persona = personaExtractor.extractPersona(allPosts, classifications)

    // 5. Salvar PersonaFeatures
    const { data: personaFeatures, error: personaErr } = await supabaseAdmin
      .from('PersonaFeatures')
      .upsert({
        personId,
        topics: persona.topics,
        objections: persona.objections,
        tone: persona.tone,
        activitySlots: JSON.stringify(persona.activitySlots),
        channelPref: persona.channelPref,
        dores: persona.dores,
        gatilhos: persona.gatilhos,
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'personId'
      })
      .select()
      .single()

    if (personaErr) {
      console.error('[Persona Analyze] ❌ Erro ao salvar persona:', personaErr)
      return NextResponse.json(
        { error: 'Falha ao salvar persona' },
        { status: 500 }
      )
    }

    console.log(`[Persona Analyze] ✅ Persona extraído e salvo`)

    return NextResponse.json({
      success: true,
      persona: {
        ...persona,
        id: personaFeatures.id
      },
      stats: {
        totalPosts: allPosts.length,
        profilesScanned: profiles.length,
        classifications: classifications.size
      }
    })

  } catch (error) {
    console.error('[Persona Analyze] ❌ Erro interno:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

