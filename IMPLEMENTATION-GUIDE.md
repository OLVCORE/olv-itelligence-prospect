# Guia de Implementação das APIs

## 🎯 APIs PRIORITÁRIAS PARA IMPLEMENTAR AGORA

---

## 1. GitHub API (GRÁTIS - Implementar JÁ!)

### Como Obter:
1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Selecione permissões: `public_repo`, `read:org`, `read:user`
4. Copie o token gerado

### Configuração:
```env
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxx
```

### Implementação:
```typescript
// lib/services/github.ts
export class GitHubService {
  private apiKey: string;
  private baseUrl = 'https://api.github.com';

  constructor() {
    this.apiKey = process.env.GITHUB_TOKEN || '';
  }

  async detectTechStack(domain: string) {
    // Buscar repositórios da organização
    const org = domain.split('.')[0];
    
    const response = await fetch(`${this.baseUrl}/orgs/${org}/repos`, {
      headers: {
        'Authorization': `token ${this.apiKey}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const repos = await response.json();
    
    // Analisar linguagens e tecnologias
    const techStack = new Set<string>();
    for (const repo of repos.slice(0, 10)) {
      const languages = await this.getRepoLanguages(repo.languages_url);
      Object.keys(languages).forEach(lang => techStack.add(lang));
    }

    return {
      languages: Array.from(techStack),
      repoCount: repos.length,
      topRepos: repos.slice(0, 5).map((r: any) => ({
        name: r.name,
        stars: r.stargazers_count,
        language: r.language
      }))
    };
  }

  private async getRepoLanguages(url: string) {
    const response = await fetch(url, {
      headers: { 'Authorization': `token ${this.apiKey}` }
    });
    return await response.json();
  }
}
```

### Integração no Sistema:
```typescript
// Adicionar em lib/intelligence-engine.ts
const githubService = new GitHubService();
const techData = await githubService.detectTechStack(company.website);
```

---

## 2. Clearbit (Trial Grátis - Testar Esta Semana)

### Como Obter:
1. Acesse: https://dashboard.clearbit.com/signup
2. Cadastre-se (14 dias grátis)
3. Copie a API Key em Settings > API Keys

### Configuração:
```env
CLEARBIT_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxxxxxx
```

### Implementação:
```typescript
// lib/services/clearbit.ts
export class ClearbitService {
  private apiKey: string;
  private baseUrl = 'https://company.clearbit.com/v2/companies';

  constructor() {
    this.apiKey = process.env.CLEARBIT_API_KEY || '';
  }

  async enrichCompany(domain: string) {
    const response = await fetch(`${this.baseUrl}/find?domain=${domain}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error('Empresa não encontrada no Clearbit');
    }

    const data = await response.json();
    
    return {
      name: data.name,
      domain: data.domain,
      logo: data.logo,
      description: data.description,
      industry: data.category.industry,
      sector: data.category.sector,
      employees: data.metrics.employees,
      estimatedRevenue: data.metrics.estimatedAnnualRevenue,
      techStack: data.tech || [],
      founded: data.foundedYear,
      location: {
        city: data.geo.city,
        state: data.geo.state,
        country: data.geo.country
      },
      social: {
        linkedin: data.linkedin.handle,
        twitter: data.twitter.handle,
        facebook: data.facebook.handle
      },
      alexaRank: data.metrics.alexaGlobalRank
    };
  }

  async findPerson(email: string) {
    const response = await fetch(`https://person.clearbit.com/v2/people/find?email=${email}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    const data = await response.json();
    
    return {
      name: data.name.fullName,
      title: data.employment.title,
      role: data.employment.role,
      seniority: data.employment.seniority,
      company: data.employment.name,
      linkedin: data.linkedin.handle,
      avatar: data.avatar
    };
  }
}
```

---

## 3. BuiltWith (Investimento Essencial)

### Como Obter:
1. Acesse: https://api.builtwith.com/
2. Escolha plano API Pro ($295/mês)
3. Obtenha API Key

### Configuração:
```env
BUILTWITH_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
```

### Implementação:
```typescript
// lib/services/builtwith.ts
export class BuiltWithService {
  private apiKey: string;
  private baseUrl = 'https://api.builtwith.com/v20/api.json';

  constructor() {
    this.apiKey = process.env.BUILTWITH_API_KEY || '';
  }

