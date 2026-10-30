-- Game progress is a completion percentage; anime progress is episodes watched (no fixed upper bound).
alter table public.user_media
  add constraint user_media_game_progress_percent check (media_type <> 'game' or progress <= 100);
