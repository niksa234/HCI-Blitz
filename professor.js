const questions = [
  { text: "Warum funktioniert Dijkstra nur ohne negative Kanten?", answered: false },
  { text: "Was genau macht ein Heap in einem Graphenalgorithmus?", answered: false },
  { text: "Wie unterscheiden sich Breitensuche und Tiefensuche?", answered: false }
];

let currentIndex = 0;

const container = document.getElementById("questionContainer");

function showNextQuestion() {
  container.innerHTML = ""; // alte Frage entfernen

  if (currentIndex >= questions.length) {
    container.innerHTML = "<p>Alle Fragen wurden beantwortet 🎉</p>";
    return;
  }

  const q = questions[currentIndex];

  const card = document.createElement("div");
  card.className = "questionItem card";

  card.innerHTML = `
    <div class="questionText">${q.text}</div>
    <div class="answerField">
      <textarea class="textarea answerInput" rows="3" maxlength="300" placeholder="Antwort hier eingeben..."></textarea>
      <button class="btn primary submitAnswer">Antwort senden</button>
    </div>
    <div class="questionFooter">
      <span class="badge ${q.answered ? 'answered' : 'open'}">${q.answered ? 'BEANTWORTET' : 'OFFEN'}</span>
    </div>
  `;

  container.appendChild(card);

  const btn = card.querySelector(".submitAnswer");
  const textarea = card.querySelector(".answerInput");

  btn.addEventListener("click", () => {
    if (!textarea.value.trim()) return alert("Antwort darf nicht leer sein!");
    q.answered = true;
    currentIndex++;
    showNextQuestion();
  });
}

// erste Frage anzeigen
showNextQuestion();
