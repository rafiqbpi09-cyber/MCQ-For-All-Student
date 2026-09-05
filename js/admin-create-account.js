// Creating a user with the normal Firebase Auth instance would sign the
// admin OUT and sign the newly created user IN instead (a known Firebase
// client-SDK behavior). To avoid that, we spin up a second, independent
// Firebase app instance just for account creation, so the admin's own
// session in the main "auth" instance is never touched.
const secondaryApp =
  firebase.apps.find((a) => a.name === "Secondary") ||
  firebase.initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = secondaryApp.auth();

const form = document.getElementById("createAccountForm");
const message = document.getElementById("createAccountMessage");

function showMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = `auth-message show ${type}`;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("newUserName").value.trim();
    const mobile = document.getElementById("newUserMobile").value.trim();
    const password = document.getElementById("newUserPassword").value;
    const role = document.getElementById("newUserRole").value;
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
    if (!role) {
      showMessage("Please select a role.", "error");
      return;
    }

    const email = mobileToEmail(mobile);
    submitButton.disabled = true;
    showMessage("Creating account...", "success");

    try {
      const credential = await secondaryAuth.createUserWithEmailAndPassword(email, password);

      await db.collection("users").doc(credential.user.uid).set({
        role,
        name,
        mobile,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: auth.currentUser ? auth.currentUser.uid : null
      });

      await secondaryAuth.signOut();

      showMessage(`Account created successfully for ${name} (${role}).`, "success");
      form.reset();
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        showMessage("An account with this mobile number already exists.", "error");
      } else if (error.code === "auth/weak-password") {
        showMessage("Password is too weak. Use at least 6 characters.", "error");
      } else {
        showMessage(`Could not create account: ${error.code || error.message}`, "error");
      }
    } finally {
      submitButton.disabled = false;
    }
  });
}
