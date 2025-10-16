# 🔐 Template de Credenciais e Configurações

> ⚠️ **IMPORTANTE**: Este é um TEMPLATE. Crie uma cópia chamada `CREDENCIAIS.md` e mantenha-a FORA do Git!
> 
> Nunca commite este arquivo com dados reais! Use um gerenciador de senhas como 1Password, LastPass ou Bitwarden.

---

## 📋 Como Usar Este Template

1. Copie este arquivo: `cp CREDENCIAIS-TEMPLATE.md CREDENCIAIS.md`
2. Edite `CREDENCIAIS.md` com suas credenciais reais
3. Verifique se `CREDENCIAIS.md` está no `.gitignore`
4. Use um gerenciador de senhas para backup seguro

---

## 🔴 PLATAFORMAS PRINCIPAIS

### GitHub
- **Conta**: seu_email@dominio.com
- **Organização**: OLVCORE
- **Repositório**: https://github.com/OLVCORE/olv-itelligence-prospect
- **Token (Personal Access Token)**:
  - Nome: `OLV Intelligence API Token`
  - Scope: `public_repo`, `read:org`, `read:user`
  - Token: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
  - Criado em: DD/MM/YYYY
  - Expira em: DD/MM/YYYY

### Vercel
- **Conta**: seu_email@dominio.com
- **Organização**: [Nome da Org]
- **Projeto**: olv-intelligence-prospect
- **URL Produção**: https://seu-projeto.vercel.app
- **Plano**: Free / Pro ($20/mês)
- **Token API** (se necessário): `xxxxxxxxxxxxxxxxxxxxxxxxxx`

### Supabase
- **Conta**: seu_email@dominio.com
- **Projeto**: olv-intelligence
- **Region**: South America (São Paulo)
- **Database Password**: `[SENHA_FORTE_AQUI]`
- **Connection String**: 
  ```
  postgresql://postgres:[SENHA]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
  ```
- **Connection Pooling** (Recomendado para produção):
  ```
  postgresql://postgres:[SENHA]@db.xxxxxxxxxxxxx.supabase.co:6543/postgres?pgbouncer=true
  ```
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxx...`
- **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxx...` (⚠️ NUNCA expor!)
- **URL**: `https://xxxxxxxxxxxxx.supabase.co`

---

## 🔴 APIS CRÍTICAS (JÁ IMPLEMENTADAS)

### ReceitaWS
- **Conta**: seu_email@dominio.com
- **Painel**: https://www.receitaws.com.br/painel
- **API Token**: `71260c7509a5d692644af4cbd32abc5cf6484b3bd48d4222eae72da31ec19886`
- **Plano**: Ilimitado (R$ 29,90/mês)
- **Criado em**: DD/MM/YYYY
- **Renovação**: DD/MM/YYYY
- **Forma de Pagamento**: [Cartão/Boleto]

### OpenAI
- **Conta**: seu_email@dominio.com
- **Organization ID**: `org-xxxxxxxxxxxxxxxxxx`
- **API Key**: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Limite Mensal**: $[valor]
- **Uso Médio**: ~$20/mês
- **Modelos Usados**: gpt-4, gpt-3.5-turbo
- **Criado em**: DD/MM/YYYY

### Hunter.io
- **Conta**: seu_email@dominio.com
- **API Key**: `02e8e5e7d9c20945f0243eeaab724f3f1fa72xxx`
- **Plano**: Free (50 buscas/mês) / Starter ($49/mês)
- **Limite Mensal**: [número] buscas
- **Uso Médio**: [número] buscas/mês
- **Criado em**: DD/MM/YYYY

### Google Custom Search
- **Conta Google**: seu_email@gmail.com
- **Projeto**: OLV Intelligence
- **API Key**: `AIzaSyB-s1HVIZL92f8oVz_3xxxxxxxxxxxxxxxx`
- **Custom Search Engine ID**: `xxxxxxxxxxxxxxx:yyyyyyyyyyy`
- **Limite**: 100 buscas/dia grátis
- **Criado em**: DD/MM/YYYY
- **Link Console**: https://console.cloud.google.com/apis/credentials
- **Link CSE**: https://programmablesearchengine.google.com/controlpanel

---

