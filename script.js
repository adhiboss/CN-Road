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

// --- 3D Tilt Effect for Architecture ---
const tiltCard = document.getElementById('archTiltCard');
const tiltContainer = tiltCard?.parentElement;

if (tiltCard && tiltContainer) {
  tiltContainer.addEventListener('mousemove', (e) => {
    const rect = tiltContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -15;
    const rotateY = ((x - centerX) / centerX) * 15;
    
    tiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
  
  tiltContainer.addEventListener('mouseleave', () => {
    tiltCard.style.transform = 'rotateX(0) rotateY(0)';
  });
}

// --- 3D Hover Effect for Showcase Gallery ---
const showcaseCards = $$('.showcase-card');
showcaseCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Different 3D effect: pops out (scale3d) and tilts
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    
    // Dynamic glare effect mapping
    card.style.setProperty('--mouseX', `${x}px`);
    card.style.setProperty('--mouseY', `${y}px`);
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
  });
});

// --- AI Playground Logic ---
const BACKEND_URL = "http://127.0.0.1:5000";
const uploadZone = $("#uploadZone");
const fileInput = $("#fileInput");
const outputGallery = $("#outputGallery");
const outputCount = $("#outputCount");
const runInferenceBtn = $("#runInferenceBtn");
const processingStatus = $("#processingStatus");
const modelSelect = $("#modelSelect");
const activeModelName = $("#activeModelName");

let uploadedImagesData = [];

// Handle click to upload
uploadZone?.addEventListener("click", () => {
  fileInput.click();
});

// Handle drag & drop
uploadZone?.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("dragover");
});

uploadZone?.addEventListener("dragleave", () => {
  uploadZone.classList.remove("dragover");
});

uploadZone?.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});

// Handle file selection
fileInput?.addEventListener("change", (e) => {
  handleFiles(e.target.files);
});

async function handleFiles(files) {
  const validFiles = Array.from(files).filter(file => file.type.startsWith("image/"));
  if (validFiles.length === 0) return;
  
  if (uploadedImagesData.length === 0) {
    outputGallery.innerHTML = "";
  }
  
  const formData = new FormData();
  validFiles.forEach(file => {
    formData.append("images", file);
  });
  
  try {
    // Send physical files to Python backend
    const response = await fetch(`${BACKEND_URL}/upload`, {
      method: "POST",
      body: formData
    });
    
    const result = await response.json();
    
    if (result.status === "success") {
      Array.from(validFiles).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgDataUrl = e.target.result;
          uploadedImagesData.push({ id: result.files[index].id, imgDataUrl });
          
          const card = document.createElement("div");
          card.className = "ai-image-card";
          card.innerHTML = `<img src="${imgDataUrl}" alt="Uploaded image" />`;
          outputGallery.appendChild(card);
        };
        reader.readAsDataURL(file);
      });
      showToast("Backend Synced", `Successfully saved ${validFiles.length} images to Python backend.`);
    }
  } catch (error) {
    console.warn("Python backend not running, falling back to local simulation.");
    Array.from(validFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgDataUrl = e.target.result;
        uploadedImagesData.push({ id: Math.random(), imgDataUrl });
        const card = document.createElement("div");
        card.className = "ai-image-card";
        card.innerHTML = `<img src="${imgDataUrl}" alt="Uploaded image" />`;
        outputGallery.appendChild(card);
      };
      reader.readAsDataURL(file);
    });
    showToast("Simulation Mode", `Added ${validFiles.length} images locally.`);
  }
  
  outputCount.textContent = `${uploadedImagesData.length} images`;
  runInferenceBtn.disabled = false;
}

// Handle Model Change
modelSelect?.addEventListener("change", (e) => {
  activeModelName.textContent = e.target.options[e.target.selectedIndex].text.split(" ")[0];
});

// Run Inference
runInferenceBtn?.addEventListener("click", async () => {
  if (uploadedImagesData.length === 0) return;
  
  runInferenceBtn.hidden = true;
  processingStatus.hidden = false;
  $$(".bounding-box").forEach(box => box.remove());
  
  try {
    // Call Python Inference API
    const response = await fetch(`${BACKEND_URL}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_ids: uploadedImagesData.map(img => img.id),
        model: activeModelName.textContent
      })
    });
    
    const result = await response.json();
    if (result.status === "success") {
      drawBoundingBoxes(result.results);
      showToast("Inference Complete", `Processed ${uploadedImagesData.length} images via Python.`);
    }
  } catch (error) {
    console.warn("Python backend down. Simulating inference locally.");
    setTimeout(() => {
      const simulatedResults = uploadedImagesData.map(img => ({
        is_accident: Math.random() > 0.3,
        confidence: Math.round(rand(85, 99)),
        box: { width: rand(40, 80), height: rand(40, 80), top: rand(10, 50), left: rand(10, 50) }
      }));
      drawBoundingBoxes(simulatedResults);
      showToast("Simulation Complete", `Processed ${uploadedImagesData.length} images locally.`);
    }, rand(1500, 3000));
  }
  
  function drawBoundingBoxes(results) {
    runInferenceBtn.hidden = false;
    processingStatus.hidden = true;
    
    const cards = $$(".ai-image-card");
    results.forEach((res, idx) => {
      if (!cards[idx]) return;
      const box = document.createElement("div");
      box.className = `bounding-box ${res.is_accident ? 'accident' : ''}`;
      box.style.width = `${res.box.width}%`;
      box.style.height = `${res.box.height}%`;
      box.style.top = `${res.box.top}%`;
      box.style.left = `${res.box.left}%`;
      
      const label = res.is_accident ? `Accident ${res.confidence}%` : `Vehicle ${res.confidence}%`;
      box.innerHTML = `<div class="box-label">${label}</div>`;
      cards[idx].appendChild(box);
    });
  }
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
