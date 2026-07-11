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
const openInference = document.querySelector("#openInference");
const closeInference = document.querySelector("#closeInference");
const inferencePanel = document.querySelector("#inferencePanel");
const sampleTerminal = document.querySelector("#sampleTerminal");
const sampleOptions = document.querySelectorAll(".sample-option");
const openDatasetInspector = document.querySelector("#openDatasetInspector");
const datasetInspector = document.querySelector("#datasetInspector");
const datasetInspectorBack = document.querySelector("#datasetInspectorBack");
const datasetInspectorTitle = document.querySelector("#datasetInspectorTitle");
const datasetCategoryView = document.querySelector("#datasetCategoryView");
const datasetExampleView = document.querySelector("#datasetExampleView");
const datasetExampleList = document.querySelector("#datasetExampleList");
const datasetCategoryButtons = document.querySelectorAll("[data-dataset-category]");
const symbols = ["+", "-", "*", "/", "?"];
const streaks = [];
const starLayerCount = 90;
const inferenceSamples = {
  calc_sin: {
    label: "calc_sin",
    prompt: "[CALC]\nQuestion:\nDerivative of: sin x\n\nAnswer:",
    output: "[CALC] Question : Derivative of : sin x Answer : cos x"
  },
  trig_sin90: {
    label: "trig_sin90",
    prompt: "[TRIG]\nQuestion:\nEvaluate sin(90 degrees)\n\nAnswer:",
    output: "[TRIG] Question : Evaluate sin ( 90 degrees ) Answer : 1"
  },
  arith_add: {
    label: "arith_add",
    prompt: "[ARITH]\nQuestion:\n12 + 7\n\nAnswer:",
    output: "[ARITH] Question : 12 + 7 Answer : 19"
  },
  calc_x2: {
    label: "calc_x2",
    prompt: "[CALC]\nQuestion:\nFind d/dx of x^2\n\nAnswer:",
    output: "[CALC] Question : Find d/dx of x^ 2 Answer : 2 x"
  }
};

const datasetExamples = {
  arith: {
    title: "Arithmetic",
    samples: [
      `[ARITH]\nQuestion:\n2085 * 5771\n\nStep 1:\nUse the distributive property: 2085 * (5770 + 1).\n\nStep 2:\nThe parts are 12030450 and 2085.\n\nStep 3:\nTogether they give 12032535.\n\nAnswer:\n12032535`,
      `[ARITH]\nQuestion:\n421 - 168\n\nStep 1:\nA borrow is needed because the lower place in 421 cannot subtract 8 directly.\n\nStep 2:\nBorrow and finish the column subtraction to get 253.\n\nAnswer:\n253`
    ]
  },
  alg: {
    title: "Algebra",
    samples: [
      `[ALG]\nQuestion:\nexpand (23-28)^2\n\nStep 1:\nUse (a-b)^2 = a^2 - 2ab + b^2.\n\nStep 2:\n23^2 = 529, 2*23*28 = 1288, and 28^2 = 784.\n\nAnswer:\n529 - 1288 + 784`,
      `[ALG]\nQuestion:\nproduct of roots of x^2 + 8x - 19 = 0\n\nStep 1:\nFor ax^2 + bx + c, product of roots is c/a.\n\nStep 2:\nHere it is -19/1 = -19.\n\nAnswer:\n-19`
    ]
  },
  calc: {
    title: "Calculus",
    samples: [
      `[CALC]\nQuestion:\nIntegrate: cos x sin x dx\n\nStep 1:\nUse substitution u = sin x.\n\nStep 2:\nThen du = cos x dx.\n\nStep 3:\nIntegral becomes integral u du.\n\nAnswer:\nsin^2(x)/2 + C`,
      `[CALC]\nQuestion:\nDerivative of: sin(x^2)\n\nStep 1:\nUse chain rule with u = x^2.\n\nStep 2:\nDerivative of sin u is cos u.\n\nStep 3:\nu' = 2x^1.\n\nAnswer:\n2x^1cos(x^2)`
    ]
  },
  trig: {
    title: "Trigonometry",
    samples: [
      `[TRIG]\nQuestion:\nUse identities to simplify tan(x)cos(x)+sin(x)\n\nStep 1:\ntan(x) = sin(x)/cos(x).\n\nStep 2:\nThen tan(x)cos(x) = sin(x).\n\nStep 3:\nSo the expression is 2sin(x).\n\nAnswer:\n2sin(x)`,
      `[TRIG]\nQuestion:\nFind the missing opposite side when tan(45 degrees) is used and adjacent is 20.\n\nStep 1:\nUse tan(angle) = opposite/adjacent.\n\nStep 2:\ntan(45 degrees) = 1.\n\nStep 3:\nopposite = 20.\n\nAnswer:\n20`
    ]
  }
};

