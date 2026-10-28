-- ─────────────────────────────────────────────────────────────────────────────
-- AZXION CRM · Schema (Supabase / Postgres)
-- Idempotente: create ... if not exists. Se puede re-correr sin romper.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── EMPRESAS ────────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id           bigint generated always as identity primary key,
  name         text not null,
  industry     text,
  size         text,               -- micro, small, medium, large
  website      text,
  phone        text,
  email        text,
  address      text,
  city         text,
  state        text,
  country      text default 'MX',
  notes        text,
  tags         text[] default '{}',
  owner_id     uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── CONTACTOS ───────────────────────────────────────────────────────────────
create table if not exists public.contacts (
  id           bigint generated always as identity primary key,
  company_id   bigint references public.companies(id) on delete set null,
  first_name   text not null,
  last_name    text,
  email        text,
  phone        text,
  position     text,
  is_primary   boolean default false,
  tags         text[] default '{}',
  owner_id     uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ── PIPELINE STAGES ─────────────────────────────────────────────────────────
create table if not exists public.pipeline_stages (
  id           bigint generated always as identity primary key,
  name         text not null,
  position     integer not null default 0,
  probability  integer default 0,   -- 0-100%
  is_won       boolean default false,
  is_lost      boolean default false,
  color        text default '#6366f1',
  created_at   timestamptz not null default now()
);

insert into public.pipeline_stages (name, position, probability, color) values
  ('Nuevo',       0,  10, '#6366f1'),
  ('Calificado',  1,  30, '#8b5cf6'),
  ('Propuesta',   2,  60, '#a855f7'),
  ('Negociación', 3,  80, '#d946ef'),
  ('Ganado',      4, 100, '#22c55e'),
  ('Perdido',     5,   0, '#ef4444')
on conflict do nothing;

-- ── DEALS (oportunidades) ───────────────────────────────────────────────────
create table if not exists public.deals (
  id              bigint generated always as identity primary key,
  title           text not null,
  company_id      bigint references public.companies(id) on delete set null,
  contact_id      bigint references public.contacts(id) on delete set null,
  stage_id        bigint references public.pipeline_stages(id) on delete set null,
  amount          numeric default 0,
  currency        text default 'MXN',
  probability     integer default 10,
  expected_close  date,
  source          text,              -- web, referral, cold, ad, event
  lost_reason     text,
  notes           text,
  tags            text[] default '{}',
  owner_id        uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ── ACTIVIDADES ─────────────────────────────────────────────────────────────
create table if not exists public.activities (
  id           bigint generated always as identity primary key,
  deal_id      bigint references public.deals(id) on delete cascade,
  contact_id   bigint references public.contacts(id) on delete set null,
  type         text not null,         -- call, email, meeting, task, note, whatsapp
  title        text not null,
  description  text,
  due_date     timestamptz,
  done         boolean default false,
  done_at      timestamptz,
  owner_id     uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

-- ── PRODUCTOS (para cotizaciones) ───────────────────────────────────────────
create table if not exists public.products (
  id           bigint generated always as identity primary key,
  name         text not null,
  description  text,
  price        numeric not null default 0,
  currency     text default 'MXN',
  unit         text default 'pieza',
  active       boolean default true,
  created_at   timestamptz not null default now()
);

-- ── COTIZACIONES ────────────────────────────────────────────────────────────
create table if not exists public.quotes (
  id           bigint generated always as identity primary key,
  deal_id      bigint references public.deals(id) on delete cascade,
  contact_id   bigint references public.contacts(id) on delete set null,
  number       text unique,           -- COT-0001
  status       text default 'draft',  -- draft, sent, accepted, rejected
  subtotal     numeric default 0,
  tax_rate     numeric default 16,
  tax          numeric default 0,
  total        numeric default 0,
  valid_until  date,
  notes        text,
  owner_id     uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.quote_lines (
  id           bigint generated always as identity primary key,
  quote_id     bigint references public.quotes(id) on delete cascade,
  product_id   bigint references public.products(id) on delete set null,
  description  text,
  quantity     numeric default 1,
  unit_price   numeric default 0,
  discount     numeric default 0,     -- percentage
  subtotal     numeric default 0,
  position     integer default 0
);

-- ── TIMELINE (chatter / log de interacciones) ───────────────────────────────
create table if not exists public.timeline (
  id           bigint generated always as identity primary key,
  deal_id      bigint references public.deals(id) on delete cascade,
  contact_id   bigint references public.contacts(id) on delete set null,
  type         text not null,         -- stage_change, note, email, call, system
  content      text,
  metadata     jsonb default '{}',
  author_id    uuid references auth.users(id),
  created_at   timestamptz not null default now()
);

-- ── INDICES ─────────────────────────────────────────────────────────────────
create index if not exists idx_deals_stage on public.deals(stage_id);
create index if not exists idx_deals_owner on public.deals(owner_id);
create index if not exists idx_deals_company on public.deals(company_id);
create index if not exists idx_activities_deal on public.activities(deal_id);
create index if not exists idx_activities_due on public.activities(due_date) where not done;
create index if not exists idx_timeline_deal on public.timeline(deal_id);
create index if not exists idx_contacts_company on public.contacts(company_id);
create index if not exists idx_quotes_deal on public.quotes(deal_id);

-- ── RLS ─────────────────────────────────────────────────────────────────────
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_lines enable row level security;
alter table public.timeline enable row level security;
alter table public.products enable row level security;
alter table public.pipeline_stages enable row level security;

create policy if not exists "Users see own data" on public.deals
  for all using (owner_id = auth.uid());
create policy if not exists "Users see own data" on public.companies
  for all using (owner_id = auth.uid());
create policy if not exists "Users see own data" on public.contacts
  for all using (owner_id = auth.uid());
create policy if not exists "Users see own data" on public.activities
  for all using (owner_id = auth.uid());
create policy if not exists "Users see own data" on public.quotes
  for all using (owner_id = auth.uid());
create policy if not exists "Users see own lines" on public.quote_lines
  for all using (
    quote_id in (select id from public.quotes where owner_id = auth.uid())
  );
create policy if not exists "Users see own timeline" on public.timeline
  for all using (
    deal_id in (select id from public.deals where owner_id = auth.uid())
  );
create policy if not exists "All see products" on public.products
  for select using (true);
create policy if not exists "All see stages" on public.pipeline_stages
  for select using (true);

-- ── FUNCIÓN: auto-update updated_at ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  create trigger trg_companies_updated before update on public.companies
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_contacts_updated before update on public.contacts
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_deals_updated before update on public.deals
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;

do $$ begin
  create trigger trg_quotes_updated before update on public.quotes
    for each row execute function public.set_updated_at();
exception when duplicate_object then null;
end $$;
