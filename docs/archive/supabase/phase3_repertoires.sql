-- =====================================================================
-- ChessmateTheory — Phase 3 : synchronisation cloud des répertoires
-- Projet : owatqazpopcnwaxdniqp
-- À exécuter dans « SQL Editor » (après phase2_schema.sql). Idempotent : relançable.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Table user_repertoires : un répertoire = une ligne
--
--    Clé (user_id, id) : l'identifiant est généré par l'appareil (UUID) et sert de cible à
--    l'upsert (onConflict: 'user_id,id'). Le type `text` tolère aussi l'identifiant de secours
--    des navigateurs sans crypto.randomUUID.
--
--    data (JSONB) : { "version": 1, "children": [arbre des variantes], "comment": "…",
--    "origin": {…} }. Le nom, la couleur, la catégorie et l'interrupteur « en révision »
--    restent en colonnes pour pouvoir être filtrés sans lire l'arbre.
--
--    updated_at : horodatage d'édition FOURNI PAR L'APPAREIL (et non l'heure d'arrivée sur le
--    serveur) : c'est lui qui départage deux appareils (voir le déclencheur plus bas).
--    deleted_at : suppression « douce ». Une suppression est une version comme une autre :
--    elle porte un updated_at, donc une édition plus récente d'un autre appareil l'emporte.
-- ---------------------------------------------------------------------
create table if not exists public.user_repertoires (
  user_id         uuid        not null references auth.users (id) on delete cascade,
  id              text        not null check (char_length(id) between 1 and 64),
  name            text        not null check (char_length(name) between 1 and 80),
  side            text        not null check (side in ('white', 'black')),
  category        text        check (category is null or char_length(category) between 1 and 60),
  review_enabled  boolean     not null default true,
  data            jsonb       not null default '{"version": 1, "children": []}'::jsonb
                  check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 3145728),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz,
  primary key (user_id, id)
);

create index if not exists user_repertoires_live_idx
  on public.user_repertoires (user_id, updated_at desc)
  where deleted_at is null;

-- ---------------------------------------------------------------------
-- 2) Déclencheur de cohérence : « la version la plus récente gagne », côté serveur
--
--    Sans cette garde, un appareil resté hors ligne écraserait au retour une modification
--    plus récente faite ailleurs (le dernier ARRIVÉ gagnerait, pas le dernier ÉDITÉ).
--
--    - une version plus ancienne que celle du cloud est ignorée sans erreur
--      (retourner NULL annule l'UPDATE de cette ligne seulement) ;
--    - l'horodatage est plafonné à « maintenant + 5 minutes » : un appareil dont l'horloge est
--      très en avance ne peut pas gagner à vie tous les conflits ;
--    - created_at et user_id ne changent jamais après la création.
-- ---------------------------------------------------------------------
create or replace function public.user_repertoires_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := least(new.updated_at, now() + interval '5 minutes');
  if new.deleted_at is not null then
    new.deleted_at := least(new.deleted_at, new.updated_at);
  end if;

  if tg_op = 'UPDATE' then
    if new.updated_at < old.updated_at then
      return null;
    end if;
    new.created_at := old.created_at;
    new.user_id := old.user_id;
  end if;

  return new;
end;
$$;

drop trigger if exists user_repertoires_guard on public.user_repertoires;
create trigger user_repertoires_guard
  before insert or update on public.user_repertoires
  for each row execute function public.user_repertoires_guard();

-- ---------------------------------------------------------------------
-- 3) Row Level Security : chacun ne voit et n'écrit que ses propres répertoires
--    Pas de politique DELETE : l'application ne supprime jamais une ligne (suppression
--    douce par UPDATE) ; les données disparaissent avec le compte (on delete cascade).
-- ---------------------------------------------------------------------
alter table public.user_repertoires enable row level security;

drop policy if exists "user_repertoires_select_own" on public.user_repertoires;
create policy "user_repertoires_select_own" on public.user_repertoires
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "user_repertoires_insert_own" on public.user_repertoires;
create policy "user_repertoires_insert_own" on public.user_repertoires
  for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "user_repertoires_update_own" on public.user_repertoires;
create policy "user_repertoires_update_own" on public.user_repertoires
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------
-- 4) Privilèges d'API explicites : les invités (rôle anon) n'ont aucun accès
-- ---------------------------------------------------------------------
revoke all on public.user_repertoires from anon;
revoke all on public.user_repertoires from authenticated;
grant select, insert, update on public.user_repertoires to authenticated;
