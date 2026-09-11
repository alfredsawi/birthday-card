const scenes = {
  intro: document.getElementById("intro"),
  cake: document.getElementById("cakeScene"),
  envelope: document.getElementById("envelopeScene"),
  letter: document.getElementById("birthdayCard"),
  balloons: document.getElementById("balloonScene"),
  final: document.getElementById("finalScene")
};

const openBtn = document.getElementById("openBtn");
const blowBtn = document.getElementById("blowBtn");
const wishText = document.getElementById("wishText");
const envelopeEl = document.getElementById("envelope");
const openEnvelopeBtn = document.getElementById("openEnvelopeBtn");
const finishBtn = document.getElementById("finishBtn");
const balloonHint = document.getElementById("balloonHint");
const balloonCount = document.getElementById("balloonCount");
const replayBtn = document.getElementById("replayBtn");

const soundBtn = document.getElementById("soundBtn");
const visualizer = document.getElementById("visualizer");
const music = document.getElementById("birthdayMusic");
const confetti = document.getElementById("confetti");
const fireworksCanvas = document.getElementById("fireworks");
const fwCtx = fireworksCanvas.getContext("2d");

let musicStarted = false;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function showScene(name) {
  Object.entries(scenes).forEach(([key, el]) => {
    if (key === "letter") return; // la lettre a sa propre logique show/closing
    el.classList.toggle("show", key === name);
  });
}

/* =========================
   1 -> 2 : INTRO -> GÂTEAU
========================= */

openBtn.addEventListener("click", () => {
  openBtn.disabled = true;
  showScene("cake");
});

/* =========================
   2 -> 3 : SOUFFLER LES BOUGIES "48"
========================= */

blowBtn.addEventListener("click", blowCandles);

function blowCandles() {
  blowBtn.disabled = true;
  const candles = document.querySelectorAll(".num-candle");
  candles.forEach((c, i) => setTimeout(() => c.classList.add("out"), i * 260));
  wishText.classList.add("show");
  setTimeout(() => showScene("envelope"), candles.length * 260 + 750);
}

/* =========================
   3 -> 4 : OUVRIR L'ENVELOPPE -> LETTRE
========================= */

openEnvelopeBtn.addEventListener("click", openEnvelope);

function openEnvelope() {
  if (openEnvelopeBtn.disabled) return;
  openEnvelopeBtn.disabled = true;
  envelopeEl.classList.add("open");
  setTimeout(openLetter, 750);
}

function openLetter() {
  scenes.envelope.classList.remove("show");
  scenes.letter.classList.add("show");
  startMusic();
  launchConfetti();
  launchFireworks(3);
  finishBtn.focus({ preventScroll: true });
}

/* =========================
   4 -> 5 : TERMINÉ DE LIRE -> BALLONS
========================= */

finishBtn.addEventListener("click", closeLetter);

function closeLetter() {
  if (finishBtn.disabled) return;
  finishBtn.disabled = true;
  scenes.letter.classList.add("closing");

  setTimeout(() => {
    scenes.letter.classList.remove("show", "closing");
    resetBalloonGame();
    showScene("balloons");
  }, 800);
}

/* =========================
   5 : MINI-JEU BALLONS
========================= */

let poppedCount = 0;
const totalBalloons = document.querySelectorAll(".game-balloon").length;
const hearts = ["💜", "💗", "✨", "💫"];

document.querySelectorAll(".game-balloon").forEach(b => {
  b.addEventListener("click", () => popBalloon(b));
});

function resetBalloonGame() {
  poppedCount = 0;
  document.querySelectorAll(".game-balloon").forEach(b => b.classList.remove("popped"));
  balloonCount.textContent = `${totalBalloons} restants`;
  balloonHint.textContent = "ÉCLATE LES 6 BALLONS DE VŒUX";
}

function popBalloon(balloon) {
  if (balloon.classList.contains("popped")) return;
  balloon.classList.add("popped");
  const rect = balloon.getBoundingClientRect();
  spawnHeart(rect.left + rect.width / 2, rect.top);
  poppedCount++;

  const left = totalBalloons - poppedCount;
  if (left > 0) {
    balloonCount.textContent = `${left} restant${left > 1 ? "s" : ""}`;
  } else {
    balloonCount.textContent = "Tous les vœux sont partis ! ✨";
    setTimeout(() => showScene("final"), 900);
  }
}

function spawnHeart(x, y) {
  const heart = document.createElement("div");
  heart.className = "heart-burst";
  heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
  heart.style.left = x + "px";
  heart.style.top = y + "px";
  document.body.appendChild(heart);
  setTimeout(() => heart.remove(), 800);
}

/* =========================
   6 : FINALE — "Bon anniversaire" + feux d'artifice
========================= */

let finalInterval;

