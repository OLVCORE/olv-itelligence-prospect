/**
 * SEED SCRIPT - ProjectMember & Initial Data
 * OLV Intelligent Prospecting System
 * 
 * Este script popula dados iniciais para testes locais e desenvolvimento.
 * 
 * USO:
 * 1. Local: `npx ts-node prisma/seed-project-members.ts`
 * 2. Produção: Executar manualmente via SQL Editor no Supabase (não automatizar)
 * 
 * IMPORTANTE:
 * - Substitua os IDs de exemplo pelos IDs reais do seu sistema
 * - Este script é IDEMPOTENTE (pode rodar múltiplas vezes sem duplicar)
 * - Nunca commite dados sensíveis/reais neste arquivo
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de ProjectMember...');

  // ========================================
  // 1) CRIAR OU ENCONTRAR USUÁRIO DE TESTE
  // ========================================
  
  const testUserId = 'test-user-admin-001'; // Substitua pelo auth.uid() real do Supabase Auth
  const testUserEmail = 'admin@olvintelligence.com.br';
  
  let testUser = await prisma.user.findUnique({
    where: { email: testUserEmail }
  });

  if (!testUser) {
    console.log(`📝 Criando usuário de teste: ${testUserEmail}`);
    testUser = await prisma.user.create({
      data: {
        id: testUserId,
        email: testUserEmail,
        name: 'Admin OLV (Teste)',
        password: 'hashed-password-placeholder', // Não usar em produção
        role: 'ADMIN',
      }
    });
    console.log(`✅ Usuário criado: ${testUser.id}`);
  } else {
    console.log(`✅ Usuário já existe: ${testUser.id}`);
  }

  // ========================================
  // 2) CRIAR OU ENCONTRAR ORGANIZAÇÃO
  // ========================================
  
  const testOrgId = 'org-olv-001';
  
  let testOrg = await prisma.organization.findUnique({
    where: { id: testOrgId }
  });

  if (!testOrg) {
    console.log('📝 Criando organização: OLV Intelligence');
    testOrg = await prisma.organization.create({
      data: {
        id: testOrgId,
        name: 'OLV Intelligence',
      }
    });
    console.log(`✅ Organização criada: ${testOrg.id}`);
  } else {
    console.log(`✅ Organização já existe: ${testOrg.id}`);
  }

  // Vincular usuário à organização (se ainda não estiver)
  const orgMemberExists = await prisma.organizationMember.findUnique({
    where: {
      userId_organizationId: {
        userId: testUser.id,
        organizationId: testOrg.id,
      }
    }
  });

  if (!orgMemberExists) {
    await prisma.organizationMember.create({
      data: {
        userId: testUser.id,
        organizationId: testOrg.id,
        role: 'ADMIN',
      }
    });
    console.log(`✅ Usuário ${testUser.email} adicionado à organização como ADMIN`);
  }

  // ========================================
  // 3) CRIAR OU ENCONTRAR PROJETO
  // ========================================
  
  const testProjectId = 'default-project-id'; // ID padrão usado nos endpoints
  
  let testProject = await prisma.project.findUnique({
    where: { id: testProjectId }
  });

  if (!testProject) {
    console.log('📝 Criando projeto: Prospecção TOTVS 2025');
    testProject = await prisma.project.create({
      data: {
        id: testProjectId,
        organizationId: testOrg.id,
        name: 'Prospecção TOTVS 2025',
        description: 'Projeto padrão para testes de integrações reais',
        vendor: 'TOTVS',
        cnpjQuota: 1000,
        cnpjQuotaUsed: 0,
      }
    });
    console.log(`✅ Projeto criado: ${testProject.id}`);
  } else {
    console.log(`✅ Projeto já existe: ${testProject.id}`);
  }

  // ========================================
  // 4) CRIAR ProjectMember (RLS)
  // ========================================
  
  const projectMemberExists = await prisma.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: testProject.id,
        userId: testUser.id,
      }
    }
  });

  if (!projectMemberExists) {
    console.log('📝 Adicionando usuário ao projeto como OWNER');
    await prisma.projectMember.create({
      data: {
        projectId: testProject.id,
        userId: testUser.id,
        role: 'owner',
      }
    });
    console.log(`✅ ProjectMember criado: ${testUser.email} → ${testProject.name} (owner)`);
  } else {
    console.log(`✅ ProjectMember já existe: ${testUser.email} → ${testProject.name}`);
  }

  // ========================================
  // 5) CRIAR EMPRESA DE TESTE (OPCIONAL)
  // ========================================
  
  const testCompanyCnpj = '06.990.590/0001-23'; // Kelludy CNPJ real (exemplo)
  
  let testCompany = await prisma.company.findUnique({
    where: { cnpj: testCompanyCnpj }
  });

  if (!testCompany) {
    console.log(`📝 Criando empresa de teste: ${testCompanyCnpj}`);
    testCompany = await prisma.company.create({
      data: {
        projectId: testProject.id,
        name: 'KELLUDY INDUSTRIA E COMERCIO DE MAQUINAS E EQUIPAMENTOS LTDA',
        tradeName: 'Kelludy',
        cnpj: testCompanyCnpj,
        domain: 'kelludy.com.br',
        cnae: '2833-0/00', // Fabricação de máquinas
        status: 'ATIVA',
        capital: 5000.00,
        size: 'PEQUENO',
        location: JSON.stringify({ cidade: 'São Paulo', estado: 'SP', pais: 'Brasil' }),
      }
    });
    console.log(`✅ Empresa criada: ${testCompany.id}`);
  } else {
    console.log(`✅ Empresa já existe: ${testCompany.id}`);
  }

  // ========================================
  // 6) POPULAR Firmographics (OPCIONAL)
  // ========================================
  
  const firmoExists = await prisma.firmographics.findFirst({
    where: {
      companyId: testCompany.id,
      source: 'manual',
    }
  });

  if (!firmoExists) {
    console.log('📝 Criando Firmographics de teste');
    await prisma.firmographics.create({
      data: {
        companyId: testCompany.id,
        source: 'manual',
        employeesRange: '11-50',
        revenueRange: '$1M-$5M',
        techTags: ['ERP', 'Manufatura', 'Supply Chain'],
      }
    });
    console.log('✅ Firmographics criado');
  } else {
    console.log('✅ Firmographics já existe');
  }

  // ========================================
  // 7) POPULAR TechSignals (OPCIONAL)
  // ========================================
  
  const signalExists = await prisma.techSignals.findFirst({
    where: {
      companyId: testCompany.id,
      kind: 'http_header',
      source: 'manual',
    }
  });

  if (!signalExists) {
    console.log('📝 Criando TechSignal de teste');
    await prisma.techSignals.create({
      data: {
        companyId: testCompany.id,
        kind: 'http_header',
        key: 'X-Powered-By',
        value: 'PHP/7.4',
        confidence: 80,
        source: 'manual',
        url: 'https://kelludy.com.br',
      }
    });
    console.log('✅ TechSignal criado');
  } else {
    console.log('✅ TechSignal já existe');
  }

  // ========================================
  // 8) POPULAR CompanyTechMaturity (OPCIONAL)
  // ========================================
  
  const maturityExists = await prisma.companyTechMaturity.findUnique({
    where: {
      companyId_vendor: {
        companyId: testCompany.id,
        vendor: 'TOTVS',
      }
    }
  });

  if (!maturityExists) {
    console.log('📝 Criando CompanyTechMaturity de teste');
    await prisma.companyTechMaturity.create({
      data: {
        companyId: testCompany.id,
        vendor: 'TOTVS',
        sources: {
          manual: true,
          http_headers: true,
        },
        scores: {
          infra: 60,
          systems: 50,
          data: 40,
          security: 50,
          automation: 30,
          culture: 20,
          overall: 42,
        },
        detectedStack: {
          erp: [],
          crm: [],
          cloud: [],
          bi: [],
          db: [],
          integrations: [],
          security: [],
        },
        fitRecommendations: {
          products: ['TOTVS Protheus', 'Fluig'],
          olv_packs: ['Diagnóstico 360°'],
          rationale: ['Baixa maturidade digital, oportunidade para modernização'],
        },
      }
    });
    console.log('✅ CompanyTechMaturity criado');
  } else {
    console.log('✅ CompanyTechMaturity já existe');
  }

  // ========================================
  // 9) RESUMO FINAL
  // ========================================
  
  console.log('\n🎉 Seed concluído com sucesso!\n');
  console.log('📊 RESUMO:');
  console.log(`   👤 Usuário: ${testUser.email} (${testUser.id})`);
  console.log(`   🏢 Organização: ${testOrg.name} (${testOrg.id})`);
  console.log(`   📁 Projeto: ${testProject.name} (${testProject.id})`);
  console.log(`   🔑 ProjectMember: ${testUser.email} → ${testProject.name} (owner)`);
  console.log(`   🏭 Empresa: ${testCompany.name} (${testCompany.cnpj})`);
  console.log(`   📈 Dados populados: Firmographics, TechSignals, CompanyTechMaturity`);
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('   1. Aplicar RLS policies: `psql < prisma/migrations/rls-policies.sql`');
  console.log('   2. Testar integrações: `curl http://localhost:3000/api/health`');
  console.log('   3. Acessar dashboard: http://localhost:3000/dashboard');
  console.log('   4. Login automático com: admin@olvintelligence.com.br\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

