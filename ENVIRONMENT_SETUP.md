# Configuração de Ambiente - OLV Intelligent Prospecting System

## Variáveis de Ambiente Necessárias

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Database (SQLite para desenvolvimento local)
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="dev-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI API (opcional - sistema funciona sem)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# APIs Externas (opcional - sistema funciona com dados mock)
APOLLO_API_KEY="your-apollo-api-key"
ZOOMINFO_API_KEY="your-zoominfo-api-key"
LUSHA_API_KEY="your-lusha-api-key"
CLEARBIT_API_KEY="your-clearbit-api-key"
BUILTWITH_API_KEY="your-builtwith-api-key"
RECEITAWS_API_KEY="your-receitaws-api-key"

# AWS (para produção)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_S3_BUCKET="your-s3-bucket-name"

# WebSocket (para colaboração em tempo real)
NEXT_PUBLIC_WS_URL="ws://localhost:3001"
```

## Como Obter as Chaves de API

### OpenAI API Key
1. Acesse [OpenAI Platform](https://platform.openai.com/)
2. Crie uma conta ou faça login
3. Vá para "API Keys" no menu
4. Clique em "Create new secret key"
5. Copie a chave e cole em `OPENAI_API_KEY`

### ReceitaWS API Key
1. Acesse [ReceitaWS](https://receitaws.com.br/)
2. Registre-se para obter acesso à API
3. Copie a chave e cole em `RECEITAWS_API_KEY`

### BuiltWith API Key
1. Acesse [BuiltWith](https://builtwith.com/)
2. Crie uma conta Pro
3. Acesse as configurações da API
4. Copie a chave e cole em `BUILTWITH_API_KEY`

## Funcionamento Sem APIs Externas

O sistema foi projetado para funcionar completamente sem APIs externas usando dados mockados. Isso permite:

- ✅ Desenvolvimento e testes locais
- ✅ Demonstrações sem custos
- ✅ Funcionalidades completas com dados simulados
- ✅ Integração gradual de APIs reais

## Próximos Passos

1. **Desenvolvimento Local**: Use apenas `DATABASE_URL` e `NEXTAUTH_SECRET`
2. **Testes com IA**: Adicione `OPENAI_API_KEY` para relatórios com IA real
3. **Produção**: Configure todas as APIs para dados reais
