/* ==========================================================
   Multi-Layered Vehicular Safety System (Demo UI)
   - Smooth reveal animations on scroll
   - Mobile nav toggle
   - "Simulate Accident" modal popup (required)
   - Toast notifications for simple interactivity
   ========================================================== */

const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// --- Elements
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");

const simulateBtn = $("#simulateBtn");
const showToastBtn = $("#showToastBtn");

const toast = $("#toast");
const toastClose = $("#toastClose");
const toastTitle = $("#toastTitle");
const toastText = $("#toastText");

const modal = $("#modal");
const modalClose = $("#modalClose");
const modalOk = $("#modalOk");
const modalDetails = $("#modalDetails");
const modalSteps = $("#modalSteps");

const modalMessage = $("#modalMessage");
const metaTime = $("#metaTime");
const metaGps = $("#metaGps");
const metaConf = $("#metaConf");

const systemState = $("#systemState");
const verifyState = $("#verifyState");
const lastEvent = $("#lastEvent");
const confidence = $("#confidence");

const themePulse = $("#themePulse");

// --- Utilities
function nowTimeString() {
  const d = new Date();
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* Fake GPS for UI demo (replace with real GPS in hardware integration) */
function fakeGps() {
  // Bengaluru-ish coordinates (purely for demo)
  const lat = rand(12.90, 13.05).toFixed(4);
  const lon = rand(77.50, 77.70).toFixed(4);
  return `Lat ${lat} • Lon ${lon}`;
}

// --- Toast
let toastTimer = null;

function showToast(title, text) {
  toastTitle.textContent = title;
  toastText.textContent = text;

  toast.classList.add("show");

  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3800);
}

function hideToast() {
  toast.classList.remove("show");
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = null;
}

// --- Modal
function openModal({ message, gps, conf }) {
  modalMessage.textContent = message;

  metaTime.textContent = nowTimeString();
  metaGps.textContent = gps;
  metaConf.textContent = conf;

  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  // Focus for accessibility
  modalOk.focus();
}

function closeModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
  modalSteps.hidden = true;
  modalDetails.textContent = "View Steps";
}

// --- Mobile nav
navToggle?.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("show");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

// Close nav after clicking a link on mobile
$$(".nav__links a").forEach(a => {
  a.addEventListener("click", () => {
    if (navLinks.classList.contains("show")) {
      navLinks.classList.remove("show");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

// --- Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) e.target.classList.add("show");
  });
}, { threshold: 0.12 });

$$(".reveal").forEach(el => io.observe(el));

// --- Demo Interactions
simulateBtn?.addEventListener("click", () => {
  // Required: popup/alert text
  // We show a professional modal instead of default alert(),
  // but it includes the exact required message.
  const gps = fakeGps();
  const conf = `${Math.round(rand(92, 99))}%`;

  // Update telemetry panel
  systemState.textContent = "Incident Mode";
  verifyState.textContent = "Confirmed";
  lastEvent.textContent = nowTimeString();
  confidence.textContent = conf;

  openModal({
    message: "Accident Detected! Location sent to emergency services.",
    gps,
    conf
  });

  showToast("Emergency Alert Dispatched", `GPS shared securely • ${gps}`);
});

showToastBtn?.addEventListener("click", () => {
  showToast("System Online", "Sensors synced. AI verification ready. Awaiting events.");
});

// Modal closing controls
modalClose?.addEventListener("click", closeModal);
modalOk?.addEventListener("click", closeModal);

modal?.addEventListener("click", (e) => {
  // Close if backdrop clicked
  const target = e.target;
  if (target && target.dataset && target.dataset.close === "true") closeModal();
});

// Toggle steps (extra detail)
modalDetails?.addEventListener("click", () => {
  const willShow = modalSteps.hidden;
  modalSteps.hidden = !willShow;
  modalDetails.textContent = willShow ? "Hide Steps" : "View Steps";
});

// Toast close
toastClose?.addEventListener("click", hideToast);

// Extra: Accent pulse button (tiny interactive polish)
themePulse?.addEventListener("click", () => {
  document.body.animate(
    [
      { filter: "brightness(1)" },
      { filter: "brightness(1.12)" },
      { filter: "brightness(1)" }
    ],
    { duration: 420, easing: "ease-out" }
  );

  showToast("Neon Pulse", "UI accent calibrated for futuristic theme.");
});

// Initial friendly status toast after load
window.addEventListener("load", () => {
  showToast("Welcome", "Scroll to explore the system. Use the Demo to simulate accident detection.");
});