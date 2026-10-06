alter table public.profiles
  add column bio text not null default '',
  add column avatar_url text not null default '',
  add column google_review_link text not null default '',
  add column booking_link text not null default '',
  add column completed_at timestamptz;

alter table public.profiles
  add constraint profiles_full_name_length check (char_length(full_name) <= 100),
  add constraint profiles_salon_name_length check (char_length(salon_name) <= 120),
  add constraint profiles_bio_length check (char_length(bio) <= 500),
  add constraint profiles_phone_length check (char_length(phone) <= 30),
  add constraint profiles_city_length check (char_length(city) <= 100),
  add constraint profiles_links_length check (char_length(google_review_link) <= 500 and char_length(booking_link) <= 500 and char_length(avatar_url) <= 1000);

-- Existing profiles that already have a name count as created.
update public.profiles set completed_at = created_at where full_name <> '' and completed_at is null;
