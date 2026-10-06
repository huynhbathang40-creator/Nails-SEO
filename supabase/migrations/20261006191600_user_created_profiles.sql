-- Each user creates their own profile in the app ("Create your profile").

-- Sign-up no longer inserts a profile row.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  return new;
end;
$$;
comment on function public.handle_new_user() is 'Intentionally empty: users create their own profile in the app.';

-- Users may only create a profile for themselves, using their own sign-in email.
alter policy "Users can insert their own profile" on public.profiles
  with check ((select auth.uid()) = id and email = (select auth.jwt() ->> 'email'));
alter policy "Users can insert their own profile" on public.profiles rename to "Users can create their own profile";

create policy "Users can delete their own profile"
  on public.profiles for delete to authenticated
  using ((select auth.uid()) = id);

-- id, email and created_at can't be changed through profile updates.
create or replace function public.profiles_protect_fields()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.id = old.id;
  new.email = old.email;
  new.created_at = old.created_at;
  return new;
end;
$$;

create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.profiles_protect_fields();

-- Profile photos: public read; each user writes only in their own folder (avatars/<user id>/...).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can update their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can remove their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can read their own avatar files"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
