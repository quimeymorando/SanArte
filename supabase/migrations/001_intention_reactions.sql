-- ════════════════════════════════════════════════════════════════════
-- Migration 001 — intention_reactions
-- Real per-user reactions for community intentions.
-- 4 types: love · hug · accompany · reverence
-- ════════════════════════════════════════════════════════════════════

-- ─── Tabla ────────────────────────────────────────────────────────────
create table if not exists public.intention_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intention_id uuid not null references public.intentions(id) on delete cascade,
  type text not null check (type in ('love', 'hug', 'accompany', 'reverence')),
  created_at timestamptz not null default now(),
  unique (user_id, intention_id, type)
);

-- ─── Índice para agregaciones rápidas (counts por intention/type) ────
create index if not exists intention_reactions_intention_type_idx
  on public.intention_reactions (intention_id, type);

-- ─── RLS ──────────────────────────────────────────────────────────────
alter table public.intention_reactions enable row level security;

-- SELECT: cualquier usuario autenticado puede leer todas
drop policy if exists "Anyone authenticated can read reactions" on public.intention_reactions;
create policy "Anyone authenticated can read reactions"
  on public.intention_reactions
  for select
  to authenticated
  using (true);

-- INSERT: solo a su propio nombre
drop policy if exists "Users can insert own reactions" on public.intention_reactions;
create policy "Users can insert own reactions"
  on public.intention_reactions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- DELETE: solo las propias
drop policy if exists "Users can delete own reactions" on public.intention_reactions;
create policy "Users can delete own reactions"
  on public.intention_reactions
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- (No UPDATE — un toggle es delete + insert)

-- ─── RPC: toggle_intention_reaction ──────────────────────────────────
-- Insert if missing, delete if present. Returns { active, total_count }.
create or replace function public.toggle_intention_reaction(
  p_intention_id uuid,
  p_type text
)
returns table (active boolean, total_count integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_existing_id uuid;
  v_now_active boolean;
  v_count integer;
begin
  if v_user is null then
    raise exception 'unauthenticated';
  end if;

  if p_type not in ('love', 'hug', 'accompany', 'reverence') then
    raise exception 'invalid reaction type: %', p_type;
  end if;

  select id into v_existing_id
  from public.intention_reactions
  where user_id = v_user
    and intention_id = p_intention_id
    and type = p_type;

  if v_existing_id is not null then
    delete from public.intention_reactions where id = v_existing_id;
    v_now_active := false;
  else
    insert into public.intention_reactions (user_id, intention_id, type)
    values (v_user, p_intention_id, p_type);
    v_now_active := true;
  end if;

  select count(*)::int into v_count
  from public.intention_reactions
  where intention_id = p_intention_id
    and type = p_type;

  return query select v_now_active, v_count;
end;
$$;

-- Permitir invocar la RPC desde el cliente autenticado
revoke all on function public.toggle_intention_reaction(uuid, text) from public;
grant execute on function public.toggle_intention_reaction(uuid, text) to authenticated;
