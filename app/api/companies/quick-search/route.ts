import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getDefaultProjectId } from '@/lib/projects/get-default-project';
import { normalizeCnpj, isValidCnpj } from '@/lib/utils/cnpj';

export const maxDuration = 5;
export const runtime = 'nodejs';

/**
 * BUSCA RÁPIDA - APENAS ReceitaWS (<3s GARANTIDO)
 * Não chama Google CSE, Apollo, ou qualquer outra integração
 * Salva empresa no banco e retorna imediatamente
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

    console.log(`[QuickSearch] Buscando ReceitaWS: ${normalizedCnpj}`);

    // Buscar ReceitaWS (SEM TOKEN, usando endpoint público)
    const url = `https://www.receitaws.com.br/v1/cnpj/${normalizedCnpj}`;
    
    const response = await fetch(url, {
      signal: AbortSignal.timeout(3000)
    });

    if (!response.ok) {
      throw new Error(`ReceitaWS HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status === 'ERROR') {
      throw new Error(data.message || 'CNPJ não encontrado');
    }

    console.log(`[QuickSearch] ReceitaWS sucesso: ${data.nome}`);

    // Obter projeto padrão
    const projectId = await getDefaultProjectId();

    // Parse capital social
    const capitalNum = Number(
      (data.capital_social || '0')
        .toString()
        .replace(/[^\d,.-]/g, '')
        .replace(',', '.')
    ) || 0;

    // Gerar ID único
    const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Preparar dados para inserção
    const companyInsert = {
      id: companyId,
      cnpj: normalizedCnpj,
      name: data.nome || 'Empresa sem razão social',
      tradeName: data.fantasia || null,
      projectId,
      capital: capitalNum,
      size: data.porte || 'MÉDIO',
      status: data.situacao || 'ATIVA',
      domain: null, // Será preenchido pelo enriquecimento
      location: JSON.stringify({
        cidade: data.municipio || '',
        estado: data.uf || '',
        endereco: data.logradouro || '',
        numero: data.numero || '',
        bairro: data.bairro || '',
        cep: data.cep || ''
      }),
      financial: JSON.stringify({
        porte: data.porte || 'MÉDIO',
        situacao: data.situacao || 'ATIVA',
        abertura: data.abertura || '',
        naturezaJuridica: data.natureza_juridica || '',
        capitalSocial: data.capital_social || '0'
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // UPSERT para evitar duplicatas
    const { data: company, error: companyError } = await supabaseAdmin
      .from('Company')
      .upsert(companyInsert, {
        onConflict: 'cnpj',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (companyError) {
      console.error('[QuickSearch] Erro ao salvar:', companyError);
      return NextResponse.json({
        ok: false,
        error: { code: 'DATABASE_ERROR', message: companyError.message }
      }, { status: 500 });
    }

    // Inserir análise básica
    const analysisInsert = {
      companyId: company.id,
      projectId,
      score: 50,
      insights: JSON.stringify({
        status: 'basic',
        message: 'Dados básicos da Receita Federal. Clique em "Analisar Empresa" para enriquecimento completo.',
        source: 'receitaws'
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await supabaseAdmin
      .from('Analysis')
      .insert(analysisInsert);

    const latency = Date.now() - startTime;
    console.log(`[QuickSearch] ✅ Sucesso em ${latency}ms`);

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
        message: 'Empresa salva com sucesso! Clique em "Analisar Empresa" para enriquecimento completo.'
      }
    });

  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[QuickSearch] ❌ Erro em ${latency}ms:`, error.message);

    return NextResponse.json({
      ok: false,
      error: {
        code: 'SEARCH_ERROR',
        message: error.message
      }
    }, { status: 500 });
  }
}

