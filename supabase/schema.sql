-- ============================================================
-- Catatan Keuangan Keluarga - Supabase Schema
-- Login tanpa email/password: pilih role (Suami/Istri/Anak)
 
-- Jalankan seluruh file ini di: Dashboard Supabase > SQL Editor > New query
-- Untuk database yang SUDAH ADA, jalankan supabase/migration_role_login.sql
-- ============================================================

-- ---------- PROFILES ----------
create table if not exists public.profiles (
  id uuid primary key,
  display_name text not null,
  role text not null check (role in ('suami', 'istri', 'anak')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;

create policy "profiles_select" on public.profiles
  for select to anon using (true);

drop policy if exists "profiles_insert_anon" on public.profiles;

create policy "profiles_insert_anon" on public.profiles
  for insert to anon with check (true);

drop policy if exists "profiles_update_anon" on public.profiles;



create policy "profiles_update_anon" on public.profiles
  for update to anon using (true) with check (true);


-- Seed profil default (role-only login, tanpa akun email)
insert into public.profiles (id, display_name, role)
values
  ('11111111-1111-1111-1111-111111111111', 'Suami', 'suami'),
  ('22222222-2222-2222-2222-222222222222', 'Istri', 'istri'),
  ('33333333-3333-3333-3333-333333333333', 'Anak', 'anak')
on conflict (id) do nothing;


-- ---------- EXPENSES ----------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  category text not null,
  expense_date date not null default current_date,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create index if not exists expenses_date_idx on public.expenses (expense_date desc);
create index if not exists expenses_created_by_idx on public.expenses (created_by);


alter table public.expenses enable row level security;

-- Semua anggota berbagi akses penuh ke semua pengeluaran (satu rumah tangga)
drop policy if exists "expenses_select" on public.expenses;create policy "expenses_select" on public.expenses
  for select to anon using (true);

drop policy if exists "expenses_insert" on public.expenses;create policy "expenses_insert" on public.expenses
  for insert to anon with check (true);

drop policy if exists "expenses_update" on public.expenses;create policy "expenses_update" on public.expenses
  for update to anon using (true) with check (true);

drop policy if exists "expenses_delete" on public.expenses;create policy "expenses_delete" on public.expenses
  for delete to anon using (true);


-- ---------- ACTIVITY LOGS ----------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('tambah', 'ubah', 'hapus')),
  description text not null,
  created_at timestamptz not null default now()
);

create index if not exists activity_logs_created_at_idx on public.activity_logs (created_at desc);

alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs_select" on public.activity_logs;create policy "activity_logs_select" on public.activity_logs
  for select to anon using (true);


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
  v_uid uuid;
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