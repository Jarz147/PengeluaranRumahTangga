-- ============================================================
-- Migrasi: login role-only (pilih role, tanpa email/password)
-- Untuk database yang SUDAH ADA (model: created_by/user_id teks role)
-- Jalankan di: Dashboard Supabase > SQL Editor > New query
-- ============================================================

-- 1. Hapus kemungkinan check constraint lama yang membatasi role (agar 'anak' bisa dipakai)
alter table public.expenses drop constraint if exists expenses_created_by_check;
alter table public.expenses drop constraint if exists expenses_created_by_fkey;
alter table public.activity_logs drop constraint if exists activity_logs_user_id_check;alter table public.activity_logs drop constraint if exists activity_logs_user_id_fkey;


-- 2. Pastikan trigger log mencatat dari kolom created_by/user_id (teks role), bukan auth)
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