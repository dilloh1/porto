/* =============================================
   MAIN.JS — Portfolio Ananda Fahrudin Fadhillah
   ============================================= */

// === NAVBAR SCROLL ===
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// === HAMBURGER MENU ===
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = hamburger.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

// Tutup menu saat klik link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  });
});

// === SMOOTH ACTIVE NAV ===
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - 100;
    if (window.scrollY >= top) current = section.getAttribute('id');
  });
  navItems.forEach(a => {
    a.style.color = '';
    a.style.backgroundColor = '';
    a.style.border = '';
    a.style.boxShadow = '';
    
    if (a.getAttribute('href') === `#${current}`) {
      a.style.backgroundColor = 'var(--saweria-yellow)';
      a.style.border = 'var(--border-thin)';
      a.style.boxShadow = '2px 2px 0px 0px var(--saweria-dark)';
    }
  });
});

// === SCROLL REVEAL ===
const revealEls = document.querySelectorAll(
  '.skill-card, .project-card, .testi-card, .contact-card, .about-card, .section-title, .section-sub, .section-label'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach(el => revealObserver.observe(el));

// === SKILL BAR ANIMATION ===
const skillBars = document.querySelectorAll('.skill-fill');
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animated');
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

skillBars.forEach(bar => skillObserver.observe(bar));

// === FOOTER YEAR ===
document.getElementById('footerYear').textContent = `© ${new Date().getFullYear()} Ananda Fahrudin Fadhillah`;