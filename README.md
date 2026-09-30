# Catatan Keuangan Keluarga 💰

Web sederhana untuk mencatat pengeluaran bulanan suami & istri, lengkap dengan:
- **Ringkasan**: total bulan ini, breakdown Suami vs Istri, dan pengeluaran per kategori.
- **Riwayat**: daftar semua transaksi (tambah/ubah/hapus).
- **Log Aktivitas**: otomatis mencatat siapa yang menambah, mengubah, atau menghapus pengeluaran.
- Login terpisah untuk Suami dan Istri (Supabase Auth).

## Arsitektur
- **Frontend**: HTML/CSS/JS statis (vanilla JS + supabase-js v2 via CDN).
- **Backend**: Supabase (Auth + PostgreSQL + Row Level Security).
- **Hosting**: Cloudflare Pages.

## Setup Supabase (wajib sekali)

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) → project kamu.
2. Buka **SQL Editor** → **New query** → salin isi `supabase/schema.sql` → **Run**. Ini membuat tabel `profiles`, `expenses`, `activity_logs`, policy RLS, dan trigger log otomatis.
3. Buka **Authentication → Providers → Email** → matikan **"Confirm email"** (biar pendaftaran langsung masuk tanpa verifikasi email).
4. Periksa **Project Settings → API** → pastikan URL & anon key cocok dengan yang ada di `public/js/config.js`.

## Kode Rumah Tangga

Pendaftaran butuh **Kode Rumah Tangga** (default `KELUARGA-2026`). Ganti di `public/js/config.js`:

```js
window.HOUSEHOLD_CODE = "GANTI-DENGAN-KODE-KAMU";
```

Beri tahu kode ini ke pasangan. Hanya orang yang tahu kode yang bisa mendaftar.

## Coba di lokal

```bash
cd public
python -m http.server 8000
# buka http://localhost:8000
```

## Deploy ke Cloudflare Pages

- **Pakai Wrangler**: `npx wrangler pages deploy public --project-name=catatan-keuangan-keluarga`
- **Atau via dashboard**: upload folder `public/` sebagai "Direct Upload".
- **Atau via Git**: hubungkan repo → build command kosong → output dir `public`.

## Catatan Keamanan

- Data dilindungi RLS: hanya pengguna yang sudah login (Suami/Istri) yang bisa membaca/menulis.
- Anon key Supabase memang publik — itu normal untuk client-side, keamanan ada di RLS.
- Jangan pernah menaruh service_role key di frontend.