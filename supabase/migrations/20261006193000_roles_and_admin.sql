-- Roles (admin / employee / user), admin activity log, and admin functions.
-- Applied to project "glowback" via the Supabase connector (migrations roles_and_audit_log,
-- admin_functions, admin_perf_fixes). Recorded here for reference.

create type public.app_role as enum ('admin', 'employee', 'user');

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
alter table public.user_roles enable row level security;

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor_id uuid references auth.users (id) on delete set null,
  actor_email text,
  action text not null,
  target_id uuid,
  target_email text,
  details jsonb not null default '{}'::jsonb
);
alter table public.admin_audit_log enable row level security;
create index admin_audit_log_at_idx on public.admin_audit_log (at desc);
create index admin_audit_log_actor_id_idx on public.admin_audit_log (actor_id);
create index admin_audit_log_target_id_idx on public.admin_audit_log (target_id);
create index user_roles_updated_by_idx on public.user_roles (updated_by);

create function public.get_my_role() returns public.app_role
language sql stable security definer set search_path = '' as $$
  select coalesce((select role from public.user_roles where user_id = (select auth.uid())), 'user'::public.app_role);
$$;
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$ select public.get_my_role() = 'admin'; $$;
create function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$ select public.get_my_role() in ('admin', 'employee'); $$;
revoke execute on function public.get_my_role(), public.is_admin(), public.is_staff() from public, anon;
grant execute on function public.get_my_role(), public.is_admin(), public.is_staff() to authenticated;

create policy "Read own role, staff read all" on public.user_roles for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_staff()));
create policy "Staff can read the audit log" on public.admin_audit_log for select to authenticated
  using ((select public.is_staff()));
create policy "Staff can view all profiles" on public.profiles for select to authenticated
  using ((select public.is_staff()));
create policy "Admins can update any profile" on public.profiles for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

alter policy "Users can create their own profile" on public.profiles
  with check ((select auth.uid()) = id and email = ((select auth.jwt()) ->> 'email'));

insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'huynhbathang40@gmail.com'
on conflict (user_id) do update set role = 'admin', updated_at = now();

-- Guards and audit helper (internal; not callable by clients).
create function public._require_admin() returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Only administrators can do this.' using errcode = '42501'; end if;
end; $$;
create function public._require_staff() returns void language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_staff() then raise exception 'Only administrators and employees can see this.' using errcode = '42501'; end if;
end; $$;
create function public._audit(p_action text, p_target uuid, p_details jsonb default '{}'::jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.admin_audit_log (actor_id, actor_email, action, target_id, target_email, details)
  values ((select auth.uid()), (select email from auth.users where id = (select auth.uid())), p_action, p_target,
          (select email from auth.users where id = p_target), coalesce(p_details, '{}'::jsonb));
end; $$;
revoke execute on function public._require_admin(), public._require_staff(), public._audit(text, uuid, jsonb) from public, anon, authenticated;

-- Admin functions: admin_list_users, admin_set_role, admin_set_password, admin_set_banned,
-- admin_confirm_email, admin_sign_out_user, admin_update_profile, admin_system_status,
-- admin_signups_by_day. Each checks the caller's role first and writes to admin_audit_log.
-- Full definitions: see the "admin_functions" migration in the Supabase dashboard
-- (Database → Migrations), or `select pg_get_functiondef('public.admin_set_role'::regproc);`.
