-- Security/performance hardening for organizational learning helpers.
create index if not exists organizations_owner_user_id_idx on public.organizations(owner_user_id);
create index if not exists organization_memberships_invited_by_idx on public.organization_memberships(invited_by);

revoke all on function public.enforce_organization_membership_capacity() from public;
revoke all on function public.enforce_organization_membership_capacity() from anon;
revoke all on function public.enforce_organization_membership_capacity() from authenticated;

revoke all on function public.is_organization_member(uuid) from public;
revoke all on function public.is_organization_member(uuid) from anon;
grant execute on function public.is_organization_member(uuid) to authenticated;

revoke all on function public.is_organization_admin(uuid) from public;
revoke all on function public.is_organization_admin(uuid) from anon;
grant execute on function public.is_organization_admin(uuid) to authenticated;

revoke all on function public.is_primary_organization_admin(uuid) from public;
revoke all on function public.is_primary_organization_admin(uuid) from anon;
grant execute on function public.is_primary_organization_admin(uuid) to authenticated;
