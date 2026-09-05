const form = document.getElementById("setupAdminForm");
const message = document.getElementById("setupAdminMessage");

function showMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = `auth-message show ${type}`;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("adminName").value.trim();
    const mobile = document.getElementById("adminMobile").value.trim();
    const password = document.getElementById("adminPassword").value;
    const submitButton = form.querySelector("button[type='submit']");
    const mobilePattern = /^[0-9+\-\s]{7,15}$/;

    if (!name) {
      showMessage("Please enter the full name.", "error");
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

    const email = mobileToEmail(mobile);
    submitButton.disabled = true;
    showMessage("Creating first admin account...", "success");

    try {
      const credential = await auth.createUserWithEmailAndPassword(email, password);

      await db.collection("users").doc(credential.user.uid).set({
        role: "admin",
        name,
        mobile,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showMessage("Admin account created! Redirecting to the dashboard...", "success");
      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 1200);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        showMessage("An account with this mobile number already exists.", "error");
      } else if (error.code === "auth/weak-password") {
        showMessage("Password is too weak. Use at least 6 characters.", "error");
      } else {
        showMessage(`Could not create account: ${error.code || error.message}`, "error");
      }
      submitButton.disabled = false;
    }
  });
}
