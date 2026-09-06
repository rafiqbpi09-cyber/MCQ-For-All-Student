auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userDoc = await db.collection("users").doc(user.uid).get();
    const role = userDoc.exists ? userDoc.data().role : null;
    const required = window.EP_REQUIRED_ROLE;

    const allowed = required === "any"
      ? Boolean(role)
      : Array.isArray(required)
        ? required.includes(role)
        : role === required;

    if (!userDoc.exists || !allowed) {
      window.location.href = "access-denied.html";
      return;
    }

    window.EP_CURRENT_USER = { uid: user.uid, role, name: userDoc.data().name || "" };

    const nameTarget = document.getElementById("dashboardUserName");
    if (nameTarget && userDoc.data().name) {
      nameTarget.textContent = userDoc.data().name;
    }
  } catch (error) {
    window.location.href = "login.html";
  }
});
