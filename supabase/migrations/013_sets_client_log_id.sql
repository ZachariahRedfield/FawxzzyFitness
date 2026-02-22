alter table public.sets
  add column if not exists client_log_id text null;

create unique index if not exists sets_client_log_id_unique_idx
  on public.sets (client_log_id)
  where client_log_id is not null;
