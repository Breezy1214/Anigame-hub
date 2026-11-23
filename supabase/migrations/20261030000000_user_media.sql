-- Media a user has saved to their list. Catalog details stay in the external APIs (NFR-9);
-- title and cover are copied here so lists render without an API call per row.
create table public.user_media (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  external_media_id text not null,
  media_type text not null check (media_type in ('anime', 'game')),
  title text not null,
  cover_url text,
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed', 'dropped')),
  rating smallint check (rating between 1 and 10),
  progress integer not null default 0 check (progress >= 0),
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, media_type, external_media_id)
);

create extension if not exists moddatetime schema extensions;

create trigger user_media_set_updated_at
  before update on public.user_media
  for each row execute procedure extensions.moddatetime(updated_at);

-- NFR-5: users can only read and change their own rows.
alter table public.user_media enable row level security;

create policy "Users can read their own media"
  on public.user_media for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Users can add their own media"
  on public.user_media for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "Users can update their own media"
  on public.user_media for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "Users can delete their own media"
  on public.user_media for delete to authenticated
  using (user_id = (select auth.uid()));
