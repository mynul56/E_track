create extension if not exists "pgcrypto";

create table if not exists public.user_roles (
  user_id uuid primary key,
  email text,
  app_role text not null check (app_role in ('admin', 'team_leader', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  team_name text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  employee_code text not null unique,
  team_id uuid not null references public.teams(id) on delete cascade,
  role text not null check (role in ('admin', 'team_leader', 'viewer', 'employee')),
  status text not null check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company_name text not null,
  contact_info text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  client_id uuid not null references public.clients(id) on delete restrict,
  order_id text not null unique,
  team_id uuid not null references public.teams(id) on delete cascade,
  project_type text not null check (project_type in ('milestone', 'full')),
  total_milestones integer not null default 1,
  current_milestone integer not null default 0,
  deadline timestamptz not null,
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  status text not null check (status in ('on_track', 'blocked', 'delayed', 'completed')),
  progress integer not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.project_employees (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  unique (project_id, employee_id)
);

create table if not exists public.daily_updates (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  date timestamptz not null,
  raw_text text not null,
  parsed_json jsonb not null default '{}'::jsonb,
  progress_percentage integer not null default 0 check (progress_percentage between 0 and 100),
  priority text not null check (priority in ('low', 'medium', 'high', 'critical')),
  risk_level text not null check (risk_level in ('low', 'medium', 'high', 'critical')),
  blockers text[] not null default '{}',
  next_actions text[] not null default '{}',
  client_status text not null default '',
  notes text not null default '',
  quality_rating integer not null default 5 check (quality_rating between 1 and 10),
  created_at timestamptz not null default now()
);

create table if not exists public.blockers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  description text not null,
  status text not null check (status in ('open', 'resolved')),
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  daily_update_id uuid not null references public.daily_updates(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.employee_scores (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null unique references public.employees(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  total_score integer not null default 0,
  progress_score integer not null default 0,
  update_consistency_score integer not null default 0,
  blocker_resolution_score integer not null default 0,
  deadline_score integer not null default 0,
  quality_score integer not null default 0,
  collaboration_score integer not null default 0,
  last_calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  trend text not null default 'same' check (trend in ('up', 'down', 'same'))
);

create table if not exists public.score_history (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  score_before integer not null,
  score_after integer not null,
  score_change integer not null,
  reason text not null,
  source_type text not null check (source_type in ('daily_update', 'manual_adjustment', 'system_rule')),
  source_id uuid not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_employees_team_id on public.employees(team_id);
create index if not exists idx_projects_team_id on public.projects(team_id);
create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_daily_updates_team_id on public.daily_updates(team_id);
create index if not exists idx_daily_updates_employee_id on public.daily_updates(employee_id);
create index if not exists idx_daily_updates_project_id on public.daily_updates(project_id);
create index if not exists idx_blockers_team_id on public.blockers(team_id);
create index if not exists idx_score_history_employee_id on public.score_history(employee_id);
create index if not exists idx_user_roles_app_role on public.user_roles(app_role);

alter table public.user_roles enable row level security;
alter table public.teams enable row level security;
alter table public.employees enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.project_employees enable row level security;
alter table public.daily_updates enable row level security;
alter table public.blockers enable row level security;
alter table public.attachments enable row level security;
alter table public.employee_scores enable row level security;
alter table public.score_history enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and app_role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_roles_set_updated_at on public.user_roles;
create trigger trg_user_roles_set_updated_at
before update on public.user_roles
for each row
execute function public.set_updated_at();

drop policy if exists "users can read own role" on public.user_roles;
create policy "users can read own role" on public.user_roles
for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "admins manage user_roles" on public.user_roles;
create policy "admins manage user_roles" on public.user_roles
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage teams" on public.teams;
create policy "admins manage teams" on public.teams
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage employees" on public.employees;
create policy "admins manage employees" on public.employees
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage clients" on public.clients;
create policy "admins manage clients" on public.clients
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage projects" on public.projects;
create policy "admins manage projects" on public.projects
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage project_employees" on public.project_employees;
create policy "admins manage project_employees" on public.project_employees
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage daily_updates" on public.daily_updates;
create policy "admins manage daily_updates" on public.daily_updates
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage blockers" on public.blockers;
create policy "admins manage blockers" on public.blockers
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage attachments" on public.attachments;
create policy "admins manage attachments" on public.attachments
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage employee_scores" on public.employee_scores;
create policy "admins manage employee_scores" on public.employee_scores
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins manage score_history" on public.score_history;
create policy "admins manage score_history" on public.score_history
for all using (public.is_admin()) with check (public.is_admin());
