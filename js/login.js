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
      showMessage("Invalid mobile number or password.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}
