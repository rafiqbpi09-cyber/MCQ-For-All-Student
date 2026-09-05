const form = document.getElementById("studentRegisterForm");
const message = document.getElementById("registerMessage");

function showMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = `auth-message show ${type}`;
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const mobile = document.getElementById("studentMobile").value.trim();
    const password = document.getElementById("studentPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const acceptTerms = document.getElementById("acceptTerms").checked;
    const mobilePattern = /^[0-9+\-\s]{7,15}$/;

    if (!name) {
      showMessage("Please enter the student's name.", "error");
      return;
    }
    if (!mobilePattern.test(mobile)) {
      showMessage("Please enter a valid mobile number.", "error");
      return;
    }
    if (password.length < 6) {
      showMessage("Password must be at least 6 characters long.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showMessage("Passwords do not match.", "error");
      return;
    }
    if (!acceptTerms) {
      showMessage("Please accept the Terms and Conditions to continue.", "error");
      return;
    }

    showMessage("Account creation is not connected to a server yet.", "error");
  });
}
