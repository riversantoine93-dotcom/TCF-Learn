create table if not exists public.platform_super_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.platform_super_admins enable row level security;

insert into public.platform_super_admins (user_id,email,active)
select id, lower(email), true
from auth.users
where lower(email)=lower('theconvictionfictionpodcast@gmail.com')
on conflict (user_id) do update set email=excluded.email, active=true;

create table if not exists public.organization_license_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.organization_license_events enable row level security;
create index if not exists organization_license_events_org_created_idx
  on public.organization_license_events(organization_id, created_at desc);

alter table public.organizations
  add column if not exists payment_source text,
  add column if not exists external_payment_reference text,
  add column if not exists stripe_invoice_id text,
  add column if not exists license_notes text;

create unique index if not exists organizations_stripe_invoice_id_idx
  on public.organizations(stripe_invoice_id)
  where stripe_invoice_id is not null;

create or replace function public.is_platform_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.platform_super_admins s
    where s.user_id = auth.uid()
      and s.active = true
  );
$$;

revoke all on function public.is_platform_super_admin() from public;
revoke all on function public.is_platform_super_admin() from anon;
grant execute on function public.is_platform_super_admin() to authenticated;

drop policy if exists "Super admins read allowlist" on public.platform_super_admins;
create policy "Super admins read allowlist"
on public.platform_super_admins for select
using (public.is_platform_super_admin());

drop policy if exists "Super admins read license events" on public.organization_license_events;
create policy "Super admins read license events"
on public.organization_license_events for select
using (public.is_platform_super_admin());

comment on table public.platform_super_admins is
  'Private allowlist for TCF Learn platform-level super administrators.';
comment on table public.organization_license_events is
  'Audit trail for organization license, activation, invoice, status, invite, and password reset actions.';
