class Certificate {
  constructor() {
    this.results = JSON.parse(localStorage.getItem("quizResults")) || {}
    this.init()
  }

  init() {
    this.displayCertificate()
    this.bindEvents()
  }

  bindEvents() {
    document.getElementById("downloadCert").addEventListener("click", () => this.downloadCertificate())
    document.getElementById("retakeQuiz").addEventListener("click", () => this.retakeQuiz())
    document.getElementById("newQuiz").addEventListener("click", () => this.startNewQuiz())
  }

  displayCertificate() {
    // Display user info
    document.getElementById("certUserName").textContent = this.results.name || "User"

    if (this.results.photo) {
      document.getElementById("certUserPhoto").src = this.results.photo
    }

    // Display results
    document.getElementById("certScore").textContent = `${this.results.score || 0}/${this.results.totalQuestions || 0}`

    // Format time
    const timeElapsed = this.results.timeElapsed || 0
    const minutes = Math.floor(timeElapsed / 60000)
    const seconds = Math.floor((timeElapsed % 60000) / 1000)
    document.getElementById("certTime").textContent =
      `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    // Calculate grade
    const percentage = (this.results.score / this.results.totalQuestions) * 100
    let grade = "Good"
    if (percentage >= 90) grade = "Excellent"
    else if (percentage >= 80) grade = "Very Good"
    else if (percentage >= 70) grade = "Good"
    else if (percentage >= 60) grade = "Fair"
    else grade = "Needs Improvement"

    document.getElementById("certGrade").textContent = grade

    // Display date
    const date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    document.getElementById("certDate").textContent = date
  }

  async downloadCertificate() {
    try {
      // Use html2canvas library to convert certificate to image
      const certificate = document.getElementById("certificate")

      // Simple download as HTML for now
      const certificateHTML = certificate.outerHTML
      const blob = new Blob([certificateHTML], { type: "text/html" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `certificate-${this.results.name || "user"}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading certificate:", error)
      alert("Error downloading certificate. Please try again.")
    }
  }

  retakeQuiz() {
    // Keep user data but reset quiz
    const userData = {
      name: this.results.name,
      dob: this.results.dob,
      age: this.results.age,
      photo: this.results.photo,
    }
    localStorage.setItem("quizUserData", JSON.stringify(userData))
    window.location.href = "quiz.html"
  }

  startNewQuiz() {
    // Clear all data and start fresh
    localStorage.removeItem("quizUserData")
    localStorage.removeItem("quizResults")
    window.location.href = "index.html"
  }
}

// Initialize certificate when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new Certificate()
})
