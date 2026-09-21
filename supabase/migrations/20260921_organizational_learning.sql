-- Organizational learning licenses for TCF Learn.
-- Each learner seat includes both Turning Forward and Thought to Freedom.
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  purchaser_email text not null,
  owner_user_id uuid references auth.users(id) on delete set null,
  plan_key text not null check (plan_key in ('org-10','org-50','org-100')),
  seat_limit integer not null check (seat_limit in (10,50,100)),
  co_admin_limit integer not null default 0 check (co_admin_limit >= 0),
  status text not null default 'active' check (status in ('active','paused','cancelled')),
  amount_paid integer,
  currency text default 'usd',
  stripe_checkout_session_id text unique,
  stripe_customer_id text,
  stripe_payment_intent_id text,
  purchased_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  full_name text,
  role text not null check (role in ('admin','co_admin','learner')),
  status text not null default 'invited' check (status in ('invited','active','removed')),
  invite_token uuid,
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz not null default now(),
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create unique index if not exists organization_memberships_invite_token_idx
  on public.organization_memberships(invite_token) where invite_token is not null;
create index if not exists organization_memberships_user_id_idx
  on public.organization_memberships(user_id);
create index if not exists organization_memberships_org_role_status_idx
  on public.organization_memberships(organization_id, role, status);

create table if not exists public.organization_course_access (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_slug text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (organization_id, course_slug)
);

alter table public.enrollments
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;
create index if not exists enrollments_organization_id_idx on public.enrollments(organization_id);

create or replace function public.is_organization_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_memberships m
    where m.organization_id = target_org and m.user_id = auth.uid() and m.status = 'active'
  );
$$;

create or replace function public.is_organization_admin(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_memberships m
    where m.organization_id = target_org and m.user_id = auth.uid()
      and m.status = 'active' and m.role in ('admin','co_admin')
  );
$$;

create or replace function public.is_primary_organization_admin(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organization_memberships m
    where m.organization_id = target_org and m.user_id = auth.uid()
      and m.status = 'active' and m.role = 'admin'
  );
$$;

create or replace function public.enforce_organization_membership_capacity()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  org_record public.organizations%rowtype;
  used_count integer;
begin
  select * into org_record from public.organizations where id = new.organization_id for update;
  if org_record.id is null then raise exception 'Organization not found.'; end if;
  if new.status = 'removed' or new.role = 'admin' then return new; end if;

  if new.role = 'learner' then
    select count(*) into used_count from public.organization_memberships m
    where m.organization_id = new.organization_id and m.role = 'learner'
      and m.status <> 'removed' and (tg_op = 'INSERT' or m.id <> new.id);
    if used_count >= org_record.seat_limit then raise exception 'Organization learner seat limit reached.'; end if;
  elsif new.role = 'co_admin' then
    if org_record.co_admin_limit <= 0 then raise exception 'Co-admin access is not included with this organization plan.'; end if;
    select count(*) into used_count from public.organization_memberships m
    where m.organization_id = new.organization_id and m.role = 'co_admin'
      and m.status <> 'removed' and (tg_op = 'INSERT' or m.id <> new.id);
    if used_count >= org_record.co_admin_limit then raise exception 'Organization co-admin limit reached.'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_organization_membership_capacity_trigger on public.organization_memberships;
create trigger enforce_organization_membership_capacity_trigger
before insert or update of organization_id, role, status on public.organization_memberships
for each row execute function public.enforce_organization_membership_capacity();

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.organization_course_access enable row level security;

drop policy if exists "Organization members read organization" on public.organizations;
create policy "Organization members read organization" on public.organizations for select
using (public.is_organization_member(id));

drop policy if exists "Organization admins update organization" on public.organizations;
create policy "Organization admins update organization" on public.organizations for update
using (public.is_primary_organization_admin(id))
with check (public.is_primary_organization_admin(id));

drop policy if exists "Members read organization roster" on public.organization_memberships;
create policy "Members read organization roster" on public.organization_memberships for select
using (user_id = auth.uid() or public.is_organization_admin(organization_id));

drop policy if exists "Members read organization courses" on public.organization_course_access;
create policy "Members read organization courses" on public.organization_course_access for select
using (public.is_organization_member(organization_id));

drop policy if exists "Organization admins read learner progress" on public.course_progress;
create policy "Organization admins read learner progress" on public.course_progress for select
using (
  exists (
    select 1 from public.organization_memberships learner
    join public.organization_memberships manager on manager.organization_id = learner.organization_id
    where learner.user_id = course_progress.user_id and learner.role = 'learner'
      and learner.status = 'active' and manager.user_id = auth.uid()
      and manager.status = 'active' and manager.role in ('admin','co_admin')
  )
);

create or replace function public.require_paid_turning_forward_enrollment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not (
    exists (
      select 1 from public.enrollments
      where lower(purchaser_email) = lower(new.email)
        and course_slug = 'turning-forward' and active = true and payment_status = 'paid'
    )
    or exists (
      select 1 from public.organizations o
      where lower(o.purchaser_email) = lower(new.email) and o.status = 'active'
    )
    or exists (
      select 1 from public.organization_memberships m
      join public.organizations o on o.id = m.organization_id
      where lower(m.email) = lower(new.email) and m.status = 'invited' and o.status = 'active'
    )
  ) then
    raise exception 'A paid individual enrollment or active organization invitation is required before account creation.';
  end if;
  return new;
end;
$$;

comment on table public.organizations is 'Institutional TCF Learn licenses. Each license bundles Turning Forward and Thought to Freedom for the purchased learner seat count.';
comment on column public.organizations.seat_limit is 'Learner seats only. Primary admin and permitted co-admins do not consume learner seats.';
