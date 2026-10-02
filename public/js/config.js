window.SUPABASE_URL = "https://dzuzcwcfjkocfprcubnh.supabase.co";
window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6dXpjd2NmamtvY2ZwcmN1Ym5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDc1ODEsImV4cCI6MjEwNjI4MzU4MX0.sjorPd0lTFsZsA-u3n6GHSRT-Xe6Doms2YvZfkdrKBs";

// Kode rahasia keluarga. Hanya orang yang tahu kode ini yang bisa mendaftar.
// Ganti dengan kode kamu sendiri.
window.HOUSEHOLD_CODE = "KELUARGA-2026";

// Profil role-only (tanpa akun email). Id harus sama dengan seed di supabase/schema.sql
window.ROLE_PROFILES = [
  { id: "11111111-1111-1111-1111-111111111111", display_name: "Suami", role: "suami" },
  { id: "22222222-2222-2222-2222-222222222222", display_name: "Istri", role: "istri" },
  { id: "33333333-3333-3333-3333-333333333333", display_name: "Anak", role: "anak" }
];

window.CATEGORIES = [
  "Makanan",
  "Transportasi",
  "Belanja Rumah",
  "Tagihan & Listrik",
  "Kesehatan",
  "Pendidikan",
  "Hiburan",
  "Jajan",
  "Tabungan",
  "Lainnya"
];