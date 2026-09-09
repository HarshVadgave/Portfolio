// ── 0. Theme Switcher & Persistence ────────────────────────
const themeToggleBtn = document.getElementById("themeToggle");

function getInitialTheme() {
  const savedTheme = localStorage.getItem("portfolio_theme");
  if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("portfolio_theme", theme);
}

setTheme(getInitialTheme());

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme") || "dark";
    setTheme(activeTheme === "dark" ? "light" : "dark");
  });
}

// ── 0b. Mobile hamburger menu ───────────────────────────────
const menuToggle = document.getElementById("menuToggle");
const navLinksEl = document.getElementById("navLinks");
const navOverlay = document.getElementById("navOverlay");

function openMenu() {
  navLinksEl.classList.add("open");
  navOverlay && navOverlay.classList.add("open");
  menuToggle.classList.add("active");
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
}

function closeMenu() {
  navLinksEl && navLinksEl.classList.remove("open");
  navOverlay && navOverlay.classList.remove("open");
  menuToggle && menuToggle.classList.remove("active");
  menuToggle && menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
}

if (menuToggle && navLinksEl) {
  menuToggle.addEventListener("click", () => {
    navLinksEl.classList.contains("open") ? closeMenu() : openMenu();
  });

  // Close when any nav link is clicked (for smooth-scroll internal links)
  navLinksEl.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  navOverlay && navOverlay.addEventListener("click", closeMenu);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900 && navLinksEl.classList.contains("open")) closeMenu();
  });
}

// ── 0c. Fix mobile viewport height quirks (iOS Safari / Android) ──
function setViewportHeight() {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}
setViewportHeight();
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight);

// ── 1. Correct link targets ─────────────────────────────────
// Internal anchor links: same tab. External links: new tab.
document.querySelectorAll("a").forEach(link => {
  const href = link.getAttribute("href") || "";

  // Internal: anchor, mailto, relative paths — keep same tab
  const isInternal =
    href.startsWith("#") ||
    href === "" ||
    (!href.startsWith("http://") && !href.startsWith("https://") && !href.startsWith("mailto:") && !href.startsWith("wa.me"));

  if (isInternal) {
    link.removeAttribute("target");
    link.removeAttribute("rel");
  } else {
    // External: GitHub, LinkedIn, Twitter, mailto, WhatsApp, live sites
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  }
});

// ── 2. Cursor spotlight on hero ─────────────────────────────
const hero = document.getElementById("hero");
if (hero) {
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + "%";
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + "%";
    hero.style.setProperty("--mx", x);
    hero.style.setProperty("--my", y);
  });
}

// ── 3. Scroll-triggered reveal ──────────────────────────────
const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ── 4. Active nav link via IntersectionObserver ─────────────
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute("id");
      navLinks.forEach(link => {
        const href = link.getAttribute("href") || "";
        link.classList.toggle("active", href.includes(`#${id}`));
      });
    }
  });
}, { rootMargin: "-40% 0px -55% 0px" });
sections.forEach(s => navObserver.observe(s));

// ── 5. Contact form → Google Sheets ────────────────────────
const scriptURL = "https://script.google.com/macros/s/AKfycbxPDri6Fqr36aP11Rvppoxli3UwfPFliEHh97lds9WtetLtTZpUSVZpsL8j0YUWu9Wn/exec";
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const statusDiv = document.getElementById("formStatus");

function showStatus(message, type) {
  if (!statusDiv) return;
  statusDiv.textContent = message;
  statusDiv.className = `form-status ${type}`;
}

function hideStatus() {
  if (!statusDiv) return;
  statusDiv.className = "form-status";
  statusDiv.textContent = "";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameVal = form.elements["name"]?.value.trim() || "";
    const emailVal = form.elements["email"]?.value.trim() || "";
    const msgVal = form.elements["message"]?.value.trim() || "";

    if (!nameVal || !emailVal || !msgVal) {
      showStatus("PLEASE FILL IN ALL REQUIRED FIELDS.", "error");
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    const origBtnHtml = submitBtn?.innerHTML || "<span>SEND MESSAGE</span><span>→</span>";
    if (submitBtn) submitBtn.innerHTML = "<span>SENDING...</span><span>⌛</span>";
    hideStatus();

    try {
      const formData = new FormData(form);
      const response = await fetch(scriptURL, { method: "POST", body: formData });

      if (response.ok || response.type === "opaque") {
        showStatus("MESSAGE SENT SUCCESSFULLY! THANK YOU FOR REACHING OUT.", "success");
        form.reset();
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (err) {
      console.warn("Primary fetch issue, attempting fallback...", err);
      try {
        const urlParams = new URLSearchParams(new FormData(form)).toString();
        await fetch(scriptURL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: urlParams
        });
        showStatus("MESSAGE SENT SUCCESSFULLY! THANK YOU FOR REACHING OUT.", "success");
        form.reset();
      } catch (fallbackErr) {
        console.error("Form submission failed:", fallbackErr);
        showStatus("SOMETHING WENT WRONG. PLEASE TRY AGAIN OR EMAIL DIRECTLY.", "error");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    }
  });
}