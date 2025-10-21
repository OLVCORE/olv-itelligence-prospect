import { supabaseAdmin } from '../lib/supabase/admin'

async function fixMasterCompany() {
  const sb = supabaseAdmin()
  
  // Dados REAIS da ReceitaWS
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
    }
  }

  console.log('[FixMaster] 🔍 Buscando empresa MASTER...')
  
  const { data: company, error: findError } = await sb
    .from('Company')
    .select('*')
    .eq('cnpj', '18627195000160')
    .single()

  if (findError || !company) {
    console.error('[FixMaster] ❌ Empresa não encontrada:', findError)
    return
  }

  console.log('[FixMaster] ✅ Empresa encontrada:', company.id)
  console.log('[FixMaster] 🔄 Atualizando com dados REAIS da ReceitaWS...')

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
    console.error('[FixMaster] ❌ Erro ao atualizar:', updateError)
    return
  }

  console.log('[FixMaster] ✅ Empresa atualizada com SUCESSO!')
  console.log('[FixMaster] ✅ Capital Social:', receitaData.capital_social)
  console.log('[FixMaster] ✅ Razão Social:', receitaData.nome)
  console.log('[FixMaster] ✅ QSA:', receitaData.qsa.length, 'sócios')
  console.log('[FixMaster] ✅ Atividades:', receitaData.atividades_secundarias.length, 'secundárias')
}

fixMasterCompany()
  .then(() => {
    console.log('[FixMaster] 🎉 CONCLUÍDO!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('[FixMaster] ❌ ERRO:', err)
    process.exit(1)
  })

