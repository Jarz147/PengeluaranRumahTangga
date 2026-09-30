document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (loginForm) {
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const errBox = document.getElementById("error-box");
    const btn = document.getElementById("btn-login");

    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      errBox.classList.remove("show");
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Masuk...';
      const { error } = await sb.auth.signInWithPassword({ email: email.value.trim(), password: password.value });
      btn.disabled = false;
      btn.innerHTML = "Masuk";
      if (error) {
        errBox.textContent = error.message === "Invalid login credentials" ? "Email atau password salah." : error.message;
        errBox.classList.add("show");
        return;
      }
      window.location.href = "app.html";
    });
  }

  if (registerForm) {
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const role = document.getElementById("role");
    const code = document.getElementById("code");
    const errBox = document.getElementById("error-box");
    const btn = document.getElementById("btn-register");

    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      errBox.classList.remove("show");

      if (code.value.trim().toUpperCase() !== window.HOUSEHOLD_CODE.toUpperCase()) {
        errBox.textContent = "Kode rumah tangga salah.";
        errBox.classList.add("show");
        return;
      }
      if (password.value.length < 6) {
        errBox.textContent = "Password minimal 6 karakter.";
        errBox.classList.add("show");
        return;
      }

      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Mendaftar...';

      const { data, error } = await sb.auth.signUp({
        email: email.value.trim(),
        password: password.value,
        options: {
          data: { display_name: name.value.trim(), role: role.value }
        }
      });

      if (error) {
        btn.disabled = false;
        btn.innerHTML = "Daftar";
        errBox.textContent = error.message;
        errBox.classList.add("show");
        return;
      }

      if (data.user) {
        const { error: perr } = await sb.from("profiles").insert({
          id: data.user.id,
          display_name: name.value.trim(),
          role: role.value
        });
        if (perr) {
          btn.disabled = false;
          btn.innerHTML = "Daftar";
          errBox.textContent = "Gagal menyimpan profil: " + perr.message;
          errBox.classList.add("show");
          return;
        }
      }

      const session = await sb.auth.getSession();
      if (session.data.session) {
        window.location.href = "app.html";
      } else {
        btn.disabled = false;
        btn.innerHTML = "Daftar";
        errBox.textContent = "Pendaftaran berhasil! Silakan cek email untuk konfirmasi, lalu login.";
        errBox.classList.add("show");
      }
    });
  }
});