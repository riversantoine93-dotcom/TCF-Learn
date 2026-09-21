-- Enforce one primary admin license separately from learner seats.
alter table public.organizations
  add column if not exists admin_license_limit integer not null default 1 check (admin_license_limit = 1);

create unique index if not exists organization_one_primary_admin_license_idx
  on public.organization_memberships(organization_id)
  where role = 'admin' and status <> 'removed';

insert into public.organization_memberships (
  organization_id,
  user_id,
  email,
  full_name,
  role,
  status,
  invited_at,
  accepted_at
)
select
  o.id,
  o.owner_user_id,
  lower(o.purchaser_email),
  null,
  'admin',
  case when o.owner_user_id is null then 'invited' else 'active' end,
  coalesce(o.purchased_at, now()),
  case when o.owner_user_id is null then null else coalesce(o.purchased_at, now()) end
from public.organizations o
where not exists (
  select 1
  from public.organization_memberships m
  where m.organization_id = o.id
    and m.role = 'admin'
    and m.status <> 'removed'
)
on conflict (organization_id, email) do nothing;

comment on column public.organizations.seat_limit is
  'Learner login license limit only. Primary admin and permitted co-admin accounts do not consume learner licenses.';

comment on column public.organizations.admin_license_limit is
  'Primary organization admin login licenses. TCF Learn organization plans reserve exactly one primary admin license for the purchaser.';
