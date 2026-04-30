/* =====================================================
   VAM-AI Random Wheel — Wheel Engine & App Logic
   ===================================================== */

"use strict";

// ── State ────────────────────────────────────────────
let entries = [];
let results = [];
let spinning = false;
let currentWinner = null;
let sortAsc = true;

// ── Wheel palette ────────────────────────────────────
const COLORS = [
  "#6c63ff", "#ff6b6b", "#ffd166", "#06d6a0",
  "#118ab2", "#f4845f", "#a29bfe", "#fd79a8",
  "#55efc4", "#fdcb6e", "#0984e3", "#e17055",
];

// ── DOM refs ─────────────────────────────────────────
const canvas = document.getElementById("wheelCanvas");
const ctx = canvas.getContext("2d");
const spinBtn = document.getElementById("spinBtn");
const nameListEl = document.getElementById("nameList");
const newNameInput = document.getElementById("newNameInput");
const modalBackdrop = document.getElementById("modalBackdrop");
const modalWinnerName = document.getElementById("modalWinnerName");
const entriesCount = document.getElementById("entriesCount");
const resultsCount = document.getElementById("resultsCount");
const resultsList = document.getElementById("resultsList");
const carouselTrack = document.getElementById("carouselTrack");

// ── Canvas sizing ─────────────────────────────────────
const SIZE = canvas.width;        // 540
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2 - 6;         // wheel radius with border gap

// ── Rotation state ───────────────────────────────────
let currentAngle = 0;             // radians, cumulative
let animId = null;

// =====================================================
//  DRAW WHEEL
// =====================================================
function drawWheel() {
  ctx.clearRect(0, 0, SIZE, SIZE);

  if (entries.length === 0) {
    drawEmptyState();
    return;
  }

  const n = entries.length;
  const slice = (2 * Math.PI) / n;

  // Draw each slice
  entries.forEach((entry, i) => {
    const startAngle = currentAngle + i * slice;
    const endAngle = startAngle + slice;
    const color = COLORS[i % COLORS.length];

    // Slice fill
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, R, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Slice border
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, R, startAngle, endAngle);
    ctx.closePath();
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.save();
    ctx.translate(CX, CY);
    ctx.rotate(startAngle + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";

    const maxWidth = R - 28;
    const fontSize = Math.max(9, Math.min(16, 300 / n));
    ctx.font = `bold ${fontSize}px 'Inter', sans-serif`;
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 4;

    let label = entry;
    // Truncate if too long
    while (ctx.measureText(label).width > maxWidth && label.length > 3) {
      label = label.slice(0, -1);
    }
    if (label !== entry) label = label.slice(0, -1) + "…";

    ctx.fillText(label, R - 14, fontSize / 3);
    ctx.restore();
  });

  // Outer ring
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, 2 * Math.PI);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Inner hub (drawn behind center button)
  ctx.beginPath();
  ctx.arc(CX, CY, 52, 0, 2 * Math.PI);
  ctx.fillStyle = "#0d0f14";
  ctx.fill();
  ctx.strokeStyle = "#6c63ff";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawEmptyState() {
  // Gradient circle
  const grad = ctx.createRadialGradient(CX, CY, 20, CX, CY, R);
  grad.addColorStop(0, "#1c2030");
  grad.addColorStop(1, "#0d0f14");
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, 2 * Math.PI);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(108,99,255,0.4)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "#7a82a0";
  ctx.font = "bold 18px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Add names to spin!", CX, CY + 80);
}

// =====================================================
//  SPIN
// =====================================================
function spin() {
  if (spinning || entries.length === 0) return;
  spinning = true;
  spinBtn.style.pointerEvents = "none";

  // Determine winning index (random)
  const winnerIndex = Math.floor(Math.random() * entries.length);

  // How many full rotations + extra to land on winner
  const n = entries.length;
  const slice = (2 * Math.PI) / n;

  // The slice centre for the winner (measured from angle=0)
  const winnerMidAngle = winnerIndex * slice + slice / 2;

  // The pointer is on the right side (angle 0).
  // We want: (currentAngle + winnerMidAngle) % (2 * Math.PI) === 0
  const extraSpins = Math.floor(10 + Math.random() * 5) * 2 * Math.PI; // faster, more spins
  const offset = (currentAngle + winnerMidAngle) % (2 * Math.PI);
  const targetAngle = currentAngle + extraSpins + (2 * Math.PI - offset);

  // Easing
  const duration = 2500 + Math.random() * 1000; // ms (faster spin)
  const startAngle = currentAngle;
  const totalDelta = targetAngle - startAngle;
  const startTime = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    currentAngle = startAngle + totalDelta * easeOut(t);
    drawWheel();

    if (t < 1) {
      animId = requestAnimationFrame(frame);
    } else {
      currentAngle = targetAngle;
      drawWheel();
      spinning = false;
      spinBtn.style.pointerEvents = "auto";
      currentWinner = entries[winnerIndex];
      showWinner(currentWinner);
    }
  }

  animId = requestAnimationFrame(frame);
}

