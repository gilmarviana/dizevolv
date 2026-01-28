# ClinicOps - Plataforma SaaS de Gestão de Clínicas

## Sobre
ClinicOps é uma plataforma SaaS Multi-tenant desenvolvida para o desafio Dizevolv.

## Stack
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Shadcn UI
- **Backend:** Supabase (Auth, Postgres, RLS)

## Configuração

### 1. Instalação
```bash
npm install
```

### 2. Variáveis de Ambiente
O arquivo `.env` já deve conter suas credenciais do Supabase:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### 3. Banco de Dados (Supabase)
Como a conexão automática via MCP não foi possível, execute os scripts SQL manualmente no [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql):

1.  Copie o conteúdo de `supabase/schema.sql` e execute para criar as tabelas.
2.  Copie o conteúdo de `supabase/rls.sql` e execute para habilitar as políticas de segurança (Row Level Security).

### 4. Rodar o Projeto
```bash
npm run dev
```

## Funcionalidades
- **Landing Page:** `/`
- **Autenticação:** Login e Cadastro de Clínicas (`/auth/login`, `/auth/register`)
- **Dashboard:** `/dashboard` (Protegido)
- **Pacientes:** Listagem e Cadastro com isolamento por clínica (RLS).

## Testes Automatizados

Esta plataforma utiliza Vitest para testes unitários e Playwright para testes de ponta a ponta (E2E).

```bash
# Executar testes unitários
npm test

# Executar testes unitários com interface visual
npm run test:ui

# Executar testes E2E (Playwright)
npx playwright test
```
