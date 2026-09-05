auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const userDoc = await db.collection("users").doc(user.uid).get();

    if (!userDoc.exists || userDoc.data().role !== window.EP_REQUIRED_ROLE) {
      window.location.href = "access-denied.html";
      return;
    }

    const nameTarget = document.getElementById("dashboardUserName");
    if (nameTarget && userDoc.data().name) {
      nameTarget.textContent = userDoc.data().name;
    }
  } catch (error) {
    window.location.href = "login.html";
  }
});
