const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

function showMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = `auth-message show ${type}`;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const identifier = document.getElementById("loginIdentifier").value.trim();
    const password = document.getElementById("loginPassword").value;
    const remember = document.getElementById("rememberMe").checked;
    const submitButton = form.querySelector("button[type='submit']");

    if (!identifier || !password) {
      showMessage("Please enter your mobile number and password.", "error");
      return;
    }

    const email = mobileToEmail(identifier);
    submitButton.disabled = true;

    try {
      await auth.setPersistence(
        remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION
      );
      const credential = await auth.signInWithEmailAndPassword(email, password);
      const userDoc = await db.collection("users").doc(credential.user.uid).get();

      if (!userDoc.exists) {
        showMessage("Account details not found. Please contact support.", "error");
        await auth.signOut();
        return;
      }

      const role = userDoc.data().role;
      const dashboard = ROLE_DASHBOARD[role];

      if (!dashboard) {
        showMessage("Your account role is not recognized. Please contact support.", "error");
        await auth.signOut();
        return;
      }

      window.location.href = dashboard;
    } catch (error) {
      console.error("Login error:", error.code, error.message);
      if (error.code === "auth/user-not-found") {
        showMessage("No account found with this mobile number. (Code: user-not-found)", "error");
      } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        showMessage("Incorrect password for this mobile number. (Code: wrong-password)", "error");
      } else if (error.code === "auth/invalid-email") {
        showMessage("Mobile number format not recognized. (Code: invalid-email)", "error");
      } else if (error.code === "auth/too-many-requests") {
        showMessage("Too many attempts. Please wait a moment and try again.", "error");
      } else {
        showMessage(`Login failed: ${error.code || error.message}`, "error");
      }
    } finally {
      submitButton.disabled = false;
    }
  });
}
