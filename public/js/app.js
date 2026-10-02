let currentUser = null;
let currentMonth = null;
let expenses = [];
let profiles = [];
let logs = [];

document.addEventListener("DOMContentLoaded", async () => {
  const activeId = localStorage.getItem("active_profile");
  if (!activeId) {
    window.location.href = "index.html";
    return;
  }

  const today = new Date();
  currentMonth = localMonthStr(today);

  try {
    profiles = await getProfiles();
    currentUser = profiles.find((p) => p.id === activeId);
    if (!currentUser) {
      window.location.href = "index.html";
      return;
    }
    await initHeader();
    await loadData();
    bindEvents();
  } catch (err) {
    console.error(err);
    toast("Gagal memuat data: " + err.message, "error");
  }
});

function initHeader() {
  document.getElementById("user-name").textContent = currentUser.display_name;
  document.getElementById("user-role").textContent = roleLabel(currentUser.role);
  const avatar = document.getElementById("user-avatar");
  avatar.textContent = initials(currentUser.display_name);
  avatar.className = "avatar " + currentUser.role;

  document.getElementById("month").value = currentMonth;
}

function bindEvents() {
  document.getElementById("expense-form").addEventListener("submit", addExpense);
  document.getElementById("month").addEventListener("change", (e) => {
    currentMonth = e.target.value;
    loadData();
  });
  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("active_profile");
    window.location.href = "index.html";
  });

  const editModal = document.getElementById("edit-modal");
  document.getElementById("btn-edit-save").addEventListener("click", saveEdit);
  document.getElementById("btn-edit-cancel").addEventListener("click", () => editModal.classList.remove("show"));
  editModal.addEventListener("click", (e) => {
    if (e.target === editModal) editModal.classList.remove("show");
  });

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-riwayat").classList.toggle("hidden", btn.dataset.tab !== "riwayat");
      document.getElementById("tab-log").classList.toggle("hidden", btn.dataset.tab !== "log");
    });
  });
}

async function loadData() {
  const [startStr, endStr] = monthRange(currentMonth);

  const [expRes, logRes] = await Promise.all([
    sb.from("expenses")
      .select("id, description, amount, category, expense_date, created_by, created_at")
      .gte("expense_date", startStr)
      .lt("expense_date", endStr)
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false }),
    sb.from("activity_logs")
      .select("id, user_id, action, description, created_at")
      .gte("created_at", startStr + "T00:00:00Z")
      .lte("created_at", endStr + "T23:59:59Z")
      .order("created_at", { ascending: false })
      .limit(300)
  ]);

  if (expRes.error) throw expRes.error;
  if (logRes.error) throw logRes.error;

  expenses = expRes.data || [];
  logs = logRes.data || [];

  renderSummary();
  renderTable();
  renderLogs();
}

function monthRange(ym) {
  const [y, m] = ym.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, 1));
  const end = new Date(Date.UTC(y, m, 1));
  const fmt = (d) => d.toISOString().slice(0, 10);
  return [fmt(start), fmt(end)];
}

function renderSummary() {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const byRole = { suami: 0, istri: 0, anak: 0 };
  expenses.forEach((e) => {
    const r = (who(e.created_by)?.role) || "suami";
    if (byRole[r] === undefined) byRole[r] = 0;
    byRole[r] += Number(e.amount);
  });

  document.getElementById("stat-total").textContent = formatRupiah(total);
  document.getElementById("stat-suami").textContent = formatRupiah(byRole.suami);
  document.getElementById("stat-istri").textContent = formatRupiah(byRole.istri);
  document.getElementById("stat-anak").textContent = formatRupiah(byRole.anak);
  document.getElementById("stat-count").textContent = expenses.length + " transaksi";

  document.getElementById("bp-suami").textContent = formatRupiah(byRole.suami);
  document.getElementById("bp-istri").textContent = formatRupiah(byRole.istri);
  document.getElementById("bp-anak").textContent = formatRupiah(byRole.anak);

  renderCategories(total);
}

function who(id) {
  return profiles.find((p) => p.id === id);
}

function renderCategories(total) {
  const map = {};
  expenses.forEach((e) => {
    map[e.category] = (map[e.category] || 0) + Number(e.amount);
  });
  const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
  const wrap = document.getElementById("cat-bars");
  wrap.innerHTML = "";

  if (sorted.length === 0) {
    wrap.innerHTML = '<div class="empty"><span class="emoji">📊</span>Belum ada data bulan ini.</div>';
    return;
  }

  sorted.forEach(([cat, amt]) => {
    const pct = total > 0 ? Math.round((amt / total) * 100) : 0;
    const key = "cat-" + cat.toLowerCase().replace(/[^a-z0-9]/g, "");
    const row = document.createElement("div");
    row.className = "bar-row";
    row.innerHTML =
      '<div class="bar-top"><b>' + escapeHtml(cat) + '</b><span>' + formatRupiah(amt) + " (" + pct + "%)</span></div>" +
      '<div class="bar"><div class="bar-fill ' + key + '" style="width:' + pct + '%"></div></div>';
    wrap.appendChild(row);
  });
}

