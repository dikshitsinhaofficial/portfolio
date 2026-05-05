// animations.js — All scroll and interaction animations

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. SCROLL PROGRESS BAR
    // ============================================
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = (scrollTop / docHeight) * 100;
        if (progressBar) progressBar.style.width = pct + '%';
    }, { passive: true });

    // ============================================
    // 2. TYPEWRITER EFFECT
    // ============================================
    const typeEl = document.getElementById('typewriter');
    const phrases = [
        'Computer Science Graduate.',
        'Full Stack Developer.',
        'Problem Solver.',
        'Open Source Enthusiast.',
    ];
    let phraseIndex = 0, charIndex = 0, deleting = false;

    function typeWriter() {
        if (!typeEl) return;
        const current = phrases[phraseIndex];
        if (!deleting) {
            typeEl.textContent = current.slice(0, ++charIndex);
            if (charIndex === current.length) {
                deleting = true;
                setTimeout(typeWriter, 1800);
                return;
            }
        } else {
            typeEl.textContent = current.slice(0, --charIndex);
            if (charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
            }
        }
        setTimeout(typeWriter, deleting ? 60 : 100);
    }
    typeWriter();

    // ============================================
    // 3. INTERSECTION OBSERVER — SCROLL FADE IN
    // ============================================
    const faders = document.querySelectorAll('.section, .skill-card, .project-card');
    const appearOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const appearOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('appear');
            observer.unobserve(entry.target);
        });
    }, appearOptions);
    faders.forEach(el => {
        el.classList.add('fade-in');
        appearOnScroll.observe(el);
    });

    // ============================================
    // 4. ACTIVE NAV LINK ON SCROLL
    // ============================================
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const navbar   = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        // Shrink navbar
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);

        // Highlight active nav link
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    }, { passive: true });

    // ============================================
    // 5. 3D TILT EFFECT ON PROJECT CARDS
    // ============================================
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width  / 2;
            const y = e.clientY - rect.top  - rect.height / 2;
            const rotX = (-y / rect.height) * 12;
            const rotY = ( x / rect.width)  * 12;
            card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // ============================================
    // 6. FLOATING PARTICLE CANVAS IN HERO
    // ============================================
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];

        function resize() {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        function randomColor() {
            const colors = ['rgba(59,130,246,', 'rgba(16,185,129,', 'rgba(139,92,246,'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1,
                dx: (Math.random() - 0.5) * 0.4,
                dy: (Math.random() - 0.5) * 0.4,
                color: randomColor()
            };
        }

        for (let i = 0; i < 80; i++) particles.push(createParticle());

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.fill();
            });

            // Draw lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(59,130,246,${0.06 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    // ============================================
    // 7. SKILL CARD STAGGER ON APPEAR
    // ============================================
    document.querySelectorAll('.skills-grid').forEach(grid => {
        const cards = grid.querySelectorAll('.skill-card');
        const gridObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                cards.forEach((card, i) => {
                    setTimeout(() => card.classList.add('appear'), i * 80);
                });
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.2 });
        gridObserver.observe(grid);
    });

});
