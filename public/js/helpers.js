const sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

const localDateStr = (d = new Date()) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + dd;
};

const localMonthStr = (d = new Date()) => localDateStr(d).slice(0, 7);

const formatRupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const formatDateTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const formatDate = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return x.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const getProfiles = async () => window.ROLE_PROFILES;

async function getProfile(id) {
  return window.ROLE_PROFILES.find((p) => p.id === id) || null;
}

function toast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.className = ""), 2600);
}

function roleLabel(role) {
  if (role === "suami") return "Suami";
  if (role === "istri") return "Istri";
  if (role === "anak") return "Anak";
  return "Anggota";
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/);
  return (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}