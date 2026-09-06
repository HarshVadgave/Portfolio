 // 1. Cursor spotlight on hero
    const hero = document.getElementById('hero');
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      hero.style.setProperty('--mx', x);
      hero.style.setProperty('--my', y);
    });

    // 2. Scroll-triggered reveal
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

    // 3. Active nav link via IntersectionObserver
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => navObserver.observe(s));


// 4. Contact form submission to Google Sheets
const scriptURL = "https://script.google.com/macros/s/AKfycbwrQYvr3WeE0cbKmAYToR3aOkcUZMkOJl1-7LC6LLsIPFP1wzoFcvMRJabpkDvP8Pvowg/exec";
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
      showStatus("Please fill in all required fields.", "error");
      return;
    }

    // Disable button to prevent duplicate rapid submissions
    if (submitBtn) submitBtn.disabled = true;
    const origBtnText = submitBtn ? submitBtn.textContent : "Send Message";
    if (submitBtn) submitBtn.textContent = "Sending...";
    hideStatus();

    try {
      const formData = new FormData(form);
      
      const response = await fetch(scriptURL, {
        method: "POST",
        body: formData
      });

      if (response.ok || response.type === "opaque") {
        showStatus("Message sent successfully! Thank you for reaching out.", "success");
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
        showStatus("Message sent successfully! Thank you for reaching out.", "success");
        form.reset();
      } catch (fallbackErr) {
        console.error("Form submission failed:", fallbackErr);
        showStatus("Something went wrong while sending your message. Please try again or email directly.", "error");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origBtnText;
      }
    }
  });
}