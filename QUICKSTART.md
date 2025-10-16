# 🚀 QUICKSTART - OLV Intelligence Platform

## ⚠️ PROBLEMA IDENTIFICADO

O Next.js está tendo problemas com o caminho que contém espaços:
```
C:\Projects\OLV Intelligent Prospecting System
```

## ✅ SOLUÇÃO RÁPIDA

### Opção 1: Renomear a Pasta (RECOMENDADO)
```powershell
# No PowerShell, execute:
cd C:\Projects
Rename-Item "OLV Intelligent Prospecting System" "olv-intelligence-platform"
cd olv-intelligence-platform
```

### Opção 2: Clonar do GitHub em Nova Pasta
```powershell
cd C:\Projects
git clone https://github.com/OLVCORE/olv-itelligence-prospect.git
cd olv-itelligence-prospect
```

## 📋 DEPOIS DE RESOLVER O CAMINHO

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Ambiente
```bash
# Copiar .env.example para .env.local (se existir)
# Ou criar .env.local com suas credenciais
```

### 3. Configurar Banco de Dados
```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

### 4. Iniciar Servidor
```bash
npm run dev
```

## 🔑 CREDENCIAIS DE LOGIN

Depois de rodar o seed:
- **Admin:** admin@olv.com / admin123
- **Editor:** editor@olv.com / editor123
- **Viewer:** viewer@olv.com / viewer123

## 📦 COMMIT ATUAL

**SHA:** `d10280d`
**Branch:** `main`
**Remote:** https://github.com/OLVCORE/olv-itelligence-prospect

## 🆘 SE AINDA HOUVER PROBLEMAS

1. Limpar cache do Next.js:
```bash
rm -rf .next
```

2. Reinstalar dependências:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Verificar versão do Node:
```bash
node -v  # Deve ser >= 18.17.0
```

## 📞 PRÓXIMOS PASSOS

Após o servidor rodar com sucesso:
1. Acessar http://localhost:3000
2. Fazer login
3. Testar busca de empresas por CNPJ
4. Verificar análise com dados reais
5. Reportar qualquer erro via commit SHA + log

