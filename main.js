// ── Typewriter ─────────────────────────────────
const roles = [
    'CI/CD pipelines',
    'On-premise deployment',
    'Monitoring',
    'Security compliance',
    'Infrastructure documentation',
    'Mentoring',
];

function initTypewriter() {
    const el = document.getElementById('typedText');
    if (!el) return;

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function tick() {
        const current = roles[roleIndex];
        el.textContent = current.slice(0, charIndex);

        if (!deleting && charIndex < current.length) {
            charIndex++;
            setTimeout(tick, 90);
        } else if (!deleting && charIndex === current.length) {
            deleting = true;
            setTimeout(tick, 1800);
        } else if (deleting && charIndex > 0) {
            charIndex--;
            setTimeout(tick, 45);
        } else {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(tick, 300);
        }
    }

    tick();
}

// ── Scroll animations ──────────────────────────
function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('visible'), i * 80);
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ── Stats counters ─────────────────────────────
function initCounters() {
    const statsRow = document.getElementById('statsRow');
    if (!statsRow) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);

            entry.target.querySelectorAll('.stat-number').forEach(el => {
                const from = parseFloat(el.dataset.from);
                const to = parseFloat(el.dataset.to);
                const suffix = el.dataset.suffix || '';
                const isFloat = el.dataset.float === '1';
                const duration = 1200;
                const startTime = performance.now();
                const decreasing = to < from;

                function step(now) {
                    const elapsed = now - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    const value = from + (to - from) * eased;
                    el.textContent = (isFloat ? value.toFixed(1) : Math.round(value)) + suffix;
                    if (progress < 1) requestAnimationFrame(step);
                }

                requestAnimationFrame(step);
            });
        });
    }, { threshold: 0.3 });

    observer.observe(statsRow);
}

// ── GitHub projects ────────────────────────────
const LANG_COLORS = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Shell: '#89e051',
    Dockerfile: '#384d54',
    Go: '#00ADD8',
    Ruby: '#701516',
    Java: '#b07219',
    CSS: '#563d7c',
    HTML: '#e34c26',
    Rust: '#dea584',
    Makefile: '#427819',
};

function langColor(lang) {
    return LANG_COLORS[lang] || '#8892a4';
}

function renderProjects(repos) {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;

    if (!repos.length) {
        grid.innerHTML = '<div class="projects-loading">No public repositories found.</div>';
        return;
    }

    grid.innerHTML = repos.map(repo => `
        <a href="${repo.html_url}" class="project-card" target="_blank" rel="noopener">
            <div class="project-card-name">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                ${repo.name}
            </div>
            ${repo.description ? `<div class="project-card-desc">${repo.description}</div>` : ''}
            <div class="project-card-footer">
                ${repo.language ? `
                <span class="project-lang">
                    <span class="lang-dot" style="background:${langColor(repo.language)}"></span>
                    ${repo.language}
                </span>` : ''}
                ${repo.stargazers_count > 0 ? `
                <span class="project-stars">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    ${repo.stargazers_count}
                </span>` : ''}
            </div>
        </a>
    `).join('');

    initCardTilt();
}

function initProjects() {
    fetch('https://api.github.com/users/dragoura/repos?sort=pushed&per_page=50')
        .then(r => r.json())
        .then(data => {
            const repos = data
                .filter(r => !r.fork && r.name !== 'dragoura')
                .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
                .slice(0, 6);
            renderProjects(repos);
        })
        .catch(() => {
            const grid = document.getElementById('projectsGrid');
            if (grid) grid.innerHTML = '<div class="projects-loading">Could not load repositories.</div>';
        });
}

// ── Card tilt effect ───────────────────────────
function initCardTilt() {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ── Sticky nav ─────────────────────────────────
function initNav() {
    const nav = document.getElementById('nav');
    const burger = document.getElementById('navBurger');
    const links = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    burger.addEventListener('click', () => {
        burger.classList.toggle('open');
        links.classList.toggle('open');
    });

    links.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            burger.classList.remove('open');
            links.classList.remove('open');
        });
    });

    const sections = document.querySelectorAll('section[id]');
    const navAs = document.querySelectorAll('.nav-links a');

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navAs.forEach(a => {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => sectionObserver.observe(s));
}

// ── Network graph ──────────────────────────────
function initNetworkGraph() {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const PARTICLE_COUNT = 130;
    const MAX_DIST = 130;
    const MOUSE_RADIUS = 120;
    const MOUSE_FORCE = 0.012;

    let mouse = { x: null, y: null };
    let particles = [];
    let animId;

    function resize() {
        const hero = canvas.parentElement;
        canvas.width = hero.offsetWidth;
        canvas.height = hero.offsetHeight;
    }

    class Particle {
        constructor() { this.reset(true); }

        reset(initial) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : -10;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.r = Math.random() * 1.8 + 0.8;
            this.isHub = Math.random() < 0.12;
            if (this.isHub) this.r = Math.random() * 2.5 + 2;
            this.green = Math.random() < 0.5;
        }

        update() {
            if (mouse.x !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MOUSE_RADIUS) {
                    this.vx += dx / dist * MOUSE_FORCE;
                    this.vy += dy / dist * MOUSE_FORCE;
                }
            }
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 0.9) { this.vx = this.vx / speed * 0.9; this.vy = this.vy / speed * 0.9; }
            this.x += this.vx; this.y += this.vy;
            if (this.x < -20) this.x = canvas.width + 20;
            if (this.x > canvas.width + 20) this.x = -20;
            if (this.y < -20) this.y = canvas.height + 20;
            if (this.y > canvas.height + 20) this.y = -20;
        }

        draw() {
            const color = this.green ? '46,204,113' : '52,152,219';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color},${this.isHub ? 0.9 : 0.65})`;
            ctx.fill();
            if (this.isHub) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r + 3, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(${color},0.2)`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    function init() {
        particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    }

    function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const opacity = (1 - dist / MAX_DIST) * 0.45;
                    const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                    grad.addColorStop(0, `rgba(46,204,113,${opacity})`);
                    grad.addColorStop(1, `rgba(52,152,219,${opacity})`);
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(frame);
    }

    window.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    }, { passive: true });

    window.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { if (!animId) frame(); }
            else { cancelAnimationFrame(animId); animId = null; }
        });
    }, { threshold: 0.1 });

    heroObserver.observe(canvas.parentElement);
    window.addEventListener('resize', () => { resize(); init(); }, { passive: true });

    resize();
    init();
    frame();
}

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initTypewriter();
    initScrollAnimations();
    initCounters();
    initProjects();
    initNetworkGraph();
});
