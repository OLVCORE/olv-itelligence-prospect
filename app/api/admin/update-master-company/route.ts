import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    const sb = supabaseAdmin()
    
    // Dados REAIS da ReceitaWS para MASTER INDUSTRIA E COMERCIO LTDA
    const receitaData = {
      "abertura": "20/05/2009",
      "situacao": "ATIVA",
      "tipo": "MATRIZ",
      "nome": "MASTER INDUSTRIA E COMERCIO LTDA",
      "fantasia": "MASTER INDUSTRIA E COMERCIO LTDA",
      "porte": "DEMAIS",
      "natureza_juridica": "206-2 - Sociedade Empresária Limitada",
      "atividade_principal": [
        {
          "code": "32.99-0-02",
          "text": "Fabricação de canetas, lápis e outros artigos para escritório"
        }
      ],
      "atividades_secundarias": [
        {
          "code": "13.51-1-00",
          "text": "Fabricação de artefatos têxteis para uso doméstico"
        },
        {
          "code": "14.12-6-01",
          "text": "Confecção de peças de vestuário, exceto roupas íntimas e as confeccionadas sob medida"
        },
        {
          "code": "14.13-4-01",
          "text": "Confecção de roupas profissionais, exceto sob medida"
        },
        {
          "code": "15.21-1-00",
          "text": "Fabricação de artigos para viagem, bolsas e semelhantes de qualquer material"
        },
        {
          "code": "15.32-7-00",
          "text": "Fabricação de tênis de qualquer material"
        }
      ],
      "qsa": [
        {
          "nome": "SERGIO LUIZ JANIKIAN",
          "qual": "49-Sócio-Administrador"
        },
        {
          "nome": "KARIN STAMER JANIKIAN",
          "qual": "22-Sócio"
        }
      ],
      "logradouro": "AV PRES JUSCELINO KUBITSCHEK",
      "numero": "1830",
      "complemento": "BLOCO 1 SALA 81",
      "municipio": "SAO PAULO",
      "bairro": "VILA NOVA CONCEICAO",
      "uf": "SP",
      "cep": "04.543-900",
      "email": "atendimento@produtosmaster.com.br",
      "telefone": "(11) 2589-0111",
      "data_situacao": "20/05/2009",
      "cnpj": "18.627.195/0001-60",
      "capital_social": "52000000.00",
      "simples": {
        "optante": false
      },
      "simei": {
        "optante": false
      },
      "efr": "",
      "motivo_situacao": "",
      "situacao_especial": "",
      "data_situacao_especial": ""
    }

    console.log('[UpdateMaster] 🔍 Buscando empresa MASTER...')
    
    const { data: company, error: findError } = await sb
      .from('Company')
      .select('*')
      .eq('cnpj', '18627195000160')
      .single()

    if (findError || !company) {
      console.error('[UpdateMaster] ❌ Empresa não encontrada:', findError)
      return NextResponse.json({ 
        ok: false, 
        error: 'Empresa não encontrada' 
      }, { status: 404 })
    }

    console.log('[UpdateMaster] ✅ Empresa encontrada:', company.id)
    console.log('[UpdateMaster] 🔄 Atualizando com dados REAIS da ReceitaWS...')

    // Atualizar empresa
    const { error: updateError } = await sb
      .from('Company')
      .update({
        name: receitaData.nome,
        tradeName: receitaData.fantasia,
        status: receitaData.situacao,
        size: receitaData.porte,
        capital: parseFloat(receitaData.capital_social) || 52000000,
        financial: JSON.stringify({ receita: receitaData }),
        location: JSON.stringify({
          logradouro: receitaData.logradouro,
          numero: receitaData.numero,
          complemento: receitaData.complemento,
          bairro: receitaData.bairro,
          cidade: receitaData.municipio,
          estado: receitaData.uf,
          cep: receitaData.cep
        }),
        updatedAt: new Date().toISOString()
      })
      .eq('id', company.id)

    if (updateError) {
      console.error('[UpdateMaster] ❌ Erro ao atualizar:', updateError)
      return NextResponse.json({ 
        ok: false, 
        error: updateError.message 
      }, { status: 500 })
    }

    console.log('[UpdateMaster] ✅ Empresa atualizada com SUCESSO!')
    console.log('[UpdateMaster] ✅ Capital Social:', receitaData.capital_social)
    console.log('[UpdateMaster] ✅ Razão Social:', receitaData.nome)
    console.log('[UpdateMaster] ✅ QSA:', receitaData.qsa.length, 'sócios')
    console.log('[UpdateMaster] ✅ Atividades:', receitaData.atividades_secundarias.length, 'secundárias')

    return NextResponse.json({ 
      ok: true, 
      message: 'Empresa atualizada com dados REAIS da ReceitaWS',
      company: {
        id: company.id,
        name: receitaData.nome,
        capital: receitaData.capital_social,
        qsa: receitaData.qsa.length,
        atividades: receitaData.atividades_secundarias.length
      }
    })

  } catch (error: any) {
    console.error('[UpdateMaster] ❌ ERRO:', error.message)
    return NextResponse.json({ 
      ok: false, 
      error: error.message 
    }, { status: 500 })
  }
}

