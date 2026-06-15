/* =============================================
   MAIN.JS — Portfolio Ananda Fahrudin Fadhillah
   ============================================= */

// === 1. FUNGSI FETCH & RENDER PROYEK ===
async function loadProjects() {
  const container = document.getElementById('projectsGrid');
  if (!container) return;

  try {
    // Memanggil endpoint backend Vercel (Bebas CORS)
    const res = await fetch('/api/get_projects');
    if (!res.ok) throw new Error('Respon server backend bermasalah');
    
    const result = await res.json();
    const projects = result.data || [];

    if (projects.length === 0) {
      container.innerHTML = `<p style="text-align:center; padding:40px; font-weight:700; color:var(--saweria-dark);">Belum ada proyek yang terdaftar.</p>`;
      return;
    }

    container.innerHTML = projects.map((p, index) => `
      <article class="project-card reveal">
        <div class="project-thumb">
          <img src="${p.image_url}" alt="${p.title}" class="project-image" onerror="this.src='https://placehold.co/600x400?text=Format+Gambar+Error'"/>
          <div class="project-number">0${index + 1}</div>
        </div>
        <div class="project-body">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="project-footer">
            <div class="project-links">
              <a href="${p.link_project}" target="_blank" class="project-link project-link-live">
                <i class="fas fa-external-link-alt"></i> View Project
              </a>
            </div>
          </div>
        </div>
      </article>
    `).join('');
    
    // Pasang ulang trigger animasi kemunculan Neo-Brutalisme
    const newReveals = container.querySelectorAll('.reveal');
    newReveals.forEach(el => revealObserver.observe(el));

  } catch (err) {
    console.error("Gagal memuat proyek:", err);
    container.innerHTML = `<p style="text-align:center; padding:20px; color:var(--saweria-dark); font-weight:700;">Gagal memuat proyek dari database.</p>`;
  }
}

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

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
  const footerYearEl = document.getElementById('footerYear');
  if (footerYearEl) {
    footerYearEl.textContent = `© ${new Date().getFullYear()} Ananda Fahrudin Fadhillah`;
  }
  loadProjects();
});