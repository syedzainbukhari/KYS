// let questions = [];
// let current = 0;
// let score = 0;
// let startTime = new Date();

// window.onload = async () => {
//   const res = await fetch('/get-user');
//   const user = await res.json();
//   const age = user.age;

//   let file = 'group_a.json';
//   if (age >= 11 && age <= 16) file = 'group_b.json';
//   else if (age >= 17) file = 'group_c.json';

//   const quizData = await fetch(`/static/questions/${file}`);
//   questions = await quizData.json();

//   showQuestion();
// };

// function showQuestion() {
//   const q = questions[current];
//   const container = document.getElementById('question-box');
//   const nextBtn = document.getElementById('next-btn');

//   container.innerHTML = `
//     <h2>${q.question}</h2>
//     ${q.options.map((opt) =>
//       `<label><input type="radio" name="answer" value="${opt}"> ${opt}</label><br>`).join('')}
//   `;

//   nextBtn.style.display = 'block';
//   nextBtn.onclick = nextQuestion;
// }

// function updateScoreDisplay() {
//   document.getElementById('score-box').innerText = `Score: ${score}`;
// }

// function nextQuestion() {
//   const selected = document.querySelector('input[name="answer"]:checked');
//   if (!selected) return alert('Please select an answer.');

//   if (selected.value === questions[current].answer) {
//     score++;
//     updateScoreDisplay(); // UPDATE LIVE SCORE
//   }

//   current++;
//   if (current < questions.length) {
//     showQuestion();
//   } else {
//     finishQuiz();
//   }
// }

// function finishQuiz() {
//   const endTime = new Date();
//   const timeTaken = Math.floor((endTime - startTime) / 1000);
//   const container = document.getElementById('question-box');
//   const result = document.getElementById('result');
//   const nextBtn = document.getElementById('next-btn');

//   container.innerHTML = '';
//   nextBtn.style.display = 'none';
//   result.innerHTML = `<h2>Quiz Completed</h2>
//     <p>Score: ${score} / ${questions.length}</p>
//     <p>Time: ${timeTaken} seconds</p>
//     <a href="/certificate?score=${score}&time=${timeTaken}">Get Certificate</a>`;
//   result.style.display = 'block';
// }
class Quiz {
  constructor() {
    this.userData = JSON.parse(localStorage.getItem("quizUserData")) || {}
    this.questions = []
    this.currentQuestion = 0
    this.score = 0
    this.startTime = Date.now()
    this.answers = []
    this.timeElapsed = 0
    this.timer = null

    this.init()
  }

  init() {
    this.displayUserInfo()
    this.loadQuestions()
    this.startTimer()
    this.bindEvents()
  }

  displayUserInfo() {
    document.getElementById("userName").textContent = this.userData.name || "User"
    document.getElementById("userAge").textContent = this.userData.age || "N/A"

    if (this.userData.photo) {
      document.getElementById("userPhoto").src = this.userData.photo
    }
  }

  bindEvents() {
    document.getElementById("prevBtn").addEventListener("click", () => this.previousQuestion())
    document.getElementById("nextBtn").addEventListener("click", () => this.nextQuestion())
    document.getElementById("submitQuiz").addEventListener("click", () => this.submitQuiz())
  }

  getAgeGroup() {
    const age = this.userData.age
    if (age >= 6 && age <= 10) return "child"
    if (age >= 12 && age <= 16) return "teen"
    if (age >= 17 && age <= 25) return "young-adult"
    return "adult"
  }

  async loadQuestions() {
    const ageGroup = this.getAgeGroup()

   

    this.questions = questionSets[ageGroup] || questionSets["young-adult"]
    document.getElementById("totalQuestions").textContent = this.questions.length
    this.answers = new Array(this.questions.length).fill(null)

    this.displayQuestion()
  }

  displayQuestion() {
    const question = this.questions[this.currentQuestion]
    document.getElementById("questionText").textContent = question.question
    document.getElementById("questionNumber").textContent = this.currentQuestion + 1

    const optionsContainer = document.getElementById("optionsContainer")
    optionsContainer.innerHTML = ""

    question.options.forEach((option, index) => {
      const optionElement = document.createElement("div")
      optionElement.className = "option"
      optionElement.textContent = option
      optionElement.addEventListener("click", () => this.selectOption(index))

      if (this.answers[this.currentQuestion] === index) {
        optionElement.classList.add("selected")
      }

      optionsContainer.appendChild(optionElement)
    })

    this.updateButtons()
    this.updateProgress()
  }

  selectOption(index) {
    this.answers[this.currentQuestion] = index

    // Update visual selection
    document.querySelectorAll(".option").forEach((option, i) => {
      option.classList.toggle("selected", i === index)
    })

    this.updateButtons()
  }

  updateButtons() {
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")
    const submitBtn = document.getElementById("submitQuiz")

    prevBtn.disabled = this.currentQuestion === 0

    const isLastQuestion = this.currentQuestion === this.questions.length - 1
    const hasAnswer = this.answers[this.currentQuestion] !== null

    if (isLastQuestion) {
      nextBtn.style.display = "none"
      submitBtn.style.display = "inline-block"
      submitBtn.disabled = !hasAnswer
    } else {
      nextBtn.style.display = "inline-block"
      submitBtn.style.display = "none"
      nextBtn.disabled = !hasAnswer
    }
  }

  updateProgress() {
    const progress = ((this.currentQuestion + 1) / this.questions.length) * 100
    document.getElementById("progress").style.width = progress + "%"
  }

  previousQuestion() {
    if (this.currentQuestion > 0) {
      this.currentQuestion--
      this.displayQuestion()
    }
  }

  nextQuestion() {
    if (this.currentQuestion < this.questions.length - 1) {
      this.currentQuestion++
      this.displayQuestion()
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeElapsed = Date.now() - this.startTime
      const minutes = Math.floor(this.timeElapsed / 60000)
      const seconds = Math.floor((this.timeElapsed % 60000) / 1000)
      document.getElementById("timer").textContent =
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }, 1000)
  }

  calculateScore() {
    this.score = 0
    this.answers.forEach((answer, index) => {
      if (answer === this.questions[index].correct) {
        this.score++
      }
    })
  }

  async submitQuiz() {
    clearInterval(this.timer)
    this.calculateScore()

    const quizResults = {
      ...this.userData,
      score: this.score,
      totalQuestions: this.questions.length,
      timeElapsed: this.timeElapsed,
      answers: this.answers,
      completedAt: new Date().toISOString(),
    }

    // Save results
    localStorage.setItem("quizResults", JSON.stringify(quizResults))

    try {
      // Save to database
      await this.saveQuizResults(quizResults)
    } catch (error) {
      console.error("Error saving quiz results:", error)
    }

    // Redirect to certificate
    window.location.href = "certificate.html"
  }

  async saveQuizResults(results) {
    const response = await fetch("/api/save-quiz-results", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(results),
    })

    if (!response.ok) {
      throw new Error("Failed to save quiz results")
    }

    return response.json()
  }
}

// Initialize quiz when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Quiz()
})