## 🟡 APIS RECOMENDADAS (A IMPLEMENTAR)

### Clearbit
- **Conta**: ___________
- **API Key**: `sk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Plano**: Trial (14 dias) / Pro ($99/mês)
- **Trial Expira**: DD/MM/YYYY
- **Criado em**: DD/MM/YYYY

### Serasa Experian
- **Conta Empresa**: [Razão Social]
- **CNPJ**: __.____.___/____-__
- **Contato Comercial**: [Nome]
- **Telefone**: 0800 722 0202
- **Email**: ___________
- **API Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **API Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Environment**: sandbox / production
- **Plano**: [Nome do Plano]
- **Custo Mensal**: R$ _____
- **Contrato**: [Número/Data]

### BuiltWith
- **Conta**: ___________
- **API Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Plano**: API Pro ($295/mês)
- **Limite**: [número] consultas/mês
- **Criado em**: DD/MM/YYYY

### LinkedIn API (via RapidAPI)
- **Conta RapidAPI**: ___________
- **RapidAPI Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- **Host**: `linkedin-data-api.p.rapidapi.com`
- **Plano**: [Nome] ($[valor]/mês)
- **Limite**: [número] requests/mês
- **Criado em**: DD/MM/YYYY

---

## 🟢 APIS COMPLEMENTARES (FUTURO)

### Crunchbase
- **Conta**: ___________
- **API Key**: ___________
- **Plano**: ___________
- **Custo**: $29/mês

### ZoomInfo
- **Conta**: ___________
- **API Key**: ___________
- **Plano**: ___________
- **Custo**: $___/mês

### Wappalyzer
- **Conta**: ___________
- **API Key**: ___________
- **Plano**: ___________
- **Custo**: $149/mês

### Similarweb
- **Conta**: ___________
- **API Key**: ___________
- **Plano**: ___________
- **Custo**: $___/mês

### G2 Stack
- **Conta**: ___________
- **API Key**: ___________
- **Plano**: ___________
- **Custo**: Enterprise

---

## 🔐 AUTENTICAÇÃO E SEGURANÇA

### NextAuth
- **NEXTAUTH_URL**: `http://localhost:3000` (dev) / `https://seu-dominio.com` (prod)
- **NEXTAUTH_SECRET**: `[GERAR COM: openssl rand -base64 32]`
  ```
  Exemplo: xJ8kN2mQ9pR5sT7vW4yZ1aB3cD6eF8gH0iJ2kL4mN6oP
  ```

### Credenciais Demo (Sistema)
**Admin**:
- Email: `admin@olv.com`
- Senha: `admin123`

**Editor**:
- Email: `editor@olv.com`
- Senha: `editor123`

**Viewer**:
- Email: `viewer@olv.com`
- Senha: `viewer123`

> ⚠️ MUDAR EM PRODUÇÃO!

---

## 📧 CONFIGURAÇÕES DE EMAIL (FUTURO)

### SendGrid / Resend
- **Conta**: ___________
- **API Key**: ___________
- **Domínio Verificado**: ___________
- **Email From**: `noreply@seu-dominio.com`
- **Limite**: [número] emails/mês

### SMTP (Alternativa)
- **Host**: `smtp.gmail.com`
- **Port**: `587`
- **User**: ___________
- **Password**: `[APP PASSWORD]`
- **From**: ___________

---

## 📊 MONITORAMENTO E ANALYTICS

### Sentry
- **Conta**: ___________
- **DSN**: `https://xxxxx@o000000.ingest.sentry.io/0000000`
- **Projeto**: olv-intelligence
- **Plano**: Free (5k eventos/mês)

### Google Analytics
- **Conta**: ___________
- **Tracking ID**: `G-XXXXXXXXXX`
- **Property**: OLV Intelligence

### Mixpanel (Opcional)
- **Conta**: ___________
- **Token**: ___________

---

## 💳 MÉTODOS DE PAGAMENTO

### Cartão Principal
- **Nome**: ___________
- **Final**: ****-****-****-1234
- **Validade**: MM/AA
- **Usado em**: [Lista de serviços]

### Cartão Backup
- **Nome**: ___________
- **Final**: ****-****-****-5678
- **Validade**: MM/AA
- **Usado em**: [Lista de serviços]

