function showSettingsMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.className = `auth-message show ${type}`;
}

function formatDateTime(isoString) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function initialsFromName(name) {
  if (!name) return "A";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p[0].toUpperCase()).join("") || "A";
}

function applyAvatar(name, photoUrl) {
  const avatar = document.getElementById("avatarPreview");
  if (!avatar) return;
  if (photoUrl) {
    avatar.style.backgroundImage = `url(${photoUrl})`;
    avatar.style.backgroundSize = "cover";
    avatar.style.backgroundPosition = "center";
    avatar.textContent = "";
  } else {
    avatar.style.backgroundImage = "none";
    avatar.textContent = initialsFromName(name);
  }
}

auth.onAuthStateChanged(async (authUser) => {
  if (!authUser) return;

  const loading = document.getElementById("settingsLoading");
  const content = document.getElementById("settingsContent");

  try {
    const userDoc = await withTimeout(db.collection("users").doc(authUser.uid).get(), 15000);

    if (!userDoc.exists || userDoc.data().role !== "admin") {
      // dashboard-guard.js already redirects non-admins; this is a defensive fallback.
      return;
    }

    const data = userDoc.data();
    const name = data.name || "Admin";
    const photoUrl = data.photoURL || "";
    const status = data.status || "active";

    document.getElementById("profileDisplayName").textContent = name;
    document.getElementById("settingsFullName").value = name;
    document.getElementById("settingsPhotoUrl").value = photoUrl;
    applyAvatar(name, photoUrl);

    const statusBadge = document.getElementById("statusBadge");
    statusBadge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    statusBadge.classList.toggle("admin-settings-badge-inactive", status !== "active");

    document.getElementById("infoUsername").textContent = data.mobile || "—";
    document.getElementById("infoEmail").textContent = authUser.email || "—";
    document.getElementById("infoPhone").textContent = data.mobile || "—";
    document.getElementById("infoRole").textContent = "Super Admin • Full Access";

    const metadata = authUser.metadata || {};
    document.getElementById("infoCreated").textContent = formatDateTime(metadata.creationTime);
    document.getElementById("infoLastLogin").textContent = formatDateTime(metadata.lastSignInTime);

    loading.style.display = "none";
    content.style.display = "block";
  } catch (error) {
    loading.textContent = `Could not load admin settings: ${error.message === "TIMEOUT" ? "connection timed out." : (error.code || error.message)}`;
  }
});

const profileForm = document.getElementById("updateProfileForm");
if (profileForm) {
  profileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const newName = document.getElementById("settingsFullName").value.trim();
    const newPhotoUrl = document.getElementById("settingsPhotoUrl").value.trim();
    const submitButton = profileForm.querySelector("button[type='submit']");

    if (!newName) {
      showSettingsMessage("profileMessage", "Please enter a name.", "error");
      return;
    }

    submitButton.disabled = true;

    try {
      await db.collection("users").doc(user.uid).update({
        name: newName,
        photoURL: newPhotoUrl
      });
      document.getElementById("profileDisplayName").textContent = newName;
      applyAvatar(newName, newPhotoUrl);
      const nameTarget = document.getElementById("dashboardUserName");
      if (nameTarget) nameTarget.textContent = newName;
      showSettingsMessage("profileMessage", "Profile updated successfully.", "success");
    } catch (error) {
      showSettingsMessage("profileMessage", `Could not update profile: ${error.code || error.message}`, "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}

const settingsPasswordForm = document.getElementById("settingsPasswordForm");
if (settingsPasswordForm) {
  settingsPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const currentPassword = document.getElementById("settingsCurrentPassword").value;
    const newPassword = document.getElementById("settingsNewPassword").value;
    const confirmPassword = document.getElementById("settingsConfirmPassword").value;
    const submitButton = settingsPasswordForm.querySelector("button[type='submit']");
    const user = auth.currentUser;

    if (!currentPassword || !newPassword) {
      showSettingsMessage("settingsPasswordMessage", "Please fill in all password fields.", "error");
      return;
    }
    if (newPassword.length < 6) {
      showSettingsMessage("settingsPasswordMessage", "New password must be at least 6 characters long.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showSettingsMessage("settingsPasswordMessage", "New passwords do not match.", "error");
      return;
    }
    if (!user) return;

    submitButton.disabled = true;
    showSettingsMessage("settingsPasswordMessage", "Updating password...", "success");

    try {
      const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);

      showSettingsMessage("settingsPasswordMessage", "Password changed successfully.", "success");
      settingsPasswordForm.reset();
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        showSettingsMessage("settingsPasswordMessage", "Current password is incorrect.", "error");
      } else {
        showSettingsMessage("settingsPasswordMessage", `Could not change password: ${error.code || error.message}`, "error");
      }
    } finally {
      submitButton.disabled = false;
    }
  });
}