// =====================================================
//  WINNER MODAL
// =====================================================
function showWinner(name) {
  modalWinnerName.textContent = name;
  modalBackdrop.classList.remove("hidden");
  spawnConfetti();
}

function closeModal(action) {
  modalBackdrop.classList.add("hidden");
  clearConfetti();

  if (currentWinner !== null) {
    if (action === 'remove_only') {
      entries = entries.filter(e => e !== currentWinner);
      renderNames();
      drawWheel();
    } else if (action === 'add_winner') {
      entries = entries.filter(e => e !== currentWinner);
      results.unshift(currentWinner);
      renderNames();
      renderResults();
      drawWheel();
    }
  }

  currentWinner = null;
}

// =====================================================
//  CONFETTI
// =====================================================
const confettiContainer = document.getElementById("confettiContainer");
const confettiColors = ["#6c63ff", "#ff6b6b", "#ffd166", "#06d6a0", "#f4845f", "#fd79a8", "#55efc4"];

function spawnConfetti() {
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.left = Math.random() * 100 + "%";
    el.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    el.style.width = (6 + Math.random() * 8) + "px";
    el.style.height = (6 + Math.random() * 8) + "px";
    el.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    const dur = 1.5 + Math.random() * 2;
    el.style.animationDuration = dur + "s";
    el.style.animationDelay = Math.random() * 0.8 + "s";
    confettiContainer.appendChild(el);
  }
}

function clearConfetti() {
  confettiContainer.innerHTML = "";
}

// =====================================================
//  ENTRIES MANAGEMENT
// =====================================================
function addName() {
  const val = newNameInput.value.trim();
  if (!val) return;
  if (entries.includes(val)) {
    newNameInput.style.borderColor = "var(--accent2)";
    setTimeout(() => { newNameInput.style.borderColor = ""; }, 1000);
    return;
  }
  entries.push(val);
  newNameInput.value = "";
  renderNames();
  drawWheel();
}

function removeName(index) {
  entries.splice(index, 1);
  renderNames();
  drawWheel();
}

function shuffleEntries() {
  for (let i = entries.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [entries[i], entries[j]] = [entries[j], entries[i]];
  }
  renderNames();
  drawWheel();
}

function sortEntries() {
  entries.sort((a, b) => sortAsc ? a.localeCompare(b) : b.localeCompare(a));
  sortAsc = !sortAsc;
  renderNames();
  drawWheel();
}

function clearAll() {
  if (!entries.length) return;
  if (!confirm("Clear all entries?")) return;
  entries = [];
  renderNames();
  drawWheel();
}

function bulkImport() {
  const raw = document.getElementById("bulkTextarea").value;
  const names = raw.split("\n").map(l => l.trim()).filter(Boolean);
  names.forEach(n => {
    if (!entries.includes(n)) entries.push(n);
  });
  document.getElementById("bulkTextarea").value = "";
  renderNames();
  drawWheel();
}

function filterNames() {
  const input = document.getElementById("searchNameInput");
  if (!input) return;
  const query = input.value.toLowerCase();
  const items = nameListEl.getElementsByTagName("li");
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.classList.contains("empty-state")) continue;
    const nameText = item.querySelector(".name-item-text").textContent.toLowerCase();
    item.style.display = nameText.includes(query) ? "flex" : "none";
  }
}

