import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Obtém ou cria um projeto padrão para empresas sem projeto específico
 * Usa DEFAULT_PROJECT_ID do .env se disponível, ou busca/cria automaticamente
 */
export async function getDefaultProjectId(): Promise<string> {
  try {
    // 1. Tenta usar o ID do .env se houver
    const fromEnv = process.env.DEFAULT_PROJECT_ID
    if (fromEnv) {
      console.log('[getDefaultProjectId] Usando DEFAULT_PROJECT_ID do .env:', fromEnv)
      return fromEnv
    }

    console.log('[getDefaultProjectId] DEFAULT_PROJECT_ID não definida, buscando/criando projeto padrão...')

    // 2. Tenta pegar um projeto existente (o mais antigo)
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('Project')
      .select('id')
      .order('createdAt', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (selectError) {
      console.error('[getDefaultProjectId] Erro ao buscar projeto existente:', selectError)
      // Não falha aqui, continua para criar um novo
    }

    if (existing?.id) {
      console.log('[getDefaultProjectId] ✅ Usando projeto existente:', existing.id)
      return existing.id
    }

    // 3. Cria um novo projeto padrão
    console.log('[getDefaultProjectId] Criando novo projeto padrão...')
    const nowIso = new Date().toISOString()
    
    const { data: created, error: createError } = await supabaseAdmin
      .from('Project')
      .insert({
        name: 'Projeto Principal',
        description: 'Projeto padrão criado automaticamente pelo sistema',
        createdAt: nowIso,
        updatedAt: nowIso,
      })
      .select('id')
      .single()

    if (createError) {
      console.error('[getDefaultProjectId] ❌ Erro ao criar projeto padrão:', createError)
      // Se falhar ao criar, retorna um ID fixo para evitar quebrar o sistema
      console.log('[getDefaultProjectId] ⚠️ Retornando ID fixo para evitar quebra do sistema')
      return 'default-project-id'
    }

    console.log('[getDefaultProjectId] ✅ Projeto padrão criado:', created.id)
    return created.id
  } catch (error: any) {
    console.error('[getDefaultProjectId] ❌ Erro geral:', error)
    // Fallback: retorna um ID fixo para não quebrar o sistema
    console.log('[getDefaultProjectId] ⚠️ Fallback: usando ID fixo')
    return 'default-project-id'
  }
}

