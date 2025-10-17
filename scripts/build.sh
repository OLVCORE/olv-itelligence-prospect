#!/bin/bash

# Script de build inteligente para Prisma
# Usa migrate deploy se DIRECT_URL existe, senão usa db push

echo "🔍 Verificando variáveis de ambiente..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL não configurada!"
  exit 1
fi

echo "✅ DATABASE_URL configurada"

# Gerar Prisma Client
echo "📦 Gerando Prisma Client..."
npx prisma generate

# Verificar se DIRECT_URL existe
if [ -z "$DIRECT_URL" ]; then
  echo "⚠️  DIRECT_URL não encontrada"
  echo "📊 Usando prisma db push (sincronização direta)..."
  npx prisma db push --accept-data-loss --skip-generate
else
  echo "✅ DIRECT_URL configurada"
  echo "🚀 Usando prisma migrate deploy (com histórico de migrações)..."
  npx prisma migrate deploy
fi

# Build do Next.js
echo "🏗️  Building Next.js..."
npx next build

echo "✅ Build concluído com sucesso!"

