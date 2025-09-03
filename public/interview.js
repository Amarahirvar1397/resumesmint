const startBtn = document.getElementById("start-interview");
const questionBox = document.getElementById("question");
const ratingBox = document.getElementById("rating");
const voiceIndicator = document.getElementById("voiceIndicator");
const aiGirl = document.getElementById("ai-girl");

const questions = [
  "Tell me about yourself.",
  "What are your strengths?",
  "Why should we hire you?",
  "Where do you see yourself in 5 years?",
  "What challenges have you overcome recently?"
];

let current = 0;

startBtn.addEventListener("click", () => {
  current = 0;
  ratingBox.textContent = "";
  askQuestion();
});

function askQuestion() {
  if (current < questions.length) {
    questionBox.textContent = questions[current];
    speak(questions[current]);
    listen();
  } else {
    questionBox.textContent = "✅ Interview finished! Great job 🎉";
    voiceIndicator.classList.remove("active");
    aiGirl.src = "assets/avatar-idle.png"; // 👈 reset to idle
  }
}

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.onstart = () => {
    voiceIndicator.classList.add("active");
    aiGirl.src = "assets/avatar-speaking.gif"; // 👈 speaking avatar
  };

  utterance.onend = () => {
    voiceIndicator.classList.remove("active");
    aiGirl.src = "assets/avatar-idle.png"; // 👈 back to idle
  };

  speechSynthesis.speak(utterance);
}

function listen() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.onresult = event => {
    const answer = event.results[0][0].transcript;
    const score = Math.floor(Math.random() * 10) + 1;
    ratingBox.textContent = `🎤 Your Answer: "${answer}" | ⭐ Score: ${score}/10`;
    current++;
    setTimeout(askQuestion, 2500);
  };
  recognition.start();
}
