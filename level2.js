let answers = {
    1: false,
    2: true,
    3: false,
    4: true
    // Add more answers as needed
};
let correctAnswers = 0;

function checkAnswer(questionNumber, response, button) {
    let questionBlock = button.parentNode;
    if (answers[questionNumber] === response) {
        // Disable all buttons in this question block
        questionBlock.querySelectorAll('button').forEach(btn => {
            btn.disabled = true;
        });
        // Show the "已答對" message briefly, then hide the buttons
        button.textContent = "已答對";
        setTimeout(() => {
            questionBlock.querySelectorAll('button').forEach(btn => {
                btn.style.display = "none"; // Hide the buttons
            });
        }, 1000); // Adjust the timeout as needed for better user experience
        correctAnswers++;
        // Display the next level button if all questions are answered correctly
        if (correctAnswers === Object.keys(answers).length) {
            document.getElementById("nextLevel").style.display = "block";
        }
    } else {
        button.textContent = "答錯了，再試一次";
        setTimeout(() => {
            button.textContent = button.value === "true" ? "是" : "否";
        }, 1000);
    }
}
