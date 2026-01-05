const input = document.getElementById("sessionCode");
const btn = document.getElementById("joinBtn");
const error = document.getElementById("error");

function norm(v){ return (v || "").trim().toUpperCase(); }

function go(){
  const code = norm(input.value);

  if (code.length < 4){
    error.classList.remove("hidden");
    return;
  }
  error.classList.add("hidden");

  // Weiterleitung zur student.html mit Code in der URL
  window.location.href = `student.html?code=${encodeURIComponent(code)}`;
}

btn.addEventListener("click", go);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter"){
    e.preventDefault();
    go();
  }
});
