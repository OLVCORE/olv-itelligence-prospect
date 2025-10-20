import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getDefaultProjectId } from '@/lib/projects/get-default-project';
import { normalizeCnpj, isValidCnpj } from '@/lib/utils/cnpj';

export const maxDuration = 2;
export const runtime = 'nodejs';

/**
 * MINIMAL SEARCH - EMERGÊNCIA QUANDO TUDO DÁ TIMEOUT
 * 
 * Apenas salva CNPJ no banco sem buscar NADA externo.
 * Enriquecimento será feito 100% via /enrich depois.
 * 
 * TIMEOUT: 2s (apenas banco)
 */
export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const { cnpj, name } = await req.json();
    
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

    console.log(`[MinimalSearch] Salvando CNPJ: ${normalizedCnpj}`);

    const projectId = await getDefaultProjectId();
    const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sb = supabaseAdmin();
    
    const { data: company, error: companyError } = await sb
      .from('Company')
      .upsert({
        id: companyId,
        cnpj: normalizedCnpj,
        name: name || `Empresa CNPJ ${normalizedCnpj}`,
        projectId,
        status: 'PENDENTE',
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

    await sb.from('Analysis').insert({
      companyId: company.id,
      projectId,
      score: 0,
      insights: JSON.stringify({
        status: 'minimal',
        message: 'Clique "Analisar Empresa" para buscar dados.',
        source: 'manual'
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const latency = Date.now() - startTime;

    return NextResponse.json({
      ok: true,
      data: {
        company: { id: company.id, cnpj: company.cnpj, name: company.name },
        latency,
        message: 'CNPJ salvo. Clique "Analisar Empresa".'
      }
    });

  } catch (error: any) {
    console.error(`[MinimalSearch] Erro:`, error.message);

    return NextResponse.json({
      ok: false,
      error: { code: 'ERROR', message: error.message }
    }, { status: 500 });
  }
}

