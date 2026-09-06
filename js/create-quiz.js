let questionCount = 0;

function addQuestionBlock() {
  questionCount++;
  const index = questionCount;
  const container = document.getElementById("questionsContainer");

  const block = document.createElement("div");
  block.className = "quiz-question-block";
  block.dataset.index = index;
  block.innerHTML = `
    <div class="quiz-question-header">
      <strong>Question ${index}</strong>
      <button type="button" class="btn-remove-question">Remove</button>
    </div>
    <div class="form-group">
      <label>Question Text</label>
      <input type="text" class="q-text" placeholder="Enter the question">
    </div>
    <label class="quiz-options-label">Options &mdash; select the radio button next to the correct answer</label>
    <div class="quiz-options-grid">
      <div class="quiz-option-row correct-option">
        <input type="radio" name="correct-${index}" value="0" checked>
        <input type="text" class="q-option" data-option="0" placeholder="Option A">
      </div>
      <div class="quiz-option-row">
        <input type="radio" name="correct-${index}" value="1">
        <input type="text" class="q-option" data-option="1" placeholder="Option B">
      </div>
      <div class="quiz-option-row">
        <input type="radio" name="correct-${index}" value="2">
        <input type="text" class="q-option" data-option="2" placeholder="Option C">
      </div>
      <div class="quiz-option-row">
        <input type="radio" name="correct-${index}" value="3">
        <input type="text" class="q-option" data-option="3" placeholder="Option D">
      </div>
    </div>
  `;

  container.appendChild(block);

  block.querySelectorAll(".quiz-option-row input[type='radio']").forEach((radio) => {
    radio.addEventListener("change", () => {
      block.querySelectorAll(".quiz-option-row").forEach((row) => row.classList.remove("correct-option"));
      radio.closest(".quiz-option-row").classList.add("correct-option");
    });
  });

  block.querySelector(".btn-remove-question").addEventListener("click", () => {
    block.remove();
  });
}

document.getElementById("addQuestionBtn").addEventListener("click", addQuestionBlock);
addQuestionBlock();

const form = document.getElementById("createQuizForm");
const message = document.getElementById("createQuizMessage");

function showMessage(text, type) {
  if (!message) return;
  message.textContent = text;
  message.className = `auth-message show ${type}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("quizTitle").value.trim();
  const description = document.getElementById("quizDescription").value.trim();
  const submitButton = form.querySelector("button[type='submit']");

  if (!title) {
    showMessage("Please enter a quiz title.", "error");
    return;
  }

  const blocks = document.querySelectorAll(".quiz-question-block");
  if (blocks.length === 0) {
    showMessage("Please add at least one question.", "error");
    return;
  }

  const questions = [];
  for (const block of blocks) {
    const questionText = block.querySelector(".q-text").value.trim();
    const optionInputs = block.querySelectorAll(".q-option");
    const options = Array.from(optionInputs).map((input) => input.value.trim());
    const selectedRadio = block.querySelector("input[type='radio']:checked");
    const correctIndex = selectedRadio ? parseInt(selectedRadio.value, 10) : 0;

    if (!questionText || options.some((option) => !option)) {
      showMessage("Please fill in every question and all 4 options.", "error");
      return;
    }

    questions.push({ question: questionText, options, correctIndex });
  }

  submitButton.disabled = true;
  showMessage("Saving quiz...", "success");

  try {
    await db.collection("quizzes").add({
      title,
      description: description || null,
      questions,
      createdBy: window.EP_CURRENT_USER.uid,
      createdByName: window.EP_CURRENT_USER.name || "",
      createdByRole: window.EP_CURRENT_USER.role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    showMessage("Quiz saved successfully!", "success");
    form.reset();
    document.getElementById("questionsContainer").innerHTML = "";
    questionCount = 0;
    addQuestionBlock();
  } catch (error) {
    showMessage(`Could not save quiz: ${error.code || error.message}`, "error");
  } finally {
    submitButton.disabled = false;
  }
});
