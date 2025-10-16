# =================================
# OLV INTELLIGENT PROSPECTING SYSTEM
# Environment Variables Template
# =================================

# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-in-production

# =================================
# TIER 1 - APIs ESSENCIAIS (Começar AGORA)
# =================================

# ReceitaWS - Dados da Receita Federal (GRATUITO)
RECEITAWS_API_URL=https://www.receitaws.com.br/v1

# Hunter.io - Email Finder (50 GRÁTIS/mês, depois $49/mês)
HUNTER_API_KEY=
HUNTER_API_URL=https://api.hunter.io/v2

# OpenAI - IA para Insights (PAGO - $20/mês mínimo)
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_API_URL=https://api.openai.com/v1

# Google Custom Search - Pesquisas (100 GRÁTIS/dia)
GOOGLE_API_KEY=
GOOGLE_CSE_ID=
GOOGLE_SEARCH_URL=https://www.googleapis.com/customsearch/v1

# =================================
# TIER 2 - APIs IMPORTANTES (Próxima semana)
# =================================

# BuiltWith - Tech Stack Detection (PAGO - $295/mês)
BUILTWITH_API_KEY=
BUILTWITH_API_URL=https://api.builtwith.com/v21/api.json

# Wappalyzer - Tech Stack Alternative (PAGO - $149/mês)
WAPPALYZER_API_KEY=
WAPPALYZER_API_URL=https://api.wappalyzer.com/v2

# Apollo.io - Contact Intelligence (PAGO - $49/mês)
APOLLO_API_KEY=
APOLLO_API_URL=https://api.apollo.io/v1

# Clearbit - Company Enrichment (PAGO - $99/mês)
CLEARBIT_API_KEY=
CLEARBIT_API_URL=https://company.clearbit.com/v2

# =================================
# TIER 3 - APIs ENTERPRISE (Depois)
# =================================

# ZoomInfo - Contact Intelligence (PAGO - $14,995/ano)
ZOOMINFO_API_KEY=
ZOOMINFO_API_URL=https://api.zoominfo.com

# Serasa Experian - Dados Financeiros (PAGO - Cotação)
SERASA_API_KEY=
SERASA_API_URL=https://api.serasaexperian.com.br

# LinkedIn via RapidAPI (PAGO - variável)
RAPIDAPI_LINKEDIN_KEY=
RAPIDAPI_HOST=linkedin-data-api.p.rapidapi.com

