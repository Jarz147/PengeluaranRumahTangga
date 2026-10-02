-- ============================================================
-- Catatan Keuangan Keluarga - Supabase Schema
-- Login tanpa email/password: pilih role (Suami/Istri/Anak)
 
-- Jalankan seluruh file ini di: Dashboard Supabase > SQL Editor > New query
-- Untuk database yang SUDAH ADA, jalankan supabase/migration_role_login.sql
-- ============================================================

-- ---------- EXPENSES ----------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  category text not null,
  expense_date date not null default current_date,
  created_by text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_date_idx on public.expenses (expense_date desc);
create index if not exists expenses_created_by_idx on public.expenses (created_by);


-- ---------- ACTIVITY LOGS ----------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  action text not null check (action in ('tambah', 'ubah', 'hapus')),
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);


-- ---------- TRIGGER: log otomatis setiap perubahan pengeluaran ----------
create or replace function public.log_expense_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text;
  v_desc text;
  v_amount text;
  v_uid text;
begin
  v_amount := to_char(coalesce(new.amount, old.amount), 'FM999G999G999G999');
  v_uid := coalesce(new.created_by, old.created_by);

  if tg_op = 'INSERT' then
    v_action := 'tambah';
    v_desc := new.description || ' (Rp ' || v_amount || ' - ' || new.category || ')';
  elsif tg_op = 'UPDATE' then
    v_action := 'ubah';
    v_desc := new.description || ' (Rp ' || v_amount || ' - ' || new.category || ')';
  elsif tg_op = 'DELETE' then
    v_action := 'hapus';
    v_desc := old.description || ' (Rp ' || v_amount || ' - ' || old.category || ')';
  end if;

  insert into public.activity_logs (user_id, action, description)
  values (v_uid, v_action, v_desc);

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_log_expense_activity on public.expenses;create trigger trg_log_expense_activity
after insert or update or delete on public.expenses
for each row execute function public.log_expense_activity();

-- ---------- SALDO AWAL ----------
create table if not exists public.monthly_balances (
  month text primary key,
  saldo_awal numeric(14, 2) not null default  0,
  updated_at timestamptz not null default now()
);
