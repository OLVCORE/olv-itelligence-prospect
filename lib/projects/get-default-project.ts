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
      console.log('[ProjectFallback] Usando DEFAULT_PROJECT_ID do .env:', fromEnv)
      
      // Validar se o projeto existe no banco
      const { data: validation, error: validationError } = await supabaseAdmin()
        .from('Project')
        .select('id')
        .eq('id', fromEnv)
        .single()
      
      if (validationError || !validation) {
        console.warn('[ProjectFallback] DEFAULT_PROJECT_ID do .env não existe no banco, criando novo...')
      } else {
        console.log('[ProjectFallback] ✅ DEFAULT_PROJECT_ID validado:', fromEnv)
        return fromEnv
      }
    }

    console.log('[ProjectFallback] Buscando/criando projeto padrão...')

    // 2. Tenta pegar um projeto existente (o mais antigo)
    const { data: existing, error: selectError } = await supabaseAdmin()
      .from('Project')
      .select('id')
      .order('createdAt', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (selectError) {
      console.error('[ProjectFallback] Erro ao buscar projeto existente:', selectError)
      // Não falha aqui, continua para criar um novo
    }

    if (existing?.id) {
      console.log('[ProjectFallback] ✅ Usando projeto existente:', existing.id)
      return existing.id
    }

    // 3. Busca ou cria organização padrão primeiro
    console.log('[ProjectFallback] Buscando/criando organização padrão...')
    let organizationId = 'default-org-id'
    
    const { data: existingOrg } = await supabaseAdmin()
      .from('Organization')
      .select('id')
      .eq('id', 'default-org-id')
      .maybeSingle()
    
    if (!existingOrg) {
      const { data: newOrg, error: orgError } = await supabaseAdmin()
        .from('Organization')
        .insert({
          id: 'default-org-id',
          name: 'Organização Principal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .select('id')
        .single()
      
      if (orgError) {
        console.error('[ProjectFallback] Erro ao criar organização:', orgError)
      } else {
        organizationId = newOrg.id
        console.log('[ProjectFallback] ✅ Organização criada:', organizationId)
      }
    }
    
    // 4. Cria um novo projeto padrão usando upsert transacional
    console.log('[ProjectFallback] Criando novo projeto padrão...')
    const nowIso = new Date().toISOString()
    
    // Usar upsert para evitar duplicatas em caso de concorrência
    const { data: created, error: createError } = await supabaseAdmin()
      .from('Project')
      .upsert({
        id: 'default-project-id',
        organizationId,
        name: 'Projeto Principal',
        description: 'Projeto padrão criado automaticamente pelo sistema',
        vendor: 'TOTVS',
        cnpjQuota: 1000,
        cnpjQuotaUsed: 0,
        createdAt: nowIso,
        updatedAt: nowIso,
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select('id')
      .single()

    if (createError) {
      console.error('[ProjectFallback] ❌ Erro ao criar projeto padrão:', createError)
      // Se falhar ao criar, retorna um ID fixo para evitar quebrar o sistema
      console.log('[ProjectFallback] ⚠️ Retornando ID fixo para evitar quebra do sistema')
      return 'default-project-id'
    }

    console.log('[ProjectFallback] ✅ Projeto padrão criado/encontrado:', created.id)
    return created.id
  } catch (error: any) {
    console.error('[ProjectFallback] ❌ Erro geral:', error)
    // Fallback: retorna um ID fixo para não quebrar o sistema
    console.log('[ProjectFallback] ⚠️ Fallback: usando ID fixo')
    return 'default-project-id'
  }
}

