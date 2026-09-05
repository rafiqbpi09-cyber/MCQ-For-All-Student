const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (message) {
      message.textContent = "Authentication setup is not configured yet.";
      message.className = "auth-message show error";
    }
  });
}
