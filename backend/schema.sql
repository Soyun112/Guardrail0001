-- Guardrail Supabase schema
-- Paste into: Supabase Dashboard → SQL Editor → Run

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  raw_input text not null,
  goal text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  verdict text not null check (verdict in ('green', 'amber', 'red')),
  reason jsonb not null default '{}'::jsonb,
  cause_type text,
  recommended_ai text not null default 'Gemini',
  guide text not null default '',
  order_index int not null default 0,
  client_task_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  member_id text not null check (member_id in ('A', 'B', 'C')),
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists tasks_project_id_idx on public.tasks(project_id);
create index if not exists assignments_task_id_idx on public.assignments(task_id);

alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.assignments enable row level security;

drop policy if exists "projects_select_own" on public.projects;
drop policy if exists "projects_insert_own" on public.projects;
drop policy if exists "projects_update_own" on public.projects;
drop policy if exists "projects_delete_own" on public.projects;

create policy "projects_select_own" on public.projects
  for select using (auth.uid() = user_id);
create policy "projects_insert_own" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.projects
  for update using (auth.uid() = user_id);
create policy "projects_delete_own" on public.projects
  for delete using (auth.uid() = user_id);

drop policy if exists "tasks_select_own" on public.tasks;
drop policy if exists "tasks_insert_own" on public.tasks;
drop policy if exists "tasks_update_own" on public.tasks;
drop policy if exists "tasks_delete_own" on public.tasks;

create policy "tasks_select_own" on public.tasks
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.user_id = auth.uid()
    )
  );
create policy "tasks_insert_own" on public.tasks
  for insert with check (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.user_id = auth.uid()
    )
  );
create policy "tasks_update_own" on public.tasks
  for update using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.user_id = auth.uid()
    )
  );
create policy "tasks_delete_own" on public.tasks
  for delete using (
    exists (
      select 1 from public.projects p
      where p.id = tasks.project_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "assignments_select_own" on public.assignments;
drop policy if exists "assignments_insert_own" on public.assignments;
drop policy if exists "assignments_delete_own" on public.assignments;

create policy "assignments_select_own" on public.assignments
  for select using (
    exists (
      select 1
      from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = assignments.task_id and p.user_id = auth.uid()
    )
  );
create policy "assignments_insert_own" on public.assignments
  for insert with check (
    exists (
      select 1
      from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = assignments.task_id and p.user_id = auth.uid()
    )
  );
create policy "assignments_delete_own" on public.assignments
  for delete using (
    exists (
      select 1
      from public.tasks t
      join public.projects p on p.id = t.project_id
      where t.id = assignments.task_id and p.user_id = auth.uid()
    )
  );
