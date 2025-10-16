# Guia de Deploy - OLV Intelligent Prospecting System

## Pré-requisitos

- Conta Vercel Pro
- PostgreSQL database (Neon/Supabase/RDS)
- Conta Fly.io ou Render (para y-websocket)
- AWS S3 ou compatível (opcional para PDFs)

## 1. Setup do Banco de Dados

### Usando Neon (Recomendado)

1. Criar projeto em [neon.tech](https://neon.tech)
2. Copiar connection string
3. Adicionar às variáveis de ambiente:

```env
DATABASE_URL="postgresql://user:pass@endpoint.neon.tech/olv_prospecting"
```

### Migrations

```bash
# Gerar client do Prisma
npx prisma generate

# Aplicar schema no banco
npx prisma db push

# Ou usar migrations (produção)
npx prisma migrate deploy
```

## 2. Deploy do Frontend e API (Vercel)

### Via CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Via Git (Recomendado)

1. Push para GitHub/GitLab
2. Importar projeto em vercel.com
3. Configurar variáveis de ambiente
4. Deploy automático a cada push

### Variáveis de Ambiente (Vercel)

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_URL=https://seu-dominio.vercel.app
NEXTAUTH_SECRET=<gerar com: openssl rand -base64 32>

# Canvas WebSocket
NEXT_PUBLIC_WS_URL=wss://canvas.seu-dominio.com

# APIs Externas (Fase 2)
APOLLO_API_KEY=
ZOOMINFO_API_KEY=
LUSHA_API_KEY=
```

## 3. Deploy do Canvas WebSocket (Fly.io)

### Criar Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

RUN npm install -g y-websocket

EXPOSE 1234

CMD ["y-websocket-server", "--port", "1234"]
```

### Deploy

```bash
# Instalar Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Inicializar app
fly launch --name olv-canvas-ws

# Deploy
fly deploy

# Configurar domínio
fly certs add canvas.seu-dominio.com
```

### Alternativa: Render

```yaml
# render.yaml
services:
  - type: web
    name: olv-canvas-ws
    env: node
    buildCommand: npm install -g y-websocket
    startCommand: y-websocket-server --port 1234
    envVars:
      - key: PORT
        value: 1234
```

## 4. Storage S3 (Opcional)

### AWS S3

```bash
# Criar bucket
aws s3 mb s3://olv-prospecting-reports

# Configurar CORS
aws s3api put-bucket-cors --bucket olv-prospecting-reports --cors-configuration file://cors.json
```

### cors.json

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedOrigins": ["https://seu-dominio.vercel.app"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

### Variáveis de Ambiente

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=olv-prospecting-reports
```

## 5. Monitoramento

### Sentry (Errors)

```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Datadog / Logtail (Logs)

```env
DATADOG_API_KEY=
DATADOG_SERVICE_NAME=olv-prospecting
```

## 6. CI/CD (GitHub Actions)

### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 7. DNS e Domínios

### Configurar em seu provedor DNS:

```
A     @              76.76.21.21 (Vercel)
CNAME canvas         olv-canvas-ws.fly.dev
CNAME www            cname.vercel-dns.com
```

### SSL/TLS

Vercel e Fly.io provisionam certificados automaticamente via Let's Encrypt.

## 8. Backup e Recuperação

### Backup Automático (Neon)

- Backups automáticos diários
- Retenção de 7 dias (Free) / 30 dias (Pro)

### Backup Manual

```bash
# Export do banco
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

## 9. Performance

### Configuração Vercel

```json
// vercel.json
{
  "framework": "nextjs",
  "regions": ["gru1"],
  "env": {
    "DATABASE_CONNECTION_POOL_URL": "@database-connection-pool"
  }
}
```

### Database Connection Pooling

Use PgBouncer ou Prisma Data Proxy para connection pooling:

```env
DATABASE_URL="prisma://accelerate.prisma-data.net/?api_key=..."
```

## 10. Checklist de Produção

- [ ] Variáveis de ambiente configuradas
- [ ] Database migrations aplicadas
- [ ] Canvas WebSocket deployado e funcionando
- [ ] SSL/TLS ativo em todos os domínios
- [ ] Monitoring (Sentry/Datadog) configurado
- [ ] Backup automático ativo
- [ ] CI/CD pipeline testado
- [ ] Rate limiting configurado
- [ ] CORS configurado corretamente
- [ ] Logs centralizados
- [ ] Health checks ativos
- [ ] Documentação atualizada

## Troubleshooting

### Erro: Database connection failed

```bash
# Testar conexão
psql $DATABASE_URL

# Verificar firewall/IP whitelist
```

### Erro: WebSocket connection refused

```bash
# Verificar logs do Fly.io
fly logs

# Testar conexão
wscat -c wss://canvas.seu-dominio.com
```

### Erro: Puppeteer timeout

```bash
# Aumentar timeout no vercel.json
{
  "functions": {
    "app/api/reports/generate/route.ts": {
      "maxDuration": 60
    }
  }
}
```

## Suporte

Para problemas de deployment, contate a equipe DevOps ou consulte:
- [Vercel Docs](https://vercel.com/docs)
- [Fly.io Docs](https://fly.io/docs)
- [Prisma Docs](https://www.prisma.io/docs)


