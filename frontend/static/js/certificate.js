class Certificate {
  constructor() {
    this.certificateData = null
    this.init()
  }

  init() {
    this.bindEvents()
    this.loadCertificateData()
  }

  bindEvents() {
    const downloadBtn = document.getElementById("downloadCert")
    const printBtn = document.getElementById("printCert")
    const shareBtn = document.getElementById("shareCert")

    if (downloadBtn) downloadBtn.addEventListener("click", () => this.downloadCertificate())
    if (printBtn) printBtn.addEventListener("click", () => this.printCertificate())
    if (shareBtn) shareBtn.addEventListener("click", () => this.shareCertificate())
  }

  async loadCertificateData() {
    try {
      console.log("🔄 Loading certificate data from Flask API...")

      // Show loading state
      this.showLoading()

      // Get URL parameters for score and time (if available)
      const params = new URLSearchParams(window.location.search);
      const score = params.get("score");
      const time = params.get("time");
      const userId = params.get("id");

      // Build API URL with parameters if they exist
        let apiUrl = `${window.location.origin}/api/certificate-data`

        if (score && time && userId) {
            const queryParams = new URLSearchParams({
                score,
                time,
                id: userId,
        }).toString()

            apiUrl += `?${queryParams}`
            console.log(`📊 Final API URL: ${apiUrl}`)
        } else {
            console.warn("⚠️ Missing one or more parameters: score, time, or id")
        }

      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      console.log("✅ Certificate data received:", data)

      if (data.success) {
        this.certificateData = data
        this.displayCertificate()
        this.showCertificate()
      } else {
        this.showError(data.message || "Failed to load certificate data")
      }
    } catch (error) {
      console.error("❌ Error loading certificate data:", error)
      this.showError("Network error. Please check your connection and try again.")
    }
  }

  showLoading() {
    const loading = document.getElementById("loading")
    const certificate = document.getElementById("certificate")
    const errorMessage = document.getElementById("error-message")

    if (loading) loading.style.display = "flex"
    if (certificate) certificate.classList.remove("show")
    if (errorMessage) errorMessage.classList.remove("show")
  }

  showCertificate() {
    const loading = document.getElementById("loading")
    const certificate = document.getElementById("certificate")
    const errorMessage = document.getElementById("error-message")

    if (loading) loading.style.display = "none"
    if (certificate) certificate.classList.add("show")
    if (errorMessage) errorMessage.classList.remove("show")
  }

  showError(message) {
    const loading = document.getElementById("loading")
    const certificate = document.getElementById("certificate")
    const errorMessage = document.getElementById("error-message")
    const errorText = document.getElementById("error-text")

    if (loading) loading.style.display = "none"
    if (certificate) certificate.classList.remove("show")
    if (errorMessage) errorMessage.classList.add("show")
    if (errorText) errorText.textContent = message
  }

  displayCertificate() {
    if (!this.certificateData) return

    console.log("🎨 Displaying certificate with data:", this.certificateData)

    // Display user name
    const nameElement = document.getElementById("certUserName")
    if (nameElement) {
      nameElement.textContent = this.certificateData.name || "Student"
    }

    // Display user photo
    const photoElement = document.getElementById("certUserPhoto")
    if (photoElement && this.certificateData.image) {
      photoElement.src = this.certificateData.image
      photoElement.classList.add("show")
      photoElement.onerror = function () {
        console.log("❌ Error loading user photo")
        this.style.display = "none"
      }
    }

    // Display score
    const scoreElement = document.getElementById("certScore")
    if (scoreElement) {
      scoreElement.textContent = `${this.certificateData.score || 0}/${this.certificateData.total_questions || 10}`
    }

    // Display accuracy
    const accuracyElement = document.getElementById("certAccuracy")
    if (accuracyElement) {
      accuracyElement.textContent = `${this.certificateData.accuracy || 0}%`
    }

    // Display formatted time
    const timeElement = document.getElementById("certTime")
    if (timeElement) {
      timeElement.textContent = this.certificateData.time_formatted || "0:00"
    }

    // Display quiz level
    const levelElement = document.getElementById("certLevel")
    if (levelElement) {
      levelElement.textContent = this.certificateData.quiz_level || "General"
    }

    // Calculate and display grade
    const gradeElement = document.getElementById("certGrade")
    if (gradeElement) {
      const grade = this.calculateGrade(this.certificateData.accuracy || 0)
      gradeElement.textContent = grade
    }

    // Display medal
    this.displayMedal(this.certificateData.accuracy || 0)

    // Display date
    const dateElement = document.getElementById("certDate")
    if (dateElement) {
      dateElement.textContent =
        this.certificateData.date ||
        new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
    }

    // Display certificate ID
    const certIdElement = document.getElementById("certificate-id")
    if (certIdElement) {
      certIdElement.textContent = `Certificate ID: ${this.certificateData.certificate_id || "N/A"}`
    }
  }

  displayMedal(accuracy) {
    const medalSection = document.getElementById("medal-section")
    if (!medalSection) return

    let medal = ""
    if (accuracy >= 90) {
      medal = '<div class="medal gold-medal"><i class="fas fa-medal"></i></div>'
    } else if (accuracy >= 75) {
      medal = '<div class="medal silver-medal"><i class="fas fa-medal"></i></div>'
    } else if (accuracy >= 60) {
      medal = '<div class="medal bronze-medal"><i class="fas fa-medal"></i></div>'
    } else {
      medal = '<div class="medal" style="color: var(--primary-color);"><i class="fas fa-star"></i></div>'
    }

    medalSection.innerHTML = medal
  }

  calculateGrade(accuracy) {
    if (accuracy >= 90) return "Outstanding performance! You're a quiz champion!"
    if (accuracy >= 75) return "Great job! You've shown excellent knowledge!"
    if (accuracy >= 60) return "Well done! Keep practicing to improve further!"
    return "Good effort! Every step in learning counts!"
  }

async downloadCertificate() {
    try {
        const downloadBtn = document.getElementById("downloadCert")
        if (downloadBtn) {
      downloadBtn.disabled = true
      downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...'
    }

        const certificate = document.getElementById("certificate")

    // Check if html2canvas is available
        const html2canvas = window.html2canvas
        if (typeof html2canvas !== "undefined") {
        console.log("📸 Using html2canvas for download...")

      // 👉 Hide decorative background to prevent opacity effect
        certificate.classList.add("no-decor")
        
        const canvas = await html2canvas(certificate, {
            scale: 2,
            backgroundColor: "#ffffff", // Ensure solid background
            useCORS: true,
            allowTaint: true,
            logging: false,
      })

      // 👉 Restore background after capture
        certificate.classList.remove("no-decor")

        const link = document.createElement("a")
        link.download = `smart-kid-certificate-${this.certificateData?.name?.replace(/\s+/g, "-") || "user"}-${Date.now()}.png`
        link.href = canvas.toDataURL("image/png", 1.0)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

            console.log("✅ Certificate downloaded successfully")
      } else {
      console.log("⚠️ html2canvas not available, using fallback...")

      const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Certificate - ${this.certificateData?.name || "User"}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .certificate { border: 2px solid #gold; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          ${certificate.outerHTML}
        </body>
        </html>
      `

      const blob = new Blob([certificateHTML], { type: "text/html" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `certificate-${this.certificateData?.name?.replace(/\s+/g, "-") || "user"}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error("❌ Error downloading certificate:", error)
    alert("Error downloading certificate. Please try again.")
  } finally {
    const downloadBtn = document.getElementById("downloadCert")
    if (downloadBtn) {
      downloadBtn.disabled = false
      downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Certificate'
    }
  }
}


  printCertificate() {
    console.log("🖨️ Printing certificate...")

    // Hide action buttons before printing
    const actionButtons = document.querySelector(".action-buttons")
    if (actionButtons) {
      actionButtons.style.display = "none"
    }

    // Print
    window.print()

    // Show action buttons after printing
    setTimeout(() => {
      if (actionButtons) {
        actionButtons.style.display = "block"
      }
    }, 1000)
  }

  async shareCertificate() {
    console.log("📤 Sharing certificate...")

    const shareData = {
      title: "Smart Kid Portal Certificate",
      text: `I just completed a quiz on Smart Kid Portal and scored ${this.certificateData?.score || 0}/${this.certificateData?.total_questions || 10}!`,
      url: window.location.href,
    }

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData)
        console.log("✅ Certificate shared successfully")
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("❌ Error sharing:", error)
          this.fallbackShare()
        }
      }
    } else {
      this.fallbackShare()
    }
  }

  fallbackShare() {
    // Fallback: copy link to clipboard
    try {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert("📋 Certificate link copied to clipboard!")
        console.log("✅ Link copied to clipboard")
      })
    } catch (error) {
      console.error("❌ Error copying to clipboard:", error)

      // Final fallback: show the URL
      const url = window.location.href
      prompt("Copy this link to share your certificate:", url)
    }
  }

  // Utility method to format time
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Utility method to get age group
  getAgeGroup(age) {
    if (age >= 6 && age <= 10) return "Beginner (6-10 years)"
    if (age >= 11 && age <= 16) return "Intermediate (11-16 years)"
    if (age >= 17) return "Advanced (17+ years)"
    return "General"
  }
}

// Initialize certificate when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Initializing Certificate...")
  new Certificate()
})

// Handle page visibility change (for debugging)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.log("👁️ Page is now visible")
  }
})