let width = 0;
let height = 0;
let density = 0;
let flowTimer = null;
let flowStep = 0;
let screenSwitchTimer = null;
let typingTimer = null;
let activeDatasetCategory = null;

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

  if(pageId !== "ironwill") {
    closeInferencePanel();
  }

  pages.forEach((item) => {
    item.classList.toggle("active", item.id === pageId);
  });

  pageLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.pageLink === pageId);
  });

  document.body.classList.toggle("home-active", pageId === "ironwill");
}

function typeTerminal(text) {
  if(!sampleTerminal) return;

  if(typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }

  sampleTerminal.textContent = "";

  let index = 0;
  typingTimer = setInterval(() => {
    sampleTerminal.textContent = text.slice(0, index);
    index++;

    if(index > text.length) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
  }, 13);
}

function runInferenceSample(sampleKey) {
  const sample = inferenceSamples[sampleKey] || inferenceSamples.calc_sin;

  sampleOptions.forEach((option) => {
    const isActive = option.dataset.sample === sampleKey;
    option.classList.toggle("active", isActive);

    if(isActive && !option.querySelector(".option-cursor")) {
      const cursor = document.createElement("span");
      cursor.className = "option-cursor";
      cursor.textContent = ">";
      option.prepend(cursor);
    }

    if(!isActive) {
      const cursor = option.querySelector(".option-cursor");

      if(cursor) {
        cursor.remove();
      }
    }
  });

  const terminalText = [
    `> load sample ${sample.label}`,
    "> prompt",
    sample.prompt,
    "",
    "> running saved IRONWILL_V1 sample...",
    "",
    "> output",
    sample.output
  ].join("\n");

  typeTerminal(terminalText);
}

function openInferencePanel() {
  if(!inferencePanel) return;

  inferencePanel.classList.add("open");
  inferencePanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("inference-open");
  runInferenceSample("calc_sin");
}

function closeInferencePanel() {
  if(!inferencePanel) return;

  inferencePanel.classList.remove("open");
  inferencePanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("inference-open");

  if(typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }
}

function showDatasetCategories() {
  activeDatasetCategory = null;
  datasetInspectorTitle.textContent = "Inspect Dataset";
  datasetCategoryView.hidden = false;
  datasetExampleView.hidden = true;
  datasetExampleList.replaceChildren();
}

function showDatasetExamples(categoryKey) {
  const category = datasetExamples[categoryKey];
  if(!category) return;

  activeDatasetCategory = categoryKey;
  datasetInspectorTitle.textContent = category.title;
  datasetCategoryView.hidden = true;
  datasetExampleView.hidden = false;
  datasetExampleList.replaceChildren();

  category.samples.forEach((sample, index) => {
    const example = document.createElement("pre");
    example.className = "dataset-example";
    example.setAttribute("aria-label", `${category.title} example ${index + 1}`);
    example.textContent = sample;
    datasetExampleList.appendChild(example);
  });
}

function openDatasetInspectorPanel() {
  if(!datasetInspector) return;
  showDatasetCategories();
  datasetInspector.classList.add("open");
  datasetInspector.setAttribute("aria-hidden", "false");
}

function closeDatasetInspectorPanel() {
  if(!datasetInspector) return;
  datasetInspector.classList.remove("open");
  datasetInspector.setAttribute("aria-hidden", "true");
  activeDatasetCategory = null;
}

function handleDatasetBack() {
  if(activeDatasetCategory) showDatasetCategories();
  else closeDatasetInspectorPanel();
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
    closeDatasetInspectorPanel();
    showPage(link.dataset.pageLink);
  });
});

if(openDatasetInspector) {
  openDatasetInspector.addEventListener("click", openDatasetInspectorPanel);
}

if(datasetInspectorBack) {
  datasetInspectorBack.addEventListener("click", handleDatasetBack);
}

if(datasetInspector) {
  datasetInspector.addEventListener("click", (event) => {
    if(event.target === datasetInspector) closeDatasetInspectorPanel();
  });
}

datasetCategoryButtons.forEach((button) => {
  button.addEventListener("click", () => showDatasetExamples(button.dataset.datasetCategory));
});

if(openInference) {
  openInference.addEventListener("click", openInferencePanel);
}

if(closeInference) {
  closeInference.addEventListener("click", closeInferencePanel);
}

if(inferencePanel) {
  inferencePanel.addEventListener("click", (event) => {
    if(event.target === inferencePanel) {
      closeInferencePanel();
    }
  });
}

sampleOptions.forEach((option) => {
  option.addEventListener("click", () => {
    runInferenceSample(option.dataset.sample);
  });
});

if(showArchitectureFlow && architecturePage) {
  showArchitectureFlow.addEventListener("click", startArchitectureFlow);
}

if(backToModels) {
  backToModels.addEventListener("click", stopArchitectureFlow);
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", (event) => {
  if(event.key === "Escape") {
    closeInferencePanel();
    closeDatasetInspectorPanel();
  }
});
createStars();
resizeCanvas();
document.body.classList.add("home-active");
animate();
