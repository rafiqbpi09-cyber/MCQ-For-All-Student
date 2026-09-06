function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function loadQuizzes() {
  const container = document.getElementById("quizListContainer");

  try {
    const snapshot = await db.collection("quizzes").orderBy("createdAt", "desc").get();

    if (snapshot.empty) {
      container.innerHTML = `<p style="text-align:center;color:var(--muted)">No quizzes available yet.</p>`;
      return;
    }

    container.innerHTML = "";

    snapshot.forEach((doc) => {
      const quiz = doc.data();
      const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0;
      const card = document.createElement("div");
      card.className = "quiz-list-card";
      card.innerHTML = `
        <div>
          <h3>${escapeHtml(quiz.title || "Untitled Quiz")}</h3>
          <p class="quiz-meta">${questionCount} question${questionCount === 1 ? "" : "s"} &middot; by ${escapeHtml(quiz.createdByName || "Unknown")}</p>
          ${quiz.description ? `<p class="quiz-desc">${escapeHtml(quiz.description)}</p>` : ""}
        </div>
        <a class="btn btn-primary" href="take-quiz.html?id=${doc.id}">Start Quiz</a>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    container.innerHTML = `<p style="text-align:center;color:var(--danger)">Could not load quizzes: ${error.code || error.message}</p>`;
  }
}

auth.onAuthStateChanged((user) => {
  if (user) loadQuizzes();
});
