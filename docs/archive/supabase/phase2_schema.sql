-- =====================================================================
-- ChessmateTheory — Phase 2 : schéma Supabase (auth + persistance cloud)
-- Projet : owatqazpopcnwaxdniqp
-- À exécuter dans « SQL Editor ». Le script est idempotent : on peut le relancer.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Fonction utilitaire : maintient updated_at à chaque UPDATE
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 1) profiles : 1 ligne par utilisateur, créée automatiquement à l'inscription
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Création automatique du profil (Google fournit full_name/name + avatar_url/picture)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Cette fonction ne doit pas être appelable depuis l'API : seul le trigger l'utilise.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rattrapage : crée le profil des utilisateurs déjà inscrits avant ce script
insert into public.profiles (id, email, full_name, avatar_url)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name'),
  coalesce(u.raw_user_meta_data ->> 'avatar_url', u.raw_user_meta_data ->> 'picture')
from auth.users u
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- 2) user_positions : une « fiche » Leitner par position (clé FEN) et par utilisateur
--    La clé primaire (user_id, position_key) EST la contrainte d'unicité demandée
--    et sert de cible à l'upsert (onConflict: 'user_id,position_key').
-- ---------------------------------------------------------------------
create table if not exists public.user_positions (
  user_id          uuid        not null references auth.users (id) on delete cascade,
  position_key     text        not null check (char_length(position_key) between 1 and 100),
  fen              text        not null check (char_length(fen) between 1 and 100),
  box              smallint    not null default 1 check (box between 1 and 5),
  next_review_at   timestamptz not null default now(),
  last_reviewed_at timestamptz,
  attempts         integer     not null default 0 check (attempts >= 0),
  failures         integer     not null default 0 check (failures >= 0),
  -- 5 derniers résultats (1 = juste du premier coup, 0 = raté) : nourrit le bonus
  -- d'échecs récents de l'urgence ; sans eux, la priorisation serait dégradée.
  recent_results   smallint[]  not null default '{}'
                   check (cardinality(recent_results) <= 5
                          and recent_results <@ array[0, 1]::smallint[]),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  primary key (user_id, position_key)
);

create index if not exists user_positions_due_idx
  on public.user_positions (user_id, next_review_at);

drop trigger if exists user_positions_set_updated_at on public.user_positions;
create trigger user_positions_set_updated_at
  before update on public.user_positions
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 3) user_chapters : état des chapitres par utilisateur
--    completed_at        : chapitre terminé en mode Masterclass
--    added_to_review_at  : chapitre ajouté aux révisions (détermine le graphe de révision)
--    Une ligne existe dès que l'un des deux est renseigné.
-- ---------------------------------------------------------------------
create table if not exists public.user_chapters (
  user_id             uuid        not null references auth.users (id) on delete cascade,
  chapter_id          text        not null check (char_length(chapter_id) between 1 and 100),
  completed_at        timestamptz,
  added_to_review_at  timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  primary key (user_id, chapter_id)
);

drop trigger if exists user_chapters_set_updated_at on public.user_chapters;
create trigger user_chapters_set_updated_at
  before update on public.user_chapters
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- 4) Row Level Security : chacun ne voit et n'écrit que ses propres lignes
--    (select auth.uid()) est évalué une seule fois par requête (meilleures perfs).
-- ---------------------------------------------------------------------
alter table public.profiles       enable row level security;
alter table public.user_positions enable row level security;
alter table public.user_chapters  enable row level security;

-- profiles : lecture / création / modification de SON profil (pas de DELETE :
-- le profil disparaît avec le compte, via on delete cascade)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- user_positions : SELECT / INSERT / UPDATE (upsert) + DELETE (réinitialiser sa progression)
drop policy if exists "user_positions_select_own" on public.user_positions;
create policy "user_positions_select_own" on public.user_positions
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "user_positions_insert_own" on public.user_positions;
create policy "user_positions_insert_own" on public.user_positions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "user_positions_update_own" on public.user_positions;
create policy "user_positions_update_own" on public.user_positions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "user_positions_delete_own" on public.user_positions;
create policy "user_positions_delete_own" on public.user_positions
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- user_chapters : mêmes règles (DELETE : retirer un chapitre des révisions)
drop policy if exists "user_chapters_select_own" on public.user_chapters;
create policy "user_chapters_select_own" on public.user_chapters
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "user_chapters_insert_own" on public.user_chapters;
create policy "user_chapters_insert_own" on public.user_chapters
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "user_chapters_update_own" on public.user_chapters;
create policy "user_chapters_update_own" on public.user_chapters
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "user_chapters_delete_own" on public.user_chapters;
create policy "user_chapters_delete_own" on public.user_chapters
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 5) Privilèges d'API explicites
--    Les invités utilisent uniquement le localStorage : le rôle anon n'a aucun accès.
-- ---------------------------------------------------------------------
revoke all on public.profiles       from anon;
revoke all on public.user_positions from anon;
revoke all on public.user_chapters  from anon;

grant select, insert, update         on public.profiles       to authenticated;
grant select, insert, update, delete on public.user_positions to authenticated;
grant select, insert, update, delete on public.user_chapters  to authenticated;
