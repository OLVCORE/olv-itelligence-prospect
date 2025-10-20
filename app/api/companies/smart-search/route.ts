import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getDefaultProjectId } from '@/lib/projects/get-default-project';
import { normalizeCnpj, isValidCnpj } from '@/lib/utils/cnpj';

export const maxDuration = 5;
export const runtime = 'nodejs';

/**
 * SMART SEARCH - BUSCA INTELIGENTE COM AUTO-ENRIQUECIMENTO
 * 
 * ESTRATÉGIA:
 * 1. Busca rápida ReceitaWS (3s) → Salva empresa → Retorna 200 OK IMEDIATAMENTE
 * 2. Trigger assíncrono para enriquecimento (não aguarda resposta)
 * 3. Frontend exibe "Empresa salva! Enriquecendo em background..."
 * 
 * VANTAGENS:
 * - Nunca dá timeout (retorna em ~3s)
 * - Enriquecimento completo continua em background
 * - UX fluida (não trava 30s)
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { cnpj } = await req.json();
    
    if (!cnpj) {
      return NextResponse.json({
        ok: false,
        error: { code: 'MISSING_CNPJ', message: 'CNPJ é obrigatório' }
      }, { status: 400 });
    }

    const normalizedCnpj = normalizeCnpj(cnpj);
    
    if (!isValidCnpj(normalizedCnpj)) {
      return NextResponse.json({
        ok: false,
        error: { code: 'INVALID_CNPJ', message: 'CNPJ inválido' }
      }, { status: 422 });
    }

    console.log(`[SmartSearch] 🔍 Buscando: ${normalizedCnpj}`);

    // ========================================
    // FASE 1: BUSCA RÁPIDA ReceitaWS (<3s)
    // ========================================
    
    const receitaUrl = `https://www.receitaws.com.br/v1/cnpj/${normalizedCnpj}`;
    
    const receitaRes = await fetch(receitaUrl, {
      signal: AbortSignal.timeout(3000)
    });

    if (!receitaRes.ok) {
      throw new Error(`ReceitaWS HTTP ${receitaRes.status}`);
    }

    const receitaData = await receitaRes.json();
    
    if (receitaData.status === 'ERROR') {
      throw new Error(receitaData.message || 'CNPJ não encontrado');
    }

    console.log(`[SmartSearch] ✅ ReceitaWS: ${receitaData.nome}`);

    // ========================================
    // FASE 2: SALVAR NO BANCO (RÁPIDO)
    // ========================================
    
    const projectId = await getDefaultProjectId();

    const capitalNum = Number(
      (receitaData.capital_social || '0')
        .toString()
        .replace(/[^\d,.-]/g, '')
        .replace(',', '.')
    ) || 0;

    const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sb = supabaseAdmin();
    
    const { data: company, error: companyError } = await sb
      .from('Company')
      .upsert({
        id: companyId,
        cnpj: normalizedCnpj,
        name: receitaData.nome || 'Empresa sem razão social',
        tradeName: receitaData.fantasia || null,
        projectId,
        capital: capitalNum,
        size: receitaData.porte || 'MÉDIO',
        status: receitaData.situacao || 'ATIVA',
        location: JSON.stringify({
          cidade: receitaData.municipio || '',
          estado: receitaData.uf || '',
          cep: receitaData.cep || ''
        }),
        financial: JSON.stringify({
          porte: receitaData.porte,
          situacao: receitaData.situacao,
          abertura: receitaData.abertura,
          capitalSocial: receitaData.capital_social
        }),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, {
        onConflict: 'cnpj',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (companyError) {
      throw new Error(companyError.message);
    }

    // Análise básica
    await sb.from('Analysis').insert({
      companyId: company.id,
      projectId,
      score: 50,
      insights: JSON.stringify({
        status: 'basic',
        enrichmentStatus: 'queued',
        message: 'Empresa salva! Enriquecimento iniciado em background.',
        source: 'receitaws'
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const latency = Date.now() - startTime;
    console.log(`[SmartSearch] ✅ Empresa salva em ${latency}ms:`, company.id);

    // ========================================
    // FASE 3: TRIGGER ASSÍNCRONO (NÃO AGUARDA)
    // ========================================
    
    // Trigger enriquecimento em background (fire-and-forget)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                    'http://localhost:3000';
    
    // NÃO usar await (fire-and-forget)
    fetch(`${baseUrl}/api/companies/enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: company.id })
    }).catch(err => {
      console.warn('[SmartSearch] ⚠️ Enriquecimento assíncrono falhou:', err.message);
      // Não falhar o request principal
    });

    console.log(`[SmartSearch] 🚀 Enriquecimento disparado em background`);

    // ========================================
    // RETORNAR IMEDIATAMENTE (ANTES DE 5s)
    // ========================================
    
    return NextResponse.json({
      ok: true,
      data: {
        company: {
          id: company.id,
          cnpj: company.cnpj,
          name: company.name,
          tradeName: company.tradeName,
          capital: company.capital,
          size: company.size,
          status: company.status
        },
        latency,
        enrichmentStatus: 'queued',
        message: '✅ Empresa salva com sucesso! Enriquecimento iniciado em background. Atualize a página em 1-2 minutos para ver os dados completos.'
      }
    });

  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[SmartSearch] ❌ Erro em ${latency}ms:`, error.message);

    return NextResponse.json({
      ok: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error.message
      }
    }, { status: 500 });
  }
}

