document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  const roleSel = document.getElementById("role");
  const btn = document.getElementById("btn-login");
  const errBox = document.getElementById("error-box");

  window.ROLE_PROFILES.forEach((p) => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.display_name + " (" + roleLabel(p.role) + ")";
    roleSel.appendChild(opt);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errBox.classList.remove("show");
    if (!roleSel.value) {
      errBox.textContent = "Pilih role dulu.";
      errBox.classList.add("show");
      return;
    }
    localStorage.setItem("active_profile", roleSel.value);
    window.location.href = "app.html";
  });
});