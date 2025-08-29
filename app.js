/* ======================
   Quiz data & generation
   ====================== */
const QUESTIONS = [
  { q: "Обчисліть: 7 + 5 × 3", a: 22 },
  { q: "Спростіть: (18 − 6) ÷ 3 + 4", a: 8 },
  { q: "Скільки буде 2^5 ?", a: 32 },
  { q: "Знайдіть x, якщо 3x + 9 = 24", a: 5 },
  { q: "Обчисліть: 15 mod 4", a: 3 },
  { q: "Сума перших трьох парних чисел (2 + 4 + 6)", a: 12 },
];

const form = document.getElementById("quiz-form");
const progressBar = document.getElementById("progress-bar");
const checkBtn = document.getElementById("check-btn");
const resetBtn = document.getElementById("reset-btn");
const modal = document.getElementById("modal");
const closeModal = document.getElementById("close-modal");
const yay = document.getElementById("yay");

function createItem(idx, question){
  const wrap = document.createElement("div");
  wrap.className = "item";

  wrap.innerHTML = `
    <p class="q">${idx+1}. ${question.q}</p>
    <div class="input">
      <span>=</span>
      <input type="number" step="any" data-idx="${idx}" placeholder="Відповідь">
    </div>
    <div class="hint">Порада: запишіть лише результат.</div>
  `;
  return wrap;
}

function render(){
  form.innerHTML = "";
  QUESTIONS.forEach((q, i)=> form.appendChild(createItem(i, q)));
}
render();

function updateProgress(){
  const inputs = [...form.querySelectorAll("input")];
  const filled = inputs.filter(i => i.value.trim() !== "").length;
  const percent = Math.round( (filled / inputs.length) * 100 );
  progressBar.style.width = percent + "%";
  checkBtn.disabled = filled !== inputs.length;
}
form.addEventListener("input", updateProgress);
updateProgress();

function checkAnswers(){
  const inputs = [...form.querySelectorAll("input")];
  let correct = 0;
  inputs.forEach((input, i)=>{
    const val = Number(input.value);
    const ans = Number(QUESTIONS[i].a);
    const ok = Math.abs(val - ans) < 1e-9; // exact for integers
    input.style.borderColor = ok ? "rgba(126,246,194,.9)" : "rgba(255,110,110,.9)";
    if(ok) correct++;
  });
  if(correct === QUESTIONS.length){
    celebrate();
  } else {
    shake(form);
  }
}

checkBtn.addEventListener("click", (e)=>{
  e.preventDefault();
  checkAnswers();
});

resetBtn.addEventListener("click", (e)=>{
  e.preventDefault();
  [...form.querySelectorAll("input")].forEach(i=>{
    i.value = "";
    i.style.borderColor = "rgba(255,255,255,.14)";
  });
  updateProgress();
});

// Tiny UI flourish
function shake(el){
  el.animate(
    [
      { transform: "translateX(0px)" },
      { transform: "translateX(-6px)" },
      { transform: "translateX(6px)" },
      { transform: "translateX(0px)" },
    ],
    { duration: 260, iterations: 1 }
  );
}

/* ======================
   Celebration: modal + confetti
   ====================== */
function celebrate(){
  modal.classList.remove("hidden");
  runConfetti(140);
  setTimeout(()=> runConfetti(100), 900);
}

function hideModal(){ modal.classList.add("hidden"); }
closeModal.addEventListener("click", hideModal);
yay.addEventListener("click", hideModal);
modal.addEventListener("click", (e)=>{ if(e.target === modal) hideModal(); });

// Lightweight confetti (no libs)
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
let W = 0, H = 0;

function resize(){
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

let confetti = [];
function runConfetti(count=100){
  for(let i=0;i<count;i++){
    confetti.push({
      x: Math.random()*W,
      y: -20,
      r: 4 + Math.random()*6,
      vx: (Math.random()-.5)*2,
      vy: 2 + Math.random()*3,
      rot: Math.random()*360,
      vr: -4 + Math.random()*8,
      // pick from a soft palette matching theme
      color: Math.random()<.5 ? "#7ef6c2" : "#ffd166"
    });
  }
  if(!animating) animate();
}

let animating = false;
function animate(){
  animating = true;
  ctx.clearRect(0,0,W,H);
  for(let i=confetti.length-1; i>=0; i--){
    const p = confetti[i];
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    drawRect(p.x, p.y, p.r, p.rot, p.color);
    if(p.y > H + 30) confetti.splice(i,1);
  }
  if(confetti.length){
    requestAnimationFrame(animate);
  } else {
    animating = false;
  }
}

function drawRect(x,y,r,rot,color){
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(rot*Math.PI/180);
  ctx.fillStyle = color;
  ctx.fillRect(-r/2, -r/2, r, r*1.4);
  ctx.restore();
}
