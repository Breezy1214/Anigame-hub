-- FR-14: users can opt in to a public profile. Profiles stay private until they do.
alter table public.profiles add column is_public boolean not null default false;

-- Anyone, signed in or not, can read a public profile and the list that belongs to it.
-- These add to the own-row policies; writes are still own-row only.
create policy "Anyone can read public profiles"
  on public.profiles for select to anon, authenticated
  using (is_public);

create policy "Anyone can read lists on public profiles"
  on public.user_media for select to anon, authenticated
  using (exists (select 1 from public.profiles p where p.id = user_media.user_id and p.is_public));
