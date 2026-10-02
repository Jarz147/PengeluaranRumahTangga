-- ============================================================
-- Migrasi: Saldo Awal per bulan
-- Jalankan di: Dashboard Supabase > SQL Editor > New query
-- ============================================================
create table if not exists public.monthly_balances (
  month text primary key,
  saldo_awal numeric(14, 2) not null default  0,
  updated_at timestamptz not null default now()
);