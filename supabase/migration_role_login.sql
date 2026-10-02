-- ============================================================
-- Migrasi: login role-only (pilih role, tanpa email/password)
-- Jalankan di: Dashboard Supabase > SQL Editor > New query
-- Untuk database yang SUDAH ADA (data lama tetap aman)
-- ============================================================

-- 1. Perluas role agar bisa 'anak'
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('suami', 'istri', 'anak'));

-- 2. Seed 3 profil default
insert into public.profiles (id, display_name, role)
values
  ('11111111-1111-1111-1111-111111111111', 'Suami', 'suami'),
  ('22222222-2222-2222-2222-222222222222', 'Istri', 'istri'),
  ('33333333-3333-3333-3333-333333333333', 'Anak', 'anak')
on conflict (id) do nothing;

-- 3. Ubah FK expenses.created_by -> profiles.id (id profil lama = id user auth, jadi data lama tetap valid)

alter table public.expenses drop constraint if exists expenses_created_by_fkey;

alter table public.expenses add constraint expenses_created_by_fkey foreign key (created_by) references public.profiles(id) on delete cascade;


-- 4. Ubah FK activity_logs.user_id -> profiles.id
alter table public.activity_logs drop constraint if exists activity_logs_user_id_fkey;alter table public.activity_logs add constraint activity_logs_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;


-- 5. RLS: buka akses ke anon (tanpa login, semua anggota bisa baca/tulis)
-- profiles
drop policy if exists "profiles_select" on public.profiles;create policy "profiles_select" on public.profiles
  for select to anon using (true);
drop policy if exists "profiles_insert_anon" on public.profiles;create policy "profiles_insert_anon" on public.profiles
  for insert to anon with check (true);
drop policy if exists "profiles_update_anon" on public.profiles;create policy "profiles_update_anon" on public.profiles
  for update to anon using (true) with check (true);
-- hapus policy lama berbasis auth
drop policy if exists "profiles_insert_own" on public.profiles;drop policy if exists "profiles_update_own" on public.profiles;

-- expenses
drop policy if exists "expenses_select" on public.expenses;create policy "expenses_select" on public.expenses

  for select to anon using (true);
drop policy if exists "expenses_insert" on public.expenses;create policy "expenses_insert" on public.expenses




  for insert to anon with check (true);
drop policy if exists "expenses_update" on public.expenses;create policy "expenses_update" on public.expenses

  for update to anon using (true) with check (true);
drop policy if exists "expenses_delete" on public.expenses;create policy "expenses_delete" on public.expenses



  for delete to anon using (true);

-- activity_logs
drop policy if exists "activity_logs_select" on public.activity_logs;create policy "activity_logs_select" on public.activity_logs
  for select to anon using (true);


-- 6. Trigger: catat siapa dari kolom created_by (bukan auth.uid() lagi)
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
  v_uid := coalesce(new.created_by, old.created_by;

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