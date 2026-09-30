const sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

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

const profileCache = {};

async function getProfiles() {
  const { data, error } = await sb
    .from("profiles")
    .select("id, display_name, role");
  if (error) throw error;
  data.forEach((p) => (profileCache[p.id] = p));
  return data;
}

async function getProfile(id) {
  if (profileCache[id]) return profileCache[id];
  const { data, error } = await sb
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", id)
    .single();
  if (error) throw error;
  profileCache[id] = data;
  return data;
}

function toast(msg, type = "") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + type;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.className = ""), 2600);
}

function roleLabel(role) {
  return role === "suami" ? "Suami" : "Istri";
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/);
  return (parts[0]?.[0] || "").toUpperCase() + (parts[1]?.[0] || "").toUpperCase();
}