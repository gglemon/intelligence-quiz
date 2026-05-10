const state = {
  index: 0,
  answers: new Array(QUESTIONS.length).fill(null),
  screen: "welcome",
};

const app = document.getElementById("app");

function render() {
  if (state.screen === "welcome") return renderWelcome();
  if (state.screen === "result") return renderResult();
  renderQuestion();
}

function renderWelcome() {
  app.innerHTML = `
    <div class="screen welcome">
      <div class="eyebrow">8 Questions · 2 Minutes</div>
      <h1>Are you highly intelligent?</h1>
      <p>8 quick questions based on traits of highly intelligent people. Answer honestly. There's no right answer, only your answer.</p>
      <button class="btn" onclick="start()">Begin the test <span aria-hidden="true">→</span></button>
    </div>
  `;
}

function start() {
  state.index = 0;
  state.answers = new Array(QUESTIONS.length).fill(null);
  state.screen = "question";
  render();
}

function renderQuestion() {
  const q = QUESTIONS[state.index];
  const total = QUESTIONS.length;
  const pct = ((state.index + 0.5) / total) * 100;
  const current = state.answers[state.index];

  let body = "";
  if (q.type === "yesno") {
    body = `
      <div class="options row">
        <div class="option ${current === "yes" ? "selected" : ""}" onclick="answer('yes')" tabindex="0" role="button">Yes</div>
        <div class="option ${current === "no" ? "selected" : ""}" onclick="answer('no')" tabindex="0" role="button">No</div>
      </div>
    `;
  } else if (q.type === "choice") {
    body = `
      <div class="options">
        ${q.options
          .map(
            (opt, i) => `
          <div class="option ${current === i ? "selected" : ""}" onclick="answer(${i})" tabindex="0" role="button">${opt.label}</div>
        `
          )
          .join("")}
      </div>
    `;
  } else if (q.type === "scale") {
    body = `
      <div class="scale">
        <div class="scale-row">
          ${[0, 1, 2, 3, 4]
            .map(
              (n) => `
            <div class="scale-dot ${current === n ? "selected" : ""}" onclick="answer(${n})" tabindex="0" role="button" aria-label="${n + 1}">${n + 1}</div>
          `
            )
            .join("")}
        </div>
        <div class="scale-labels">
          <span>${q.leftLabel}</span>
          <span>${q.rightLabel}</span>
        </div>
        <div class="scale-next">
          <button class="btn ${current === null ? "disabled" : ""}" onclick="next()" ${current === null ? "disabled" : ""}>Next <span aria-hidden="true">→</span></button>
        </div>
      </div>
    `;
  }

  app.innerHTML = `
    <div class="screen" key="${state.index}">
      <div class="progress-row">
        <button class="back-btn" onclick="back()" ${state.index === 0 ? "disabled" : ""} aria-label="Go back">←</button>
        <div class="progress"><div class="progress-fill" style="width:${pct}%"></div></div>
        <div class="progress-text">${state.index + 1} / ${total}</div>
      </div>
      <div class="question-text">${q.text}</div>
      ${body}
    </div>
  `;
}

function answer(value) {
  state.answers[state.index] = value;
  const q = QUESTIONS[state.index];
  if (q.type === "scale") {
    // Update in place — no full re-render, no flash
    document.querySelectorAll(".scale-dot").forEach((dot, i) => {
      dot.classList.toggle("selected", i === value);
    });
    const nextBtn = document.querySelector(".scale-next .btn");
    if (nextBtn) {
      nextBtn.classList.remove("disabled");
      nextBtn.removeAttribute("disabled");
    }
    return;
  }
  setTimeout(() => next(), 300);
}

function next() {
  if (state.answers[state.index] === null) {
    const screen = document.querySelector(".screen");
    if (screen) {
      screen.classList.remove("shake");
      void screen.offsetWidth;
      screen.classList.add("shake");
    }
    return;
  }
  if (state.index < QUESTIONS.length - 1) {
    state.index++;
    render();
  } else {
    state.screen = "result";
    render();
  }
}

function back() {
  if (state.index > 0) {
    state.index--;
    render();
  }
}

function scoreFor(q, answer) {
  if (answer === null) return 0;
  let raw;
  if (q.type === "yesno") {
    raw = answer === "yes" ? 4 : 0;
  } else if (q.type === "choice") {
    raw = q.options[answer].score;
  } else {
    raw = answer;
  }
  return q.reversed ? 4 - raw : raw;
}

function isMatch(q, answer) {
  return scoreFor(q, answer) >= 3;
}

function renderResult() {
  const total = QUESTIONS.reduce((sum, q, i) => sum + scoreFor(q, state.answers[i]), 0);
  const tier = TIERS.find((t) => total >= t.min);

  const signRows = QUESTIONS.map((q, i) => {
    const matched = isMatch(q, state.answers[i]);
    return `
      <div class="sign-row ${matched ? "match" : "miss"}">
        <div class="sign-icon ${matched ? "match" : "miss"}">${matched ? "✓" : ""}</div>
        <div>${SIGNS[i]}</div>
      </div>
    `;
  }).join("");

  app.innerHTML = `
    <div class="screen result">
      <div class="eyebrow">Your Result</div>
      <h1 id="score-display">0</h1>
      <div class="out-of">out of 32</div>
      <div class="tier-label">${tier.label}.</div>
      <div class="tier-blurb">${tier.blurb}</div>
      <div class="signs-list">
        <h3>The 8 Signs of High Intelligence</h3>
        ${signRows}
      </div>
      <div class="actions">
        <button class="btn" onclick="start()">Take it again</button>
        <button class="btn ghost" onclick="share(${total}, '${tier.label.replace(/'/g, "\\'")}')">Share</button>
      </div>
    </div>
  `;

  animateCount(document.getElementById("score-display"), 0, total, 1100);
}

