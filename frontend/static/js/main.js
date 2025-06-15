// const dobInput = document.getElementById("dob");
// const ageInput = document.getElementById("age");
// dobInput.addEventListener("change", () => {
//   const dob = new Date(dobInput.value);
//   const age = new Date().getFullYear() - dob.getFullYear();
//   ageInput.value = age;

//   setQuizCategory(age); // ✅ This line updates the category
// });


// const video = document.getElementById("video");
// const canvas = document.getElementById("canvas");
// const captureBtn = document.getElementById("capture");
// const previewImg = document.getElementById("snapshot-preview");

// navigator.mediaDevices.getUserMedia({ video: true })
//   .then((stream) => {
//     video.srcObject = stream;
//   })
//   .catch((err) => {
//     alert("Unable to access camera: " + err);
//   });

// captureBtn.addEventListener("click", () => {
//   canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
//   const imageData = canvas.toDataURL("image/jpeg");
//   previewImg.src = imageData;
//   previewImg.style.display = "block";
// });

// document.getElementById("user-form").addEventListener("submit", (e) => {
//   e.preventDefault();

//   const name = document.getElementById("name").value;
//   const dob = document.getElementById("dob").value;
//   const age = document.getElementById("age").value;
//   const imageData = canvas.toDataURL("image/jpeg");

//   fetch("/register", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ name, dob, age, image: imageData }),
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       if (data.success) {
//         window.location.href = "/quiz";
//       } else {
//         alert("Error: " + data.message);
//       }
//     })
//     .catch((error) => {
//       console.error("Registration failed:", error);
//     });
// });

const dobInput = document.getElementById("dob");
const ageInput = document.getElementById("age");

// Set category based on age
function setQuizCategory(age) {
  let category = 'Beginner (6–10 years)';
  if (age >= 11 && age <= 16) category = 'Intermediate (11–16 years)';
  else if (age >= 17) category = 'Advanced (17+ years)';

  const categoryElement = document.getElementById("quiz-category");
  if (categoryElement) {
    categoryElement.textContent = category;
  }
}

dobInput.addEventListener("change", () => {
  const dob = new Date(dobInput.value);
  const age = new Date().getFullYear() - dob.getFullYear();
  ageInput.value = age;

  setQuizCategory(age); // ✅ Update category
});

// Webcam preview logic
const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const previewImg = document.getElementById("snapshot-preview");

navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((err) => {
    alert("Unable to access camera: " + err);
  });

captureBtn.addEventListener("click", () => {
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = canvas.toDataURL("image/jpeg");
  previewImg.src = imageData;
  previewImg.style.display = "block";
});

// Form submission
document.getElementById("user-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const dob = document.getElementById("dob").value;
  const age = document.getElementById("age").value;
  const imageData = canvas.toDataURL("image/jpeg");

  fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, dob, age, image: imageData }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        window.location.href = "/quiz";
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Registration failed:", error);
    });
});
