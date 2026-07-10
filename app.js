const canvas = document.querySelector("#symbolRain");
const ctx = canvas.getContext("2d");
const pageLinks = document.querySelectorAll("[data-page-link]");
const pages = document.querySelectorAll(".page");
const architecturePage = document.querySelector("#architecture");
const showArchitectureFlow = document.querySelector("#showArchitectureFlow");
const backToModels = document.querySelector("#backToModels");
const architectureFlow = document.querySelector(".architecture-flow");
const flowTrack = document.querySelector(".flow-track");
const flowCards = document.querySelectorAll(".flow-card");
const symbols = ["+", "-", "*", "/", "?"];
const streaks = [];
const starLayerCount = 90;

let width = 0;
let height = 0;
let density = 0;
let flowTimer = null;
let flowStep = 0;
let screenSwitchTimer = null;

function centerActiveCard(card) {
  if(!architectureFlow || !flowTrack || !card) return;

  const viewportCenter = architectureFlow.clientWidth / 2;
  const cardCenter = card.offsetLeft + card.offsetWidth / 2;
  const offset = cardCenter - viewportCenter;

  flowTrack.style.transform = `translateX(${-offset}px)`;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function createStreak(resetOutside) {
  const size = randomBetween(14, 31);
  const fromTop = Math.random() > 0.35;
  const bright = Math.random() > 0.82;
  const startX = randomBetween(-width * 0.72, width * 0.72);
  const angle = randomBetween(0.36, 0.58);

  return {
    x: resetOutside ? startX : randomBetween(0, width),
    y: resetOutside && fromTop ? randomBetween(-260, -24) : randomBetween(-height * 0.15, height * 1.05),
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    size: bright ? size * 1.18 : size,
    speed: randomBetween(0.36, 1.08) * (size / 24),
    alpha: bright ? randomBetween(0.46, 0.78) : randomBetween(0.14, 0.46),
    trail: bright ? randomBetween(130, 260) : randomBetween(62, 156),
    angle,
    color: bright ? "#ffffff" : "#f5f0e8",
    spin: randomBetween(-0.008, 0.008),
    rotation: randomBetween(-0.2, 0.2)
  };
}

function createStars() {
  const fragment = document.createDocumentFragment();

  for(let i = 0; i < starLayerCount; i++) {
    const star = document.createElement("span");
    const size = randomBetween(1, 3.2);

    star.className = "star";
    star.style.left = `${randomBetween(0, 100)}vw`;
    star.style.top = `${randomBetween(0, 100)}vh`;
    star.style.setProperty("--star-size", `${size}px`);
    star.style.setProperty("--star-speed", `${randomBetween(2.8, 7.5)}s`);
    star.style.setProperty("--star-delay", `${randomBetween(-8, 0)}s`);

    fragment.appendChild(star);
  }

  document.body.appendChild(fragment);
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  density = Math.max(34, Math.floor((width * height) / 26000));

  while(streaks.length < density) {
    streaks.push(createStreak(false));
  }

  while(streaks.length > density) {
    streaks.pop();
  }

  const activeFlowCard = document.querySelector(".flow-card.active");
  centerActiveCard(activeFlowCard);
}

function drawStreak(streak) {
  const tailX = streak.x - Math.cos(streak.angle) * streak.trail;
  const tailY = streak.y - Math.sin(streak.angle) * streak.trail;
  const gradient = ctx.createLinearGradient(tailX, tailY, streak.x, streak.y);

  gradient.addColorStop(0, "rgba(245, 240, 232, 0)");
  gradient.addColorStop(0.68, `rgba(245, 240, 232, ${streak.alpha * 0.28})`);
  gradient.addColorStop(1, `rgba(245, 240, 232, ${streak.alpha})`);

  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = gradient;
  ctx.shadowColor = streak.color;
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.lineTo(streak.x, streak.y);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = streak.alpha;
  ctx.fillStyle = streak.color;
  ctx.shadowColor = streak.color;
  ctx.shadowBlur = streak.alpha > 0.5 ? 18 : 9;
  ctx.font = `${streak.size}px "Courier New", monospace`;
  ctx.translate(streak.x, streak.y);
  ctx.rotate(streak.rotation);
  ctx.fillText(streak.symbol, 0, 0);
  ctx.restore();
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  for(let i = 0; i < streaks.length; i++) {
    const streak = streaks[i];
    drawStreak(streak);

    streak.x += Math.cos(streak.angle) * streak.speed;
    streak.y += Math.sin(streak.angle) * streak.speed;
    streak.rotation += streak.spin;

    if(streak.y > height + 190 || streak.x > width + 220 || streak.x < -220) {
      streaks[i] = createStreak(true);
    }
  }

  requestAnimationFrame(animate);
}

function showPage(pageId) {
  const page = document.getElementById(pageId);

  if(!page) {
    return;
  }

  if(page.classList.contains("active")) {
    return;
  }

  document.body.classList.remove("screen-switch");
  void document.body.offsetWidth;
  document.body.classList.add("screen-switch");

  if(screenSwitchTimer) {
    clearTimeout(screenSwitchTimer);
  }

  screenSwitchTimer = setTimeout(() => {
    document.body.classList.remove("screen-switch");
    screenSwitchTimer = null;
  }, 680);

  if(pageId !== "architecture") {
    stopArchitectureFlow();
  }

  pages.forEach((item) => {
    item.classList.toggle("active", item.id === pageId);
  });

  pageLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === pageId);
  });
}

function updateArchitectureFlow() {
  if(flowCards.length === 0) return;
  let activeCard = null;

  flowCards.forEach((card, index) => {
    const isActive = index === flowStep;

    card.classList.toggle("active", isActive);

    if(isActive) {
      activeCard = card;
    }
  });

  centerActiveCard(activeCard);

  flowStep = (flowStep + 1) % flowCards.length;
}

function startArchitectureFlow() {
  if(!architecturePage) return;

  architecturePage.classList.add("detail-open");
  flowStep = 0;
  updateArchitectureFlow();

  if(flowTimer) {
    clearInterval(flowTimer);
  }

  flowTimer = setInterval(updateArchitectureFlow, 3600);
}

function stopArchitectureFlow() {
  if(!architecturePage) return;

  architecturePage.classList.remove("detail-open");

  if(flowTimer) {
    clearInterval(flowTimer);
    flowTimer = null;
  }

  flowCards.forEach((card) => {
    card.classList.remove("active");
  });

  if(flowTrack) {
    flowTrack.style.transform = "translateX(0)";
  }
}

pageLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    showPage(link.dataset.pageLink);
  });
});

if(showArchitectureFlow && architecturePage) {
  showArchitectureFlow.addEventListener("click", startArchitectureFlow);
}

if(backToModels) {
  backToModels.addEventListener("click", stopArchitectureFlow);
}

window.addEventListener("resize", resizeCanvas);
createStars();
resizeCanvas();
animate();
