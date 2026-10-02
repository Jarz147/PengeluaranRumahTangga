# Catatan Keuangan Keluarga 💰

Web sederhana untuk mencatat pengeluaran bulanan keluarga (Suami/Istri/Anak,, lengkap dengan:
- **Ringkasan**: total bulan ini, breakdown per anggota, dan pengeluaran per kategori.

- **Riwayat**: daftar semua transaksi (tambah/ubah/hapus).
- **Log Aktivitas**: otomatis mencatat siapa yang menambah,, mengubah,, atau menghapus pengeluaran.
- Login cukup **pilih role** (tanpa email/password.

## Arsitektur
- **Frontend**: HTML/CSS/JS statis (vanilla JS + supabase-js v2 via CDN).
- **Backend**: Supabase (PostgreSQL, tanpa Auth — akses terbuka untuk anggota keluarga).
- **Hosting**: Cloudflare Pages.

## Setup Supabase (sekali saja)

Jika project **baru**:
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → project kamu.
2. **SQL Editor** → **New query** → salin isi `supabase/schema.sql` → **Run**. Ini membuat tabel `profiles`, `expenses`, `activity_logs`, policy RLS, seed 3 profil role (Suami/Istri/Anak,, dan trigger log otomatis.



Jika project **sudah ada** (dipakai sebelumnya dengan login email):
- Jalankan isi `supabase/migration_role_login.sql` di **SQL Editor** → **Run**. Data lama tetap aman.



## Login (tanpa email/password)
- Buka halaman utama → pilih **Suami**, **Istri**, atau **Anak** → **Masuk**.
/ Coba di lokal
```bash
cd public
python -m http.server 8000
# buka http://localhost:8000
```

## Deploy ke Cloudflare Pages
- **Pakai Wrangler**: `npx wrangler pages deploy public --project-name=<nama-project>` (project name diambil dari subdomain `.pages.dev`)
- **Atau via dashboard**: upload folder `public/` sebagai "Direct Upload".
- **Atau via Git**: hubungkan repo → build command kosong → output dir `public`.

## Catatan Keamanan
- Tanpa login, semua data terbuka untuk siapa pun yang tahu URL aplikasi Anda. Gunakan hanya untuk keperluan keluarga sendiri. Supabase anon key memang publik — itu normal untuk client-side.