  async getTechStack(domain: string) {
    const response = await fetch(
      `${this.baseUrl}?KEY=${this.apiKey}&LOOKUP=${domain}`
    );

    const data = await response.json();
    const results = data.Results[0];

    const techStack = {
      analytics: this.extractCategory(results, 'Analytics'),
      cms: this.extractCategory(results, 'CMS'),
      cloud: this.extractCategory(results, 'Cloud'),
      crm: this.extractCategory(results, 'CRM'),
      erp: this.extractCategory(results, 'ERP'),
      ecommerce: this.extractCategory(results, 'E-Commerce'),
      marketing: this.extractCategory(results, 'Marketing'),
      security: this.extractCategory(results, 'Security'),
      hosting: this.extractCategory(results, 'Hosting'),
      javascript: this.extractCategory(results, 'JavaScript Frameworks'),
      all: []
    };

    // Calcular estimativa de gastos
    techStack.all = Object.values(techStack)
      .flat()
      .filter(Boolean);

    return {
      ...techStack,
      totalTechnologies: techStack.all.length,
      estimatedMonthlyCost: this.estimateCost(techStack.all)
    };
  }

  private extractCategory(results: any, category: string) {
    const techs = results.Paths.find((p: any) => 
      p.Name === category
    );
    
    return techs?.Technologies.map((t: any) => ({
      name: t.Name,
      category: category,
      firstDetected: t.FirstDetected,
      lastDetected: t.LastDetected,
      isCurrent: this.isCurrent(t.LastDetected)
    })) || [];
  }

  private isCurrent(lastDetected: number) {
    const sixMonthsAgo = Date.now() - (6 * 30 * 24 * 60 * 60 * 1000);
    return lastDetected > sixMonthsAgo;
  }

  private estimateCost(techs: any[]) {
    // Lógica simplificada de estimativa
    const costs: Record<string, number> = {
      'Salesforce': 150,
      'HubSpot': 800,
      'SAP': 5000,
      'Oracle': 3000,
      'Microsoft Dynamics': 2000,
      'AWS': 1000,
      'Google Cloud': 800,
      'Azure': 1200
    };

    return techs.reduce((total, tech) => {
      return total + (costs[tech.name] || 50);
    }, 0);
  }
}
```

---

## 4. Serasa Experian (Essencial para Brasil)

### Como Obter:
1. Contato: https://www.serasaexperian.com.br/contato
2. Solicitar acesso à API de Score Empresarial
3. Processo de homologação (15-30 dias)

### Configuração:
```env
SERASA_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
SERASA_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxx
SERASA_ENVIRONMENT=production
```

### Implementação:
```typescript
// lib/services/serasa.ts
export class SerasaService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.SERASA_API_KEY || '';
    this.apiSecret = process.env.SERASA_API_SECRET || '';
    this.baseUrl = process.env.SERASA_ENVIRONMENT === 'production'
      ? 'https://api.serasaexperian.com.br'
      : 'https://sandbox.serasaexperian.com.br';
  }

  async getCompanyScore(cnpj: string) {
    const token = await this.authenticate();
    
    const response = await fetch(
      `${this.baseUrl}/score-pj/v1/consulta/${cnpj}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json();

    return {
      score: data.score, // 0-1000
      class: data.classificacao, // A, B, C, D, E
      probability: data.probabilidadeInadimplencia, // %
      risk: this.classifyRisk(data.score),
      details: {
        protestos: data.protestos || 0,
        acoesCiveis: data.acoesCiveis || 0,
        falencias: data.falencias || 0,
        chequesSemFundo: data.chequesSemFundo || 0,
        refin: data.participacaoRefin || false,
        negativacoes: data.negativacoes || 0
      },
      recomendacao: this.getRecommendation(data.score)
    };
  }

  private async authenticate() {
    const response = await fetch(`${this.baseUrl}/auth/v1/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.apiKey,
        client_secret: this.apiSecret,
        grant_type: 'client_credentials'
      })
    });

    const data = await response.json();
    return data.access_token;
  }

  private classifyRisk(score: number): string {
    if (score >= 800) return 'BAIXO';
    if (score >= 600) return 'MÉDIO';
    if (score >= 400) return 'ALTO';
    return 'CRÍTICO';
  }

  private getRecommendation(score: number): string {
    if (score >= 800) {
      return 'Cliente ideal. Baixíssimo risco de inadimplência.';
    }
    if (score >= 600) {
      return 'Bom cliente. Requer acompanhamento moderado.';
    }
    if (score >= 400) {
      return 'Atenção! Requer garantias e limite de crédito controlado.';
    }
    return 'Alto risco! Recomenda-se pagamento antecipado.';
  }
}
```

---

## 5. LinkedIn API via RapidAPI

### Como Obter:
1. Acesse: https://rapidapi.com/rockapis-rockapis-default/api/linkedin-data-api
2. Cadastre-se e escolha plano
3. Copie API Key e Host

### Configuração:
```env
RAPIDAPI_KEY=xxxxxxxxxxxxxxxxxxxxxxxxx
RAPIDAPI_LINKEDIN_HOST=linkedin-data-api.p.rapidapi.com
```

### Implementação:
```typescript
// lib/services/linkedin.ts
export class LinkedInService {
  private apiKey: string;
  private host: string;

