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


    // Contact form submission
const scriptURL = "https://script.google.com/macros/s/AKfycbwrQYvr3WeE0cbKmAYToR3aOkcUZMkOJl1-7LC6LLsIPFP1wzoFcvMRJabpkDvP8Pvowg/exec";
const form = document.getElementById("contactForm");

form.addEventListener("submit", e => {
  e.preventDefault();
  fetch(scriptURL, { method: "POST", body: new FormData(form)})
    .then(() => {
      alert("Message sent successfully!");
      form.reset();
    })
    .catch(() => alert("Something went wrong"));
});