function renderNames() {
  nameListEl.innerHTML = "";

  if (entries.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = "No entries yet — add some names!";
    nameListEl.appendChild(li);
    entriesCount.textContent = 0;
    return;
  }

  entriesCount.textContent = entries.length;

  entries.forEach((name, i) => {
    const li = document.createElement("li");
    li.className = "name-item";

    // Colour swatch
    const swatch = document.createElement("span");
    swatch.style.cssText = `
      display:inline-block;width:10px;height:10px;border-radius:50%;
      background:${COLORS[i % COLORS.length]};flex-shrink:0;margin-right:8px;
    `;

    // Editable name
    const span = document.createElement("span");
    span.className = "name-item-text";
    span.textContent = name;
    span.contentEditable = "true";
    span.spellcheck = false;
    span.addEventListener("blur", () => {
      const newVal = span.textContent.trim();
      if (newVal) entries[i] = newVal;
      else span.textContent = entries[i];
      drawWheel();
    });
    span.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); span.blur(); }
    });

    // Delete button
    const del = document.createElement("button");
    del.className = "name-item-del";
    del.innerHTML = "✕";
    del.title = "Remove";
    del.addEventListener("click", () => removeName(i));

    li.appendChild(swatch);
    li.appendChild(span);
    li.appendChild(del);
    nameListEl.appendChild(li);
  });

  filterNames();
}

// =====================================================
//  RESULTS
// =====================================================
function renderResults() {
  resultsCount.textContent = results.length;
  resultsList.innerHTML = "";

  if (results.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.textContent = "No results yet — spin the wheel!";
    resultsList.appendChild(li);
    return;
  }

  results.forEach((name, i) => {
    const li = document.createElement("li");
    li.className = "result-item";

    const rank = document.createElement("span");
    rank.className = "result-rank";
    rank.textContent = `#${i + 1}`;

    const nameEl = document.createElement("span");
    nameEl.className = "result-name";
    nameEl.textContent = name;

    li.appendChild(rank);
    li.appendChild(nameEl);
    resultsList.appendChild(li);
  });
}

// =====================================================
//  TABS
// =====================================================
function switchTab(tab) {
  const isEntries = tab === "entries";
  document.getElementById("tabEntries").classList.toggle("active", isEntries);
  document.getElementById("tabResults").classList.toggle("active", !isEntries);
  document.getElementById("panelEntries").classList.toggle("hidden", !isEntries);
  document.getElementById("panelResults").classList.toggle("hidden", isEntries);
}

// =====================================================
//  EVENTS CAROUSEL
// =====================================================
async function loadCarousel() {
  try {
    const res = await fetch("/api/events");
    const images = await res.json();

    if (!images.length) {
      carouselTrack.closest(".carousel-section").style.display = "none";
      return;
    }

    // Duplicate images for seamless loop
    const all = [...images, ...images];
    all.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "VAM-AI event";
      img.className = "carousel-img";
      img.loading = "lazy";
      // Lightbox on click
      img.addEventListener("click", () => {
        const lb = document.createElement("div");
        lb.style.cssText = `
          position:fixed;inset:0;background:#000000cc;
          display:flex;align-items:center;justify-content:center;
          z-index:2000;cursor:zoom-out;backdrop-filter:blur(6px);
        `;
        const bigImg = document.createElement("img");
        bigImg.src = src;
        bigImg.style.cssText = `max-width:90vw;max-height:90vh;border-radius:12px;
          box-shadow:0 24px 80px #000;`;
        lb.appendChild(bigImg);
        lb.addEventListener("click", () => lb.remove());
        document.body.appendChild(lb);
      });
      carouselTrack.appendChild(img);
    });
  } catch (err) {
    console.warn("Could not load event images:", err);
  }
}

// =====================================================
//  KEYBOARD
// =====================================================
document.addEventListener("keydown", e => {
  if (e.code === "Space" && document.activeElement.tagName !== "INPUT"
    && document.activeElement.tagName !== "TEXTAREA"
    && !document.activeElement.isContentEditable) {
    e.preventDefault();
    spin();
  }
  if (e.key === "Escape" && !modalBackdrop.classList.contains("hidden")) {
    closeModal('close');
  }
});

// =====================================================
//  SPIN BUTTON
// =====================================================
spinBtn.addEventListener("click", spin);

// =====================================================
//  INIT
// =====================================================
drawWheel();
renderNames();
renderResults();
loadCarousel();
