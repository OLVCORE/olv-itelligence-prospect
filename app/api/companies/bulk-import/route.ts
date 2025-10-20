import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getDefaultProjectId } from '@/lib/projects/get-default-project';
import { normalizeCnpj, isValidCnpj } from '@/lib/utils/cnpj';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * BULK IMPORT DE EMPRESAS VIA CSV
 * 
 * Aceita array de CNPJs e processa em lote.
 * Retorna sucesso/falhas individuais.
 * 
 * Payload:
 * {
 *   "companies": [
 *     { "cnpj": "06.990.590/0001-23", "fantasia": "Kelludy" },
 *     { "cnpj": "18.627.195/0001-60", "fantasia": "Master" }
 *   ]
 * }
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { companies } = await req.json();
    
    if (!companies || !Array.isArray(companies) || companies.length === 0) {
      return NextResponse.json({
        ok: false,
        error: { code: 'INVALID_INPUT', message: 'companies deve ser um array não-vazio' }
      }, { status: 400 });
    }

    if (companies.length > 100) {
      return NextResponse.json({
        ok: false,
        error: { code: 'LIMIT_EXCEEDED', message: 'Máximo 100 empresas por lote' }
      }, { status: 422 });
    }

    console.log(`[Bulk Import] 🚀 Importando ${companies.length} empresas`);

    const projectId = await getDefaultProjectId();
    const results = {
      success: [] as any[],
      failed: [] as any[],
      total: companies.length
    };

    // Processar sequencialmente (evitar sobrecarga)
    for (const [index, companyInput] of companies.entries()) {
      try {
        const { cnpj, fantasia } = companyInput;
        
        if (!cnpj) {
          results.failed.push({ index, cnpj: null, error: 'CNPJ ausente' });
          continue;
        }

        const normalizedCnpj = normalizeCnpj(cnpj);
        
        if (!isValidCnpj(normalizedCnpj)) {
          results.failed.push({ index, cnpj, error: 'CNPJ inválido' });
          continue;
        }

        console.log(`[Bulk Import] ${index + 1}/${companies.length}: ${normalizedCnpj}`);

        // Verificar se já existe
        const sb = supabaseAdmin();
        const { data: existing } = await sb
          .from('Company')
          .select('id')
          .eq('cnpj', normalizedCnpj)
          .maybeSingle();

        if (existing) {
          results.success.push({
            index,
            cnpj: normalizedCnpj,
            status: 'existing',
            companyId: existing.id,
            message: 'Empresa já cadastrada'
          });
          continue;
        }

        // Buscar ReceitaWS (sem timeout agressivo aqui, pois é assíncrono)
        const receitaUrl = `https://www.receitaws.com.br/v1/cnpj/${normalizedCnpj}`;
        const receitaRes = await fetch(receitaUrl, {
          signal: AbortSignal.timeout(5000)
        });

        if (!receitaRes.ok) {
          results.failed.push({ index, cnpj, error: `ReceitaWS HTTP ${receitaRes.status}` });
          continue;
        }

        const receitaData = await receitaRes.json();
        
        if (receitaData.status === 'ERROR') {
          results.failed.push({ index, cnpj, error: receitaData.message || 'CNPJ não encontrado' });
          continue;
        }

        // Parse capital social
        const capitalNum = Number(
          (receitaData.capital_social || '0')
            .toString()
            .replace(/[^\d,.-]/g, '')
            .replace(',', '.')
        ) || 0;

        // Criar empresa
        const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const { data: newCompany, error: insertError } = await sb
          .from('Company')
          .insert({
            id: companyId,
            cnpj: normalizedCnpj,
            name: receitaData.nome || 'Empresa sem razão social',
            tradeName: fantasia || receitaData.fantasia || null,
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
          })
          .select()
          .single();

        if (insertError) {
          results.failed.push({ index, cnpj, error: insertError.message });
          continue;
        }

        // Criar análise básica
        await sb.from('Analysis').insert({
          companyId: newCompany.id,
          projectId,
          score: 50,
          insights: JSON.stringify({
            status: 'basic',
            source: 'bulk_import',
            message: 'Importado via CSV. Clique "Analisar Empresa" para enriquecimento.'
          }),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        results.success.push({
          index,
          cnpj: normalizedCnpj,
          status: 'created',
          companyId: newCompany.id,
          name: newCompany.name
        });

      } catch (err: any) {
        results.failed.push({
          index,
          cnpj: companyInput.cnpj,
          error: err.message
        });
      }
    }

    const latency = Date.now() - startTime;
    console.log(`[Bulk Import] ✅ Concluído em ${latency}ms:`, {
      success: results.success.length,
      failed: results.failed.length
    });

    return NextResponse.json({
      ok: true,
      data: results,
      latency
    });

  } catch (error: any) {
    const latency = Date.now() - startTime;
    console.error(`[Bulk Import] ❌ Erro em ${latency}ms:`, error.message);

    return NextResponse.json({
      ok: false,
      error: {
        code: 'BULK_IMPORT_ERROR',
        message: error.message
      }
    }, { status: 500 });
  }
}

