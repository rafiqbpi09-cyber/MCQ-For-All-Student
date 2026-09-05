const form = document.getElementById("forgotPasswordForm");
const message = document.getElementById("resetMessage");

function showMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = `auth-message show ${type}`;
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("resetEmail").value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showMessage("Please enter a valid email address.", "error");
      return;
    }

    showMessage("Password reset is not connected to a server yet.", "error");
  });
}
