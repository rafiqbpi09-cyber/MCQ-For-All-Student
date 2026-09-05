const form = document.getElementById("studentRegisterForm");
const message = document.getElementById("registerMessage");

function showMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = `auth-message show ${type}`;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const mobile = document.getElementById("studentMobile").value.trim();
    const email = document.getElementById("studentEmail").value.trim();
    const studentClass = document.getElementById("studentClass").value;
    const password = document.getElementById("studentPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const guardianName = document.getElementById("guardianName").value.trim();
    const guardianMobile = document.getElementById("guardianMobile").value.trim();
    const acceptTerms = document.getElementById("acceptTerms").checked;
    const mobilePattern = /^[0-9+\-\s]{7,15}$/;
    const submitButton = form.querySelector("button[type='submit']");

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

    const loginEmail = mobileToEmail(mobile);
    submitButton.disabled = true;

    try {
      const credential = await auth.createUserWithEmailAndPassword(loginEmail, password);

      await db.collection("users").doc(credential.user.uid).set({
        role: "student",
        name,
        mobile,
        email: email || null,
        className: studentClass,
        guardianName: guardianName || null,
        guardianMobile: guardianMobile || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showMessage("Account created successfully! Redirecting...", "success");
      setTimeout(() => {
        window.location.href = "student-dashboard.html";
      }, 1200);
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        showMessage("An account with this mobile number already exists.", "error");
      } else if (error.code === "auth/weak-password") {
        showMessage("Password is too weak. Use at least 6 characters.", "error");
      } else {
        showMessage("Could not create account. Please try again.", "error");
      }
      submitButton.disabled = false;
    }
  });
}
