
-- Enable Extensions
create extension if not exists pgcrypto;

-- Tabela de Planos
create table if not exists public.planos (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  limite_pacientes integer default 100,
  preco_mensal decimal(10,2) not null,
  recursos jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

-- Tabela de Clínicas (Tenants)
create table if not exists public.clinicas (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text unique,
  cnpj text unique,
  plano_id uuid references public.planos(id),
  status text default 'trial' check (status in ('active', 'suspended', 'trial')),
  created_at timestamp with time zone default now()
);

-- Tabela de Usuários (Vinculados a Clínicas)
create table if not exists public.usuarios (
  id uuid references auth.users not null primary key,
  clinica_id uuid references public.clinicas(id),
  nome text not null,
  email text,
  role text not null check (role in ('superadmin', 'admin', 'doctor', 'assistant')),
  created_at timestamp with time zone default now()
);

-- Tabela de Pacientes
create table if not exists public.pacientes (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid references public.clinicas(id) not null,
  nome text not null,
  cpf text,
  data_nascimento date,
  telefone text,
  email text,
  lgpd_consent boolean default false,
  consent_date timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Tabela de Atendimentos
create table if not exists public.atendimentos (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid references public.clinicas(id) not null,
  paciente_id uuid references public.pacientes(id) not null,
  usuario_id uuid references public.usuarios(id) not null,
  data_hora timestamp with time zone not null,
  status text default 'scheduled' check (status in ('scheduled', 'confirmed', 'cancelled', 'completed')),
  tipo text,
  observacoes text,
  created_at timestamp with time zone default now()
);

-- Tabela de Documentos
create table if not exists public.documentos (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid references public.clinicas(id) not null,
  patient_id uuid references public.pacientes(id),
  user_id uuid references public.usuarios(id),
  nome text not null,
  tipo text,
  url text not null,
  created_at timestamp with time zone default now()
);

-- Tabela de Uso de Recursos
create table if not exists public.uso_recursos (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid references public.clinicas(id) not null,
  recurso_tipo text not null,
  quantidade_atual integer default 0,
  ultima_atualizacao timestamp with time zone default now(),
  unique(clinica_id, recurso_tipo)
);

-- Tabela de Auditoria
create table if not exists public.auditoria (
  id uuid primary key default gen_random_uuid(),
  clinica_id uuid references public.clinicas(id),
  usuario_id uuid references public.usuarios(id),
  acao text not null,
  entidade_tipo text not null,
  entidade_id uuid,
  dados_antigos jsonb,
  dados_novos jsonb,
  created_at timestamp with time zone default now()
);

-- Triggers para Sincronização de Uso de Recursos
create or replace function public.increment_resource_usage()
returns trigger as $$
begin
  insert into public.uso_recursos (clinica_id, recurso_tipo, quantidade_atual)
  values (new.clinica_id, tg_table_name, 1)
  on conflict (clinica_id, recurso_tipo)
  do update set quantidade_atual = uso_recursos.quantidade_atual + 1, ultima_atualizacao = now();
  return new;
end;
$$ language plpgsql;

create or replace trigger tr_increment_usage_pacientes
after insert on public.pacientes
for each row execute function public.increment_resource_usage();

create or replace trigger tr_increment_usage_atendimentos
after insert on public.atendimentos
for each row execute function public.increment_resource_usage();

create or replace trigger tr_increment_usage_documentos
after insert on public.documentos
for each row execute function public.increment_resource_usage();
