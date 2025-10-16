import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar organização
  const org = await prisma.organization.create({
    data: {
      name: 'OLV Intelligence Demo'
    }
  })
  console.log('✅ Organização criada:', org.name)

  // Criar projeto
  const project = await prisma.project.create({
    data: {
      name: 'Projeto Demo',
      organizationId: org.id
    }
  })
  console.log('✅ Projeto criado:', project.name)

  // Criar usuários
  const adminPassword = bcrypt.hashSync('admin123', 10)
  const editorPassword = bcrypt.hashSync('editor123', 10)
  const viewerPassword = bcrypt.hashSync('viewer123', 10)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@olv.com',
      name: 'Administrador OLV',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Usuário admin criado:', admin.email)

  const editor = await prisma.user.create({
    data: {
      email: 'editor@olv.com',
      name: 'Editor OLV',
      password: editorPassword,
      role: 'EDITOR'
    }
  })
  console.log('✅ Usuário editor criado:', editor.email)

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@olv.com',
      name: 'Visualizador OLV',
      password: viewerPassword,
      role: 'VIEWER'
    }
  })
  console.log('✅ Usuário viewer criado:', viewer.email)

  // Criar empresas
  const companies = [
    {
      name: 'TechCorp Soluções Ltda',
      cnpj: '12345678000190',
      domain: 'techcorp.com.br',
      cnae: '6201-5/00',
      industry: 'Tecnologia',
      size: 'GRANDE',
      financial: JSON.stringify({
        receita: 850000000,
        porte: 'GRANDE',
        risco: 'BAIXO',
        faturamento: 850000000,
        margem: 12.5,
        crescimento: 15
      }),
      location: JSON.stringify({
        cidade: 'São Paulo',
        estado: 'SP',
        pais: 'Brasil'
      })
    },
    {
      name: 'Inovação Digital S.A.',
      cnpj: '98765432000110',
      domain: 'inovdigital.com.br',
      cnae: '6202-3/00',
      industry: 'Tecnologia',
      size: 'MÉDIO',
      financial: JSON.stringify({
        receita: 120000000,
        porte: 'MÉDIO',
        risco: 'MÉDIO',
        faturamento: 120000000,
        margem: 10.5,
        crescimento: 20
      }),
      location: JSON.stringify({
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        pais: 'Brasil'
      })
    },
    {
      name: 'Consultoria Empresarial Ltda',
      cnpj: '11222333000144',
      domain: 'consultemp.com.br',
      cnae: '7020-4/00',
      industry: 'Consultoria',
      size: 'PEQUENO',
      financial: JSON.stringify({
        receita: 50000000,
        porte: 'PEQUENO',
        risco: 'ALTO',
        faturamento: 50000000,
        margem: 8.5,
        crescimento: 10
      }),
      location: JSON.stringify({
        cidade: 'Belo Horizonte',
        estado: 'MG',
        pais: 'Brasil'
      })
    }
  ]

  for (const companyData of companies) {
    const company = await prisma.company.create({
      data: {
        ...companyData,
        projectId: project.id
      }
    })
    console.log(`✅ Empresa criada: ${company.name}`)
  }

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })