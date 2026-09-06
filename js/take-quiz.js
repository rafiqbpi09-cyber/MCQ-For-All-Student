const params = new URLSearchParams(window.location.search);
const quizId = params.get("id");
let currentQuiz = null;

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

async function loadQuiz() {
  const container = document.getElementById("quizQuestionsContainer");
  const heading = document.getElementById("quizTitleHeading");

  if (!quizId) {
    container.innerHTML = `<p style="text-align:center;color:var(--danger)">No quiz selected.</p>`;
    document.getElementById("submitQuizBtn").style.display = "none";
    return;
  }

  try {
    const doc = await db.collection("quizzes").doc(quizId).get();

    if (!doc.exists) {
      container.innerHTML = `<p style="text-align:center;color:var(--danger)">Quiz not found.</p>`;
      document.getElementById("submitQuizBtn").style.display = "none";
      return;
    }

    currentQuiz = doc.data();
    heading.textContent = currentQuiz.title || "Quiz";

    container.innerHTML = "";
    currentQuiz.questions.forEach((q, qIndex) => {
      const block = document.createElement("div");
      block.className = "quiz-question-block";
      block.dataset.qindex = qIndex;

      let optionsHtml = "";
      q.options.forEach((option, oIndex) => {
        optionsHtml += `
          <label class="quiz-take-option">
            <input type="radio" name="answer-${qIndex}" value="${oIndex}">
            <span>${escapeHtml(option)}</span>
          </label>`;
      });

      block.innerHTML = `
        <p class="quiz-question-text"><strong>Q${qIndex + 1}.</strong> ${escapeHtml(q.question)}</p>
        <div class="quiz-take-options">${optionsHtml}</div>
        <p class="quiz-feedback"></p>
      `;
      container.appendChild(block);
    });
  } catch (error) {
    container.innerHTML = `<p style="text-align:center;color:var(--danger)">Could not load quiz: ${error.code || error.message}</p>`;
    document.getElementById("submitQuizBtn").style.display = "none";
  }
}

const form = document.getElementById("takeQuizForm");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentQuiz) return;

  const submitButton = document.getElementById("submitQuizBtn");
  const blocks = document.querySelectorAll(".quiz-question-block");
  let score = 0;
  const answers = [];

  blocks.forEach((block, qIndex) => {
    const selected = block.querySelector(`input[name="answer-${qIndex}"]:checked`);
    const selectedIndex = selected ? parseInt(selected.value, 10) : -1;
    const correctIndex = currentQuiz.questions[qIndex].correctIndex;
    const isCorrect = selectedIndex === correctIndex;

    if (isCorrect) score++;
    answers.push(selectedIndex);

    const feedback = block.querySelector(".quiz-feedback");
    if (selectedIndex === -1) {
      feedback.textContent = `Not answered. Correct answer: ${currentQuiz.questions[qIndex].options[correctIndex]}`;
      feedback.className = "quiz-feedback show incorrect";
    } else if (isCorrect) {
      feedback.textContent = "Correct!";
      feedback.className = "quiz-feedback show correct";
    } else {
      feedback.textContent = `Incorrect. Correct answer: ${currentQuiz.questions[qIndex].options[correctIndex]}`;
      feedback.className = "quiz-feedback show incorrect";
    }

    block.querySelectorAll("input[type='radio']").forEach((input) => (input.disabled = true));
  });

  const total = currentQuiz.questions.length;
  const summary = document.getElementById("quizResultSummary");
  summary.style.display = "block";
  summary.textContent = `You scored ${score} out of ${total}.`;
  summary.className = "auth-message show success";

  submitButton.disabled = true;
  submitButton.textContent = "SUBMITTED";

  try {
    await db.collection("quizAttempts").add({
      quizId,
      quizTitle: currentQuiz.title || "",
      studentUid: window.EP_CURRENT_USER.uid,
      studentName: window.EP_CURRENT_USER.name || "",
      answers,
      score,
      total,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error("Could not save quiz attempt:", error);
  }
});

auth.onAuthStateChanged((user) => {
  if (user) loadQuiz();
});
