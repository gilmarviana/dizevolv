
-- Ativar RLS em todas as tabelas
alter table public.planos enable row level security;
alter table public.clinicas enable row level security;
alter table public.usuarios enable row level security;
alter table public.pacientes enable row level security;
alter table public.atendimentos enable row level security;
alter table public.documentos enable row level security;
alter table public.uso_recursos enable row level security;
alter table public.auditoria enable row level security;

-- Função auxiliar para obter o clinica_id do usuário logado
-- Usamos 'security definer' para burlar a RLS ao consultar a própria tabela usuarios
create or replace function public.get_user_clinica_id()
returns uuid as $$
  select clinica_id from public.usuarios where id = auth.uid();
$$ language sql security definer;

create or replace function public.is_superadmin()
returns boolean as $$
  select exists (
    select 1 from public.usuarios 
    where id = auth.uid() 
    and role = 'superadmin'
  );
$$ language sql security definer;

-- Políticas para 'planos' (Acesso público para leitura)
create policy "planos_select_all" on public.planos for select using (true);

-- Políticas para 'clinicas' (Apenas leitura da própria clínica)
create policy "clinicas_select_own" on public.clinicas for select using (id = public.get_user_clinica_id());
create policy "clinicas_update_own" on public.clinicas for update using (id = public.get_user_clinica_id());

-- Políticas para 'usuarios'
create policy "usuarios_select_own" on public.usuarios for select using (id = auth.uid());
create policy "usuarios_select_clinic" on public.usuarios for select using (clinica_id = public.get_user_clinica_id());
create policy "usuarios_update_own" on public.usuarios for update using (id = auth.uid());
create policy "usuarios_insert_clinic" on public.usuarios for insert with check (clinica_id = public.get_user_clinica_id());

-- Políticas para 'pacientes' (Multi-tenant por clinica_id)
create policy "pacientes_clinic_all" on public.pacientes for all using (clinica_id = public.get_user_clinica_id());

-- Políticas para 'atendimentos' (Multi-tenant por clinica_id)
create policy "atendimentos_clinic_all" on public.atendimentos for all using (clinica_id = public.get_user_clinica_id());

-- Políticas para 'documentos' (Multi-tenant por clinica_id)
create policy "documentos_clinic_all" on public.documentos for all using (clinica_id = public.get_user_clinica_id());

-- Políticas para 'uso_recursos' (Multi-tenant por clinica_id)
create policy "uso_recursos_clinic_all" on public.uso_recursos for all using (clinica_id = public.get_user_clinica_id());

-- Políticas para 'auditoria' (Apenas leitura e inserção de logs da própria clínica)
create policy "auditoria_select_clinic" on public.auditoria for select using (clinica_id = public.get_user_clinica_id());
create policy "auditoria_insert_clinic" on public.auditoria for insert with check (clinica_id = public.get_user_clinica_id());

-- Nota: Superadmins precisariam de políticas adicionais (usando role 'superadmin')
-- para ver todas as clínicas.
-- Superadmins
create policy "superadmin_all_clinicas" on public.clinicas for all 
using ( public.is_superadmin() );

create policy "superadmin_all_usuarios" on public.usuarios for all 
using ( public.is_superadmin() );

create policy "superadmin_all_planos" on public.planos for all 
using ( public.is_superadmin() );

create policy "superadmin_all_pacientes" on public.pacientes for all 
using ( public.is_superadmin() );

create policy "superadmin_all_atendimentos" on public.atendimentos for all 
using ( public.is_superadmin() );

create policy "superadmin_all_documentos" on public.documentos for all 
using ( public.is_superadmin() );

create policy "superadmin_all_uso_recursos" on public.uso_recursos for all 
using ( public.is_superadmin() );

create policy "superadmin_all_auditoria" on public.auditoria for all 
using ( public.is_superadmin() );

-- POLÍTICAS DE STORAGE (Storage RLS)
-- Nota: O nome do bucket deve ser 'medical-records'
insert into storage.buckets (id, name, public) 
values ('medical-records', 'medical-records', false)
on conflict (id) do nothing;

create policy "Clinic access to own medical records"
on storage.objects for all
using (
  bucket_id = 'medical-records' 
  and (storage.foldername(name))[1] = (select clinica_id::text from public.usuarios where id = auth.uid())
)
with check (
  bucket_id = 'medical-records' 
  and (storage.foldername(name))[1] = (select clinica_id::text from public.usuarios where id = auth.uid())
);
