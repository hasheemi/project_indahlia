document.addEventListener("DOMContentLoaded", () => {
  const quizContainer = document.getElementById("quiz-container");
  const submitBtn = document.getElementById("submit-btn");
  const url = document.getElementById("quiz-url");
  const resultDiv = document.getElementById("result");

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
    const quizHTML = quizData
      .map((item, index) => {
        const optionsHTML = item.options
          .map(
            (option, i) => `
            <input type="radio" name="question-${index}" id="question-${index}-${i}" value="${option}">
              <label class="option" for="question-${index}-${i}">
                ${option}
              </label><br>
            `
          )
          .join("");

        return `
          <div class="question">
            <span>Pertanyaan ${index + 1}</span>
            <h4>${item.question}</h4>
            <div class="options">${optionsHTML}</div>
          </div>
        `;
      })
      .join("");

    quizContainer.innerHTML = quizHTML;
  }

  function calculateScore(quizData) {
    return quizData.reduce((score, item, index) => {
      const selectedOption = document.querySelector(
        `input[name="question-${index}"]:checked`
      );
      return (
        score + (selectedOption && selectedOption.value === item.answer ? 1 : 0)
      );
    }, 0);
  }
});