function animateCount(el, from, to, duration) {
  if (!el) return;
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(from + (to - from) * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function share(score, label) {
  const text = `I scored ${score}/32 on "Are you highly intelligent?" — ${label}.`;
  if (navigator.share) {
    navigator.share({ title: "Are you highly intelligent?", text, url: location.href }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text + " " + location.href);
    flashToast("Copied to clipboard");
  }
}

function flashToast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  Object.assign(t.style, {
    position: "fixed", bottom: "32px", left: "50%", transform: "translateX(-50%)",
    background: "var(--fg)", color: "var(--bg)", padding: "12px 22px",
    borderRadius: "999px", fontSize: "15px", fontWeight: "600", zIndex: 1000,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)", opacity: "0",
    transition: "opacity 0.25s, transform 0.25s",
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(-4px)"; });
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 1800);
}

// Keyboard support
document.addEventListener("keydown", (e) => {
  if (state.screen !== "question") {
    if (state.screen === "welcome" && e.key === "Enter") start();
    return;
  }
  const q = QUESTIONS[state.index];
  if (q.type === "yesno") {
    if (e.key.toLowerCase() === "y") answer("yes");
    if (e.key.toLowerCase() === "n") answer("no");
  } else if (q.type === "scale") {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 5) answer(n - 1);
    if (e.key === "Enter" && state.answers[state.index] !== null) next();
  } else if (q.type === "choice") {
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= q.options.length) answer(n - 1);
  }
  if (e.key === "ArrowLeft") back();
});

// Theme
const THEMES = ["dark", "light", "playful", "custom"];
function applyTheme(name, customColor) {
  // Clear any inline custom-theme overrides when leaving custom
  if (name !== "custom") {
    [
      "--bg", "--fg", "--fg-dim", "--fg-faint", "--bg-elev", "--bg-elev-strong",
      "--border", "--border-active", "--accent", "--accent-2", "--accent-soft",
      "--accent-glow", "--orb-1", "--orb-2", "--orb-3",
    ].forEach((p) => document.body.style.removeProperty(p));
  }
  document.body.className = "theme-" + name;
  localStorage.setItem("quiz-theme", name);
  document.querySelectorAll(".theme-switcher button").forEach((b) => {
    b.classList.toggle("active", b.dataset.theme === name);
  });
  if (name === "custom") {
    const color = customColor || localStorage.getItem("quiz-custom-color") || "#7d5fff";
    applyCustomColor(color);
    document.getElementById("custom-color-input").value = color;
    document.getElementById("custom-swatch").style.background = color;
  } else {
    document.getElementById("custom-swatch").style.background = "";
  }
}

function relativeLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, ((n >> 16) & 0xff) + amt));
  const g = Math.max(0, Math.min(255, ((n >> 8) & 0xff) + amt));
  const b = Math.max(0, Math.min(255, (n & 0xff) + amt));
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function applyCustomColor(color) {
  const lum = relativeLuminance(color);
  const isLight = lum > 0.55;
  const s = document.body.style;
  s.setProperty("--bg", color);
  s.setProperty("--fg", isLight ? "#0e0e0e" : "#ffffff");
  s.setProperty("--fg-dim", isLight ? "#444" : "#d8d2e8");
  s.setProperty("--fg-faint", isLight ? "#888" : "#9a93b3");
  s.setProperty("--bg-elev", isLight ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.07)");
  s.setProperty("--bg-elev-strong", isLight ? "#ffffff" : "rgba(255,255,255,0.12)");
  s.setProperty("--border", isLight ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.14)");
  s.setProperty("--border-active", isLight ? "#1a1a1a" : "rgba(255,255,255,0.6)");
  s.setProperty("--accent", isLight ? "#1a1a1a" : "#ffffff");
  s.setProperty("--accent-2", isLight ? shade(color, -80) : shade(color, 80));
  s.setProperty("--accent-soft", isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.12)");
  s.setProperty("--accent-glow", isLight ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)");
  s.setProperty("--orb-1", shade(color, isLight ? -20 : 40));
  s.setProperty("--orb-2", shade(color, isLight ? 30 : -30));
  s.setProperty("--orb-3", shade(color, isLight ? -50 : 60));
  localStorage.setItem("quiz-custom-color", color);
  document.getElementById("custom-swatch").style.background = color;
}

const customInput = document.getElementById("custom-color-input");
document.querySelectorAll(".theme-switcher button").forEach((b) => {
  b.addEventListener("click", () => {
    if (b.dataset.theme === "custom") {
      customInput.click();
      applyTheme("custom");
    } else {
      applyTheme(b.dataset.theme);
    }
  });
});
customInput.addEventListener("input", (e) => {
  document.body.className = "theme-custom";
  localStorage.setItem("quiz-theme", "custom");
  document.querySelectorAll(".theme-switcher button").forEach((b) => {
    b.classList.toggle("active", b.dataset.theme === "custom");
  });
  applyCustomColor(e.target.value);
});

const saved = localStorage.getItem("quiz-theme");
applyTheme(THEMES.includes(saved) ? saved : "dark");

// Mouse-follow glow on buttons
document.addEventListener("mousemove", (e) => {
  document.querySelectorAll(".btn").forEach((btn) => {
    const r = btn.getBoundingClientRect();
    btn.style.setProperty("--mx", `${e.clientX - r.left}px`);
    btn.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

render();
