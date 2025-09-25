create extension if not exists "uuid-ossp";

create table if not exists public.session_responses (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_name text not null,
  player_name_search text generated always as (lower(player_name)) stored,
  email text,
  phone_whatsapp text,
  preferred_contact contact_type,
  status response_status,
  updated_at timestamptz default now()
);

create unique index if not exists session_responses_session_contact_key
  on public.session_responses (session_id, coalesce(email, phone_whatsapp, player_name_search));