  constructor() {
    this.apiKey = process.env.RAPIDAPI_KEY || '';
    this.host = process.env.RAPIDAPI_LINKEDIN_HOST || '';
  }

  async searchPeople(companyName: string, title: string) {
    const response = await fetch(
      `https://${this.host}/search-people?keywords=${companyName} ${title}`,
      {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        }
      }
    );

    const data = await response.json();

    return data.data.map((person: any) => ({
      name: person.name,
      title: person.title,
      company: person.company,
      location: person.location,
      profileUrl: person.url,
      imageUrl: person.image,
      connections: person.connections,
      summary: person.summary
    }));
  }

  async getCompanyInfo(companyName: string) {
    const response = await fetch(
      `https://${this.host}/company?name=${companyName}`,
      {
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.host
        }
      }
    );

    const data = await response.json();

    return {
      name: data.name,
      industry: data.industry,
      size: data.size,
      founded: data.founded,
      headquarters: data.headquarters,
      specialties: data.specialties,
      followers: data.followers,
      employees: this.parseEmployeeCount(data.size)
    };
  }

  private parseEmployeeCount(size: string): number {
    const match = size.match(/(\d+)-(\d+)/);
    if (match) {
      return Math.floor((parseInt(match[1]) + parseInt(match[2])) / 2);
    }
    return 0;
  }
}
```

---

## 🔄 INTEGRAÇÃO COMPLETA

### Atualizar IntelligenceEngine:

```typescript
// lib/intelligence-engine.ts
import { GitHubService } from './services/github';
import { ClearbitService } from './services/clearbit';
import { BuiltWithService } from './services/builtwith';
import { SerasaService } from './services/serasa';
import { LinkedInService } from './services/linkedin';

export class IntelligenceEngine {
  private github: GitHubService;
  private clearbit: ClearbitService;
  private builtwith: BuiltWithService;
  private serasa: SerasaService;
  private linkedin: LinkedInService;

  constructor() {
    this.github = new GitHubService();
    this.clearbit = new ClearbitService();
    this.builtwith = new BuiltWithService();
    this.serasa = new SerasaService();
    this.linkedin = new LinkedInService();
  }

  async analyzeCompanyComplete(company: any) {
    try {
      // Executar todas as análises em paralelo
      const [
        githubData,
        clearbitData,
        builtwithData,
        serasaData,
        linkedinData
      ] = await Promise.allSettled([
        this.github.detectTechStack(company.website).catch(() => null),
        this.clearbit.enrichCompany(company.website).catch(() => null),
        this.builtwith.getTechStack(company.website).catch(() => null),
        this.serasa.getCompanyScore(company.cnpj).catch(() => null),
        this.linkedin.getCompanyInfo(company.name).catch(() => null)
      ]);

      // Consolidar dados
      return {
        techStack: this.consolidateTechStack(
          githubData,
          clearbitData,
          builtwithData
        ),
        financialScore: serasaData.status === 'fulfilled' ? serasaData.value : null,
        employees: this.consolidateEmployees(clearbitData, linkedinData),
        enrichment: clearbitData.status === 'fulfilled' ? clearbitData.value : null,
        social: this.consolidateSocial(clearbitData, linkedinData),
        confidence: this.calculateOverallConfidence([
          githubData,
          clearbitData,
          builtwithData,
          serasaData,
          linkedinData
        ])
      };
    } catch (error) {
      console.error('Erro na análise completa:', error);
      throw error;
    }
  }

  private consolidateTechStack(...sources: any[]) {
    // Lógica de consolidação
  }

  private calculateOverallConfidence(sources: any[]): number {
    const successful = sources.filter(s => s.status === 'fulfilled').length;
    return Math.round((successful / sources.length) * 100);
  }
}
```

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Semana 1:
- [ ] Configurar GitHub API
- [ ] Testar Clearbit (trial)
- [ ] Implementar serviços base
- [ ] Integrar no IntelligenceEngine

### Semana 2:
- [ ] Contratar BuiltWith
- [ ] Implementar BuiltWith service
- [ ] Iniciar processo com Serasa
- [ ] Testar RapidAPI LinkedIn

### Semana 3:
- [ ] Consolidar dados de múltiplas fontes
- [ ] Implementar sistema de fallback
- [ ] Adicionar cache para reduzir custos
- [ ] Criar dashboard de uso de APIs

### Semana 4:
- [ ] Otimizar chamadas (batch, cache)
- [ ] Implementar rate limiting
- [ ] Monitoramento de custos
- [ ] Testes de integração completos

---

## 💡 DICAS DE OTIMIZAÇÃO

1. **Cache Inteligente**: Cachear resultados por 7-30 dias
2. **Batch Processing**: Agrupar múltiplas consultas
3. **Fallback Strategy**: Se API falhar, usar dados anteriores
4. **Rate Limiting**: Respeitar limites de cada API
5. **Custo Monitoring**: Dashboard de uso em tempo real

