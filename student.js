const joinBtn = document.getElementById("joinBtn");
const sendBtn = document.getElementById("sendBtn");
const resetBtn = document.getElementById("resetBtn");
const backBtn = document.getElementById("backBtn");

const joinCard = document.getElementById("joinCard");
const statusCard = document.getElementById("statusCard");
const noticeCard = document.getElementById("noticeCard");
const questionsCard = document.getElementById("questionsCard");
const confirmCard = document.getElementById("confirmCard");

const codeInput = document.getElementById("code");
const codeEcho = document.getElementById("codeEcho");

const timerEl = document.getElementById("timer");
let timerInterval = null;
let remaining = 60 * 60; // 60:00 fake

// selection handling for chips
document.querySelectorAll(".choices, .scale").forEach(group => {
  group.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    // single-select within group
    group.querySelectorAll(".chip").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
  });
});

// text count
const q4 = document.getElementById("q4");
const charCount = document.getElementById("charCount");
q4.addEventListener("input", () => {
  charCount.textContent = `${q4.value.length}/120`;
});

function fmt(sec){
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

function startTimer(){
  clearInterval(timerInterval);
  remaining = 60 * 60;
  timerEl.textContent = fmt(remaining);
  timerInterval = setInterval(() => {
    remaining = Math.max(0, remaining - 1);
    timerEl.textContent = fmt(remaining);
    if (remaining === 0) clearInterval(timerInterval);
  }, 1000);
}

function showSessionUI(code){
  codeEcho.textContent = code || "—";
  joinCard.classList.add("hidden");
  statusCard.classList.remove("hidden");
  noticeCard.classList.remove("hidden");
  questionsCard.classList.remove("hidden");
  confirmCard.classList.add("hidden");
  startTimer();
}

function showConfirm(){
  questionsCard.classList.add("hidden");
  confirmCard.classList.remove("hidden");
}

function resetAll(){
  // clear selections
  document.querySelectorAll(".chip.selected").forEach(b => b.classList.remove("selected"));
  q4.value = "";
  charCount.textContent = "0/120";
}

function backToJoin(){
  clearInterval(timerInterval);
  resetAll();
  codeInput.value = "";
  joinCard.classList.remove("hidden");
  statusCard.classList.add("hidden");
  noticeCard.classList.add("hidden");
  questionsCard.classList.add("hidden");
  confirmCard.classList.add("hidden");
}

joinBtn.addEventListener("click", () => {
  const code = (codeInput.value || "").trim().toUpperCase();
  showSessionUI(code || "A1B2C3");
});

sendBtn.addEventListener("click", () => {
  // no real submit, just UI
  showConfirm();
});

resetBtn.addEventListener("click", resetAll);
backBtn.addEventListener("click", backToJoin);

// Optional: auto-fill code from URL (?code=ABC123) for nicer demo
const params = new URLSearchParams(window.location.search);
const urlCode = params.get("code");
if (urlCode){
  codeInput.value = urlCode.toUpperCase();
}