const finalObserver = new MutationObserver(() => {
  if (scenes.final.classList.contains("show")) {
    launchFireworks(1);
    if (!finalInterval) finalInterval = setInterval(() => launchFireworks(1), 1400);
  } else if (finalInterval) {
    clearInterval(finalInterval);
    finalInterval = null;
  }
});
finalObserver.observe(scenes.final, { attributes: true, attributeFilter: ["class"] });

replayBtn.addEventListener("click", resetAll);

function resetAll() {
  if (finalInterval) { clearInterval(finalInterval); finalInterval = null; }
  music.pause();
  music.currentTime = 0;
  music.muted = true;
  musicStarted = false;
  setSoundUI(false);
  document.querySelectorAll(".num-candle").forEach(c => c.classList.remove("out"));
  wishText.classList.remove("show");
  envelopeEl.classList.remove("open");
  openEnvelopeBtn.disabled = false;
  blowBtn.disabled = false;
  openBtn.disabled = false;
  finishBtn.disabled = false;
  resetBalloonGame();
  showScene("intro");
  openBtn.focus({ preventScroll: true });
}

/* =========================
   SON + VISUALISEUR
========================= */

let audioCtx, analyser, freqData, visRAF;

function setSoundUI(on) {
  soundBtn.textContent = on ? "🔊" : "🔇";
  soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
  visualizer.classList.toggle("active", on);
  if (on) startVisualizer(); else stopVisualizer();
}

function startMusic() {
  if (musicStarted) return;
  music.volume = 0.35;
  music.muted = false;
  music.play()
    .then(() => { musicStarted = true; setSoundUI(true); })
    .catch(() => { setSoundUI(false); });
}

soundBtn.addEventListener("click", toggleSound);

function toggleSound() {
  if (!musicStarted) {
    music.volume = 0.35;
    music.muted = false;
    music.play()
      .then(() => { musicStarted = true; setSoundUI(true); })
      .catch(() => { setSoundUI(false); });
    return;
  }
  music.muted = !music.muted;
  setSoundUI(!music.muted);
}

function startVisualizer() {
  if (reducedMotion) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(music);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      freqData = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    const bars = visualizer.querySelectorAll("i");
    const draw = () => {
      analyser.getByteFrequencyData(freqData);
      bars.forEach((bar, i) => {
        const v = freqData[i * 2] || 0;
        bar.style.height = Math.max(6, (v / 255) * 34) + "px";
      });
      visRAF = requestAnimationFrame(draw);
    };
    draw();
  } catch (e) {
    /* Web Audio indisponible : la barre reste discrète, sans visualiseur */
  }
}

function stopVisualizer() {
  if (visRAF) cancelAnimationFrame(visRAF);
}

/* =========================
   CONFETTIS
========================= */

function launchConfetti() {
  confetti.innerHTML = "";
  const colors = ["#a875ff", "#ef9ddd", "#8275ff", "#e8b1ef", "#ffffff", "#c89bf0"];
  const count = window.innerWidth < 650 ? 60 : 100;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (3 + Math.random() * 4) + "s";
    piece.style.animationDelay = (Math.random() * 1.5) + "s";
    piece.style.width = (5 + Math.random() * 5) + "px";
    piece.style.height = (8 + Math.random() * 8) + "px";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.appendChild(piece);
  }

  setTimeout(() => { confetti.innerHTML = ""; }, 8500);
}

/* =========================
   FEUX D'ARTIFICE (canvas)
========================= */

function resizeFireworks() {
  fireworksCanvas.width = window.innerWidth;
  fireworksCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeFireworks);
resizeFireworks();

let fwParticles = [];
let fwRAF;

function spawnBurst(x, y, color) {
  const count = 28;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count;
    const speed = 2 + Math.random() * 3;
    fwParticles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color });
  }
}

function launchFireworks(burstCount) {
  if (reducedMotion) return;
  const colors = ["#a875ff", "#ef9ddd", "#8275ff", "#ffe4b8", "#ffffff"];
  for (let n = 0; n < burstCount; n++) {
    setTimeout(() => {
      const x = fireworksCanvas.width * (0.2 + Math.random() * 0.6);
      const y = fireworksCanvas.height * (0.15 + Math.random() * 0.3);
      spawnBurst(x, y, colors[Math.floor(Math.random() * colors.length)]);
    }, n * 450);
  }
  if (!fwRAF) animateFireworks();
}

function animateFireworks() {
  fwCtx.clearRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);
  fwParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.03;
    p.life -= 0.015;
    fwCtx.globalAlpha = Math.max(p.life, 0);
    fwCtx.fillStyle = p.color;
    fwCtx.beginPath();
    fwCtx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
    fwCtx.fill();
  });
  fwCtx.globalAlpha = 1;
  fwParticles = fwParticles.filter(p => p.life > 0);
  fwRAF = requestAnimationFrame(animateFireworks);
}