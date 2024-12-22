document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quiz-container");
  const submitBtn = document.getElementById("submit-btn");
  const url = document.getElementById("quiz-url");
  const resultDiv = document.getElementById("result");

  // Load quiz questions from JSON file
  fetch(url.value)
    .then((response) => response.json())
    .then((quizData) => {
      displayQuiz(quizData);

      submitBtn.addEventListener("click", () => {
        const score = calculateScore(quizData);
        resultDiv.textContent = `Your score: ${score} / ${quizData.length}`;
      });
    })
    .catch((error) => console.error("Error loading quiz:", error));

  function displayQuiz(quizData) {
    quizData.forEach((item, index) => {
      const questionDiv = document.createElement("div");
      questionDiv.classList.add("question");

      const questionTitle = document.createElement("h3");
      questionTitle.textContent = `Q${index + 1}: ${item.question}`;
      questionDiv.appendChild(questionTitle);

      const optionsDiv = document.createElement("div");
      optionsDiv.classList.add("options");

      item.options.forEach((option) => {
        const label = document.createElement("label");
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = `question-${index}`;
        radio.value = option;
        label.appendChild(radio);
        label.appendChild(document.createTextNode(option));
        optionsDiv.appendChild(label);
        optionsDiv.appendChild(document.createElement("br"));
      });

      questionDiv.appendChild(optionsDiv);
      quizContainer.appendChild(questionDiv);
    });
  }

  function calculateScore(quizData) {
    let score = 0;
    quizData.forEach((item, index) => {
      const selectedOption = document.querySelector(
        `input[name="question-${index}"]:checked`
      );
      if (selectedOption && selectedOption.value === item.answer) {
        score++;
      }
    });
    return score;
  }
});
