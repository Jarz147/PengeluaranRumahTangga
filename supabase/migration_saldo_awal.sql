-- ============================================================
-- Migrasi: Saldo Awal per bulan
-- Jalankan di: Dashboard Supabase > SQL Editor > New query
-- ============================================================
create table if not exists public.monthly_balances (
  month text primary key,
  saldo_awal numeric(14, 2) not null default  0,
  updated_at timestamptz not null default now()
);
alter table public.monthly_balances enable row level security;

drop policy if exists "mb_select" on public.monthly_balances;
create policy "mb_select" on public.monthly_balances
  for select to anon using (true);

drop policy if exists "mb_insert" on public.monthly_balances;create policy "mb_insert" on public.monthly_balances
  for insert to anon with check (true);

drop policy if exists "mb_update" on public.monthly_balances;create policy "mb_update" on public.monthly_balances
  for update to anon using (true) with check (true);