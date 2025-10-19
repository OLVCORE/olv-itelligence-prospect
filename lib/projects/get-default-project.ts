import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Obtém ou cria um projeto padrão para empresas sem projeto específico
 * Usa DEFAULT_PROJECT_ID do .env se disponível, ou busca/cria automaticamente
 */
export async function getDefaultProjectId(): Promise<string> {
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
    throw new Error(`Erro ao buscar projeto padrão: ${selectError.message}`)
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
      name: 'Default Project',
      description: 'Projeto padrão criado automaticamente pelo sistema',
      createdAt: nowIso,
      updatedAt: nowIso,
    })
    .select('id')
    .single()

  if (createError) {
    console.error('[getDefaultProjectId] ❌ Erro ao criar projeto padrão:', createError)
    throw new Error(`Erro ao criar projeto padrão: ${createError.message}`)
  }

  console.log('[getDefaultProjectId] ✅ Projeto padrão criado:', created.id)
  return created.id
}

