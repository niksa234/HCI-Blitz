/**
 * professor.js
 * - prof.html: Session konfigurieren und starten
 * - ProfSession.html: Session-Ansicht (wie Student) + Session beenden + Code anzeigen
 * - Prototyp: localStorage als "Backend"
 */

const STORAGE_KEY = "blitz_prof_session_v1";
const QUESTIONS_KEY = "blitz_questions_v1";

function $(id){ return document.getElementById(id); }
function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

function randomCode(len = 6){
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i=0;i<len;i++) out += alphabet[Math.floor(Math.random()*alphabet.length)];
  return out;
}

function saveSession(session){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}
function loadSession(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
  catch { return null; }
}

function saveQuestions(arr){
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(arr));
}
function loadQuestions(){
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/* -----------------------------
   PAGE: prof.html (Setup)
----------------------------- */
(function initProfSetup(){
  const moduleInput = $("moduleInput");
  if (!moduleInput) return;

  const topicInput = $("topicInput");
  const promptInput = $("promptInput");
  const startBtn = $("startBtn");
  const errorBox = $("errorBox");

  let selectedMin = 60;
  const durationButtons = qsa('button[data-min]');

  function setSelected(min){
    selectedMin = min;
    durationButtons.forEach(b => {
      b.classList.remove("primary");
      if (parseInt(b.dataset.min, 10) === min) b.classList.add("primary");
    });
  }

  durationButtons.forEach(b => {
    b.addEventListener("click", () => setSelected(parseInt(b.dataset.min, 10)));
  });
  setSelected(60);

  startBtn.addEventListener("click", () => {
    const module = (moduleInput.value || "").trim();
    const topic  = (topicInput.value || "").trim();
    const prompt = (promptInput.value || "").trim();

    if (!module || !topic || !prompt){
      errorBox.style.display = "block";
      return;
    }
    errorBox.style.display = "none";

    const code = randomCode(6);
    const now = Date.now();
    const durationMs = selectedMin * 60 * 1000;

    const session = {
      code,
      module,
      topic,
      prompt,
      durationMin: selectedMin,
      startTs: now,
      endTs: now + durationMs,
      status: "OPEN"
    };

    saveSession(session);

    // Init questions if empty
    const existing = loadQuestions();
    if (existing.length === 0){
      saveQuestions([
        { id: crypto.randomUUID(), text: "Warum funktioniert Dijkstra nicht mit negativen Kanten?", votes: 7, ts: Date.now() - 1000*60*18 },
        { id: crypto.randomUUID(), text: "Was ist der Unterschied zwischen BFS und Dijkstra?", votes: 4, ts: Date.now() - 1000*60*9 },
        { id: crypto.randomUUID(), text: "Wie genau wird die Relaxation angewendet?", votes: 2, ts: Date.now() - 1000*60*4 },
      ]);
    }

    window.location.href = `ProfSession.html?code=${encodeURIComponent(code)}`;
  });
})();

/* -----------------------------
   PAGE: ProfSession.html (Dashboard)
----------------------------- */
(function initProfSession(){
  const moduleName = $("moduleName");
  if (!moduleName) return;

  const sessionName = $("sessionName");
  const profPrompt  = $("profPrompt");
  const codeBox     = $("codeBox");
  const statusBadge = $("statusBadge");
  const timerEl     = $("timer");
  const endBtn      = $("endBtn");
  const sortSelect  = $("sortSelect");
  const listEl      = $("questionList");

  const params = new URLSearchParams(window.location.search);
  const urlCode = (params.get("code") || "").toUpperCase();
  const session = loadSession();

  if (!session || (urlCode && session.code !== urlCode)){
    moduleName.textContent = "Session nicht gefunden";
    sessionName.textContent = "Bitte starte eine neue Session.";
    profPrompt.textContent = "—";
    codeBox.textContent = urlCode || "—";
    statusBadge.textContent = "UNBEKANNT";
    statusBadge.classList.remove("open");
    endBtn.disabled = true;
    return;
  }

  moduleName.textContent = session.module;
  sessionName.textContent = `Session: ${session.topic}`;
  profPrompt.textContent = session.prompt;
  codeBox.textContent = session.code;

  let timerInterval = null;

  function fmt(sec){
    const m = Math.floor(sec/60);
    const s = sec % 60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  function setStatus(open){
    if (open){
      statusBadge.textContent = "OFFEN";
      statusBadge.classList.add("open");
    } else {
      statusBadge.textContent = "BEENDET";
      statusBadge.classList.remove("open");
    }
  }

  function tick(){
    const now = Date.now();
    const remainingSec = Math.max(0, Math.floor((session.endTs - now)/1000));
    timerEl.textContent = fmt(remainingSec);

    if (remainingSec <= 0){
      clearInterval(timerInterval);
      session.status = "CLOSED";
      saveSession(session);
      setStatus(false);
      endBtn.disabled = true;
    }
  }

  setStatus(session.status === "OPEN");
  if (session.status !== "OPEN"){
    endBtn.disabled = true;
  }

  timerInterval = setInterval(tick, 1000);
  tick();

  endBtn.addEventListener("click", () => {
    session.status = "CLOSED";
    session.endTs = Date.now();
    saveSession(session);
    setStatus(false);
    endBtn.disabled = true;
    tick();
  });

  // Questions rendering
  let questions = loadQuestions();

  function timeAgo(ts){
    const diff = Date.now() - ts;
    const min = Math.floor(diff/60000);
    if (min < 1) return "gerade eben";
    if (min < 60) return `vor ${min} Min`;
    const h = Math.floor(min/60);
    return `vor ${h} Std`;
  }

  function sorted(){
    const mode = sortSelect.value;
    const arr = [...questions];
    if (mode === "new") arr.sort((a,b) => b.ts - a.ts);
    else arr.sort((a,b) => (b.votes - a.votes) || (b.ts - a.ts));
    return arr;
  }

  function render(){
    listEl.innerHTML = "";
    const arr = sorted();

    if (arr.length === 0){
      listEl.innerHTML = `<div class="muted small">Noch keine Fragen eingegangen.</div>`;
      return;
    }

    for (const q of arr){
      const item = document.createElement("div");
      item.className = "item";

      item.innerHTML = `
        <div class="itemLeft">
          <p class="itemText"></p>
          <div class="itemMeta">
            <span>${timeAgo(q.ts)}</span>
            <span>•</span>
            <span>${q.votes} Vote${q.votes===1?"":"s"}</span>
          </div>
        </div>
        <div class="voteBox">
          <button class="voteBtn" aria-label="Upvote">▲</button>
          <div class="voteCount">${q.votes}</div>
        </div>
      `;

      item.querySelector(".itemText").textContent = q.text;

      item.querySelector(".voteBtn").addEventListener("click", () => {
        if (session.status !== "OPEN") return;
        const qq = questions.find(x => x.id === q.id);
        if (!qq) return;
        qq.votes += 1;
        saveQuestions(questions);
        render();
      });

      listEl.appendChild(item);
    }
  }

  sortSelect.addEventListener("change", render);
  render();
})();
