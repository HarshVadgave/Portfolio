// 0. Theme Switcher & Persistence System
const themeToggleBtn = document.getElementById("themeToggle");

function getInitialTheme() {
  const savedTheme = localStorage.getItem("portfolio_theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("portfolio_theme", theme);
}

// Set initial theme immediately
const currentTheme = getInitialTheme();
setTheme(currentTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const activeTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = activeTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
}

// 1. Ensure ALL links on the website open in a new tab when clicked
document.querySelectorAll('a').forEach(link => {
  link.setAttribute('target', '_blank');
  link.setAttribute('rel', 'noopener noreferrer');
});

// Also dynamically ensure target="_blank" on click for any newly added or queried links
document.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (link) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
});

// 2. Cursor spotlight on hero
const hero = document.getElementById('hero');
if (hero) {
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1) + '%';
    hero.style.setProperty('--mx', x);
    hero.style.setProperty('--my', y);
  });
}

// 3. Scroll-triggered reveal
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// 4. Active nav link via IntersectionObserver
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.includes(`#${id}`)) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => navObserver.observe(s));

// 5. Contact form submission to Google Sheets
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

    const nameVal = form.elements["name"] ? form.elements["name"].value.trim() : "";
    const emailVal = form.elements["email"] ? form.elements["email"].value.trim() : "";
    const msgVal = form.elements["message"] ? form.elements["message"].value.trim() : "";

    if (!nameVal || !emailVal || !msgVal) {
      showStatus("PLEASE FILL IN ALL REQUIRED FIELDS.", "error");
      return;
    }

    // Disable button to prevent duplicate rapid submissions
    if (submitBtn) submitBtn.disabled = true;
    const origBtnHtml = submitBtn ? submitBtn.innerHTML : "<span>SEND MESSAGE</span><span>→</span>";
    if (submitBtn) submitBtn.innerHTML = "<span>SENDING...</span><span>⌛</span>";
    hideStatus();

    try {
      const formData = new FormData(form);
      
      const response = await fetch(scriptURL, {
        method: "POST",
        body: formData
      });

      if (response.ok || response.type === "opaque") {
        showStatus("MESSAGE SENT SUCCESSFULLY! THANK YOU FOR REACHING OUT.", "success");
        form.reset();
      } else {
        throw new Error(`Server returned status ${response.status}`);
      }
    } catch (err) {
      console.warn("Primary fetch encountered an issue, attempting fallback...", err);
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
        showStatus("SOMETHING WENT WRONG WHILE SENDING YOUR MESSAGE. PLEASE TRY AGAIN OR EMAIL DIRECTLY.", "error");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    }
  });
}