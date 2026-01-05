
const timerEl = document.getElementById("timer");
let remaining = 60 * 60;
let timerInterval = null;

function fmt(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function startTimer() {
  clearInterval(timerInterval);
  timerEl.textContent = fmt(remaining);
  timerInterval = setInterval(() => {
    remaining = Math.max(0, remaining - 1);
    timerEl.textContent = fmt(remaining);
    if (remaining === 0) clearInterval(timerInterval);
  }, 1000);
}
startTimer();


const STORAGE_KEY = "blitz_questions_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ questions, votedIds }));
}


let questions = [
  { id: crypto.randomUUID(), text: "Warum funktioniert Dijkstra nicht mit negativen Kanten?", votes: 7, ts: Date.now() - 1000 * 60 * 18 },
  { id: crypto.randomUUID(), text: "Wie genau wird die Relaxation im Algorithmus angewendet?", votes: 4, ts: Date.now() - 1000 * 60 * 9 },
  { id: crypto.randomUUID(), text: "Was ist der Unterschied zwischen BFS und Dijkstra in der Praxis?", votes: 2, ts: Date.now() - 1000 * 60 * 4 },
];

let votedIds = new Set();

const saved = loadState();
if (saved?.questions && Array.isArray(saved.questions)) {
  questions = saved.questions;
}
if (saved?.votedIds && Array.isArray(saved.votedIds)) {
  votedIds = new Set(saved.votedIds);
}


const listEl = document.getElementById("questionList");
const sortSelect = document.getElementById("sortSelect");
const input = document.getElementById("questionInput");
const charCount = document.getElementById("charCount");
const submitBtn = document.getElementById("submitQuestion");
const toast = document.getElementById("toast");


input.addEventListener("input", () => {
  charCount.textContent = `${input.value.length}/160`;
});


function getSorted() {
  const mode = sortSelect.value;
  const arr = [...questions];
  if (mode === "new") {
    arr.sort((a, b) => b.ts - a.ts);
  } else {

    arr.sort((a, b) => (b.votes - a.votes) || (b.ts - a.ts));
  }
  return arr;
}

sortSelect.addEventListener("change", render);


function render() {
  const items = getSorted();
  listEl.innerHTML = "";

  if (items.length === 0) {
    listEl.innerHTML = `<div class="muted small">Noch keine Fragen. Stell die erste.</div>`;
    return;
  }

  for (const q of items) {
    const voted = votedIds.has(q.id);

    const el = document.createElement("div");
    el.className = "item";
    el.innerHTML = `
      <div class="itemLeft">
        <p class="itemText"></p>
        <div class="itemMeta">
          <span>${timeAgo(q.ts)}</span>
          <span>•</span>
          <span>${q.votes} Vote${q.votes === 1 ? "" : "s"}</span>
        </div>
      </div>
      <div class="voteBox">
        <button class="voteBtn ${voted ? "voted" : ""}" aria-label="Frage upvoten">▲</button>
        <div class="voteCount">${q.votes}</div>
      </div>
    `;

    el.querySelector(".itemText").textContent = q.text;

    el.querySelector(".voteBtn").addEventListener("click", () => {
      // prototype behavior: toggle vote
      const qq = questions.find(x => x.id === q.id);
      if (!qq) return;

      if (votedIds.has(q.id)) {
        votedIds.delete(q.id);
        qq.votes = Math.max(0, qq.votes - 1);
      } else {
        votedIds.add(q.id);
        qq.votes += 1;
      }
      persistAndRerender();
    });

    listEl.appendChild(el);
  }
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const h = Math.floor(min / 60);
  return `vor ${h} Std`;
}

function persistAndRerender() {
  saveState();
  render();
}

render();

// --- Submit new question ---
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove("hidden");
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => toast.classList.add("hidden"), 1400);
}

submitBtn.addEventListener("click", () => {
  const text = (input.value || "").trim();
  if (text.length < 5) {
    showToast("Bitte etwas konkreter (min. 5 Zeichen).");
    return;
  }

  const q = {
    id: crypto.randomUUID(),
    text,
    votes: 0,
    ts: Date.now()
  };

  questions.push(q);
  input.value = "";
  charCount.textContent = "0/160";

  // keep current sort; typically top. your new question appears accordingly
  showToast("Gesendet ✓");
  persistAndRerender();
});
