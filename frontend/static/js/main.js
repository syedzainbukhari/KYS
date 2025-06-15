const dobInput = document.getElementById("dob");
const ageInput = document.getElementById("age");
dobInput.addEventListener("change", () => {
  const dob = new Date(dobInput.value);
  const age = new Date().getFullYear() - dob.getFullYear();
  ageInput.value = age;
});

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