---

## 📅 CALENDÁRIO DE RENOVAÇÕES

| Serviço | Custo | Renovação | Forma Pagamento | Status |
|---------|-------|-----------|-----------------|--------|
| Vercel Pro | $20/mês | Mensal | Cartão 1234 | Ativo |
| ReceitaWS | R$ 29,90/mês | DD/MM | Cartão 1234 | Ativo |
| OpenAI | ~$20/mês | Pós-pago | Cartão 1234 | Ativo |
| Hunter.io | $49/mês | DD/MM | - | Free |
| Supabase | R$ 0 | - | - | Free |
| GitHub | R$ 0 | - | - | Free |
| Clearbit | $99/mês | DD/MM | - | Trial |
| Serasa | R$ ___/mês | DD/MM | - | Pendente |
| BuiltWith | $295/mês | DD/MM | - | Pendente |

**Total Mensal Atual**: R$ ~350/mês
**Total Planejado (Fase 2)**: R$ ~1.500/mês

---

## 🔄 ROTAÇÃO DE CREDENCIAIS

### Última Rotação
- **GitHub Token**: DD/MM/YYYY
- **Vercel Token**: DD/MM/YYYY
- **Database Password**: DD/MM/YYYY
- **API Keys**: DD/MM/YYYY

### Próxima Rotação Recomendada
- **GitHub Token**: DD/MM/YYYY (a cada 6 meses)
- **Database Password**: DD/MM/YYYY (a cada 3 meses)
- **NextAuth Secret**: DD/MM/YYYY (anualmente)

---

## 📞 CONTATOS DE SUPORTE

### Suporte Técnico
- **Vercel**: support@vercel.com
- **Supabase**: support@supabase.io
- **OpenAI**: support@openai.com
- **Hunter.io**: support@hunter.io

### Suporte Comercial
- **Serasa**: 0800 722 0202
- **BuiltWith**: sales@builtwith.com
- **Clearbit**: sales@clearbit.com

---

## 🚨 AÇÕES EM CASO DE VAZAMENTO

1. **Imediato**: Revogar credencial comprometida
2. **5 minutos**: Gerar nova credencial
3. **10 minutos**: Atualizar em todos os ambientes
4. **15 minutos**: Verificar logs de acesso suspeito
5. **30 minutos**: Documentar incidente
6. **24 horas**: Review completo de segurança

### Contatos de Emergência
- **Responsável Técnico**: [Nome] - [Telefone]
- **Responsável Segurança**: [Nome] - [Telefone]
- **CEO/CTO**: [Nome] - [Telefone]

---

## ✅ CHECKLIST DE SEGURANÇA

- [ ] Todas as senhas são únicas e fortes (16+ caracteres)
- [ ] Autenticação de dois fatores (2FA) ativada em todas as contas críticas
- [ ] API Keys rotacionadas nos últimos 6 meses
- [ ] Arquivo CREDENCIAIS.md está no .gitignore
- [ ] Backup das credenciais em gerenciador de senhas seguro
- [ ] Apenas pessoas autorizadas têm acesso
- [ ] Logs de acesso monitorados regularmente
- [ ] Plano de resposta a incidentes documentado

---

## 📝 NOTAS IMPORTANTES

1. **NUNCA** commite este arquivo com dados reais no Git
2. Use variáveis de ambiente (`.env.local`) para desenvolvimento
3. Use secrets do Vercel/GitHub Actions para CI/CD
4. Mantenha backup em local seguro (1Password, LastPass, etc)
5. Revise acessos trimestralmente
6. Documente todas as mudanças de credenciais
7. Compartilhe apenas via canais seguros (nunca por email/Slack)

---

## 📊 LOG DE MUDANÇAS

| Data | Alteração | Por Quem | Motivo |
|------|-----------|----------|--------|
| DD/MM/YYYY | Criação inicial | [Nome] | Setup inicial |
| DD/MM/YYYY | Adicionado Clearbit | [Nome] | Nova API |
| DD/MM/YYYY | Rotação GitHub Token | [Nome] | Manutenção |

---

**Última Atualização**: DD/MM/YYYY
**Responsável**: [Nome]
**Próxima Review**: DD/MM/YYYY

