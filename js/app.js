document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("currentYear");
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.passwordTarget;
      const input = targetId
        ? document.getElementById(targetId)
        : document.getElementById("loginPassword");

      if (!input) return;

      const showing = input.type === "text";
      input.type = showing ? "password" : "text";
      button.textContent = showing ? "Show" : "Hide";
      button.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      button.setAttribute("aria-pressed", String(!showing));
    });
  });

  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      if (typeof auth !== "undefined" && auth.signOut) {
        auth.signOut().finally(() => {
          window.location.href = "login.html";
        });
      } else {
        window.location.href = "login.html";
      }
    });
  }
});