function renderTable() {
  const tbody = document.getElementById("expense-tbody");
  tbody.innerHTML = "";

  if (expenses.length === 0) {
    document.getElementById("table-empty").classList.remove("hidden");
    return;
  }
  document.getElementById("table-empty").classList.add("hidden");

  expenses.forEach((e) => {
    const p = who(e.created_by);
    const name = p ? p.display_name : "?";
    const role = p ? p.role : "";
    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td class="text-sm muted">' + formatDate(e.expense_date) + "</td>" +
      "<td><b>" + escapeHtml(e.description) + "</b></td>" +
      '<td><span class="badge badge-cat">' + escapeHtml(e.category) + "</span></td>" +
      '<td class="amount">' + formatRupiah(e.amount) + "</td>" +
      '<td><span class="badge ' + role + '">' + escapeHtml(name) + "</span></td>" +
      '<td><div class="row-actions">' +
      '<button class="icon-btn" data-act="edit" data-id="' + e.id + '" title="Edit">✏️</button>' +
      '<button class="icon-btn danger" data-act="delete" data-id="' + e.id + '" title="Hapus">🗑️</button>' +
      "</div></td>";
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("[data-act='edit']").forEach((b) =>
    b.addEventListener("click", () => openEdit(b.dataset.id))
  );
  tbody.querySelectorAll("[data-act='delete']").forEach((b) =>
    b.addEventListener("click", () => deleteExpense(b.dataset.id))
  );
}

function renderLogs() {
  const list = document.getElementById("log-list");
  list.innerHTML = "";

  if (logs.length === 0) {
    list.innerHTML = '<div class="empty"><span class="emoji">📝</span>Belum ada aktivitas bulan ini.</div>';
    return;
  }

  logs.forEach((l) => {
    const p = who(l.user_id);
    const name = p ? p.display_name : "Seseorang";
    const actionText = { tambah: "menambah", ubah: "mengubah", hapus: "menghapus" }[l.action] || l.action;
    const icon = l.action === "hapus" ? "🗑️" : l.action === "ubah" ? "✏️" : "💰";
    const item = document.createElement("div");
    item.className = "log-item";
    item.innerHTML =
      '<div class="log-dot ' + l.action + '">' + icon + "</div>" +
      '<div class="log-body">' +
      '<span class="lwho">' + escapeHtml(name) + "</span> " +
      "<span class='lwhat'>" + actionText + " pengeluaran " + escapeHtml(l.description) + "</span>" +
      '<div class="lwhen">' + formatDateTime(l.created_at) + "</div>" +
      "</div>";
    list.appendChild(item);
  });
}

async function addExpense(e) {
  e.preventDefault();
  const form = e.target;
  const payload = {
    description: form.description.value.trim(),
    amount: parseFloat(form.amount.value),
    category: form.category.value,
    expense_date: form.date.value || localDateStr(),
    created_by: currentUser.id
  };

  if (!payload.description || !payload.amount || payload.amount <= 0) {
    toast("Lengkapi deskripsi dan jumlah yang valid.", "error");
    return;
  }

  const { error } = await sb.from("expenses").insert(payload);
  if (error) {
    toast("Gagal menyimpan: " + error.message, "error");
    return;
  }

  form.reset();
  form.date.value = localDateStr();
  toast("Pengeluaran ditambahkan.", "success");
  await loadData();
}

function openEdit(id) {
  const e = expenses.find((x) => x.id === id);
  if (!e) return;
  document.getElementById("edit-id").value = e.id;
  document.getElementById("edit-description").value = e.description;
  document.getElementById("edit-amount").value = e.amount;
  document.getElementById("edit-category").value = e.category;
  document.getElementById("edit-date").value = e.expense_date;
  document.getElementById("edit-modal").classList.add("show");
}

async function saveEdit() {
  const id = document.getElementById("edit-id").value;
  const payload = {
    description: document.getElementById("edit-description").value.trim(),
    amount: parseFloat(document.getElementById("edit-amount").value),
    category: document.getElementById("edit-category").value,
    expense_date: document.getElementById("edit-date").value
  };
  if (!payload.description || !payload.amount || payload.amount <= 0) {
    toast("Data tidak valid.", "error");
    return;
  }
  const { error } = await sb.from("expenses").update(payload).eq("id", id);
  if (error) {
    toast("Gagal mengubah: " + error.message, "error");
    return;
  }
  document.getElementById("edit-modal").classList.remove("show");
  toast("Pengeluaran diubah.", "success");
  await loadData();
}

async function deleteExpense(id) {
  const e = expenses.find((x) => x.id === id);
  if (!e) return;
  if (!confirm('Hapus pengeluaran "' + e.description + '"?')) return;
  const { error } = await sb.from("expenses").delete().eq("id", id);
  if (error) {
    toast("Gagal menghapus: " + error.message, "error");
    return;
  }
  toast("Pengeluaran dihapus.", "success");
  await loadData();
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}