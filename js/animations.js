// animations.js — Scroll, Mouse-Tracking, and Interaction Animations

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
                setTimeout(typeWriter, 2000);
                return;
            }
        } else {
            typeEl.textContent = current.slice(0, --charIndex);
            if (charIndex === 0) {
                deleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
            }
        }
        setTimeout(typeWriter, deleting ? 50 : 90);
    }
    typeWriter();

    // ============================================
    // 3. INTERSECTION OBSERVER — SCROLL FADE IN
    // ============================================
    const faders = document.querySelectorAll('.section, .skill-card, .project-card, .achievement-card, .cert-card, .education-grid > div');
    const appearOptions = { threshold: 0.1, rootMargin: '0px 0px -60px 0px' };
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
    // 4. ACTIVE NAV LINK ON SCROLL & NAVBAR SHRINK
    // ============================================
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const navbar   = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        // Shrink navbar
        if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40);

        // Highlight active nav link
        let current = '';
        sections.forEach(sec => {
            if (window.scrollY >= sec.offsetTop - 150) current = sec.id;
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    }, { passive: true });

    // ============================================
    // 5. 3D TILT EFFECT ON CARDS
    // ============================================
    document.querySelectorAll('.project-card, .achievement-card, .cert-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width  / 2;
            const y = e.clientY - rect.top  - rect.height / 2;
            const rotX = (-y / rect.height) * 8;
            const rotY = ( x / rect.width)  * 8;
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.transition = 'transform 0.5s ease';
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    // ============================================
    // 6. MAGNETIC PARTICLES WITH MOUSE INTERACTION
    // ============================================
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let mouse = { x: null, y: null, radius: 140 };

        function resize() {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        // Track mouse coords relative to canvas
        window.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            if (e.clientY >= rect.top && e.clientY <= rect.bottom && e.clientX >= rect.left && e.clientX <= rect.right) {
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            } else {
                mouse.x = null;
                mouse.y = null;
            }
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        function randomColor() {
            const colors = ['rgba(139,92,246,', 'rgba(6,182,212,', 'rgba(99,102,241,'];
            return colors[Math.floor(Math.random() * colors.length)];
        }

        function createParticle() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.4 + 0.1,
                dx: (Math.random() - 0.5) * 0.3,
                dy: (Math.random() - 0.5) * 0.3,
                baseDx: (Math.random() - 0.5) * 0.3,
                baseDy: (Math.random() - 0.5) * 0.3,
                color: randomColor()
            };
        }

        for (let i = 0; i < 90; i++) particles.push(createParticle());

        function drawParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                // If mouse is near, attract particles slightly
                if (mouse.x !== null && mouse.y !== null) {
                    const distToMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                    if (distToMouse < mouse.radius) {
                        const forceDirectionX = mouse.x - p.x;
                        const forceDirectionY = mouse.y - p.y;
                        const force = (mouse.radius - distToMouse) / mouse.radius; // 0 to 1
                        
                        // Subtle acceleration towards mouse
                        p.x += (forceDirectionX / distToMouse) * force * 0.6;
                        p.y += (forceDirectionY / distToMouse) * force * 0.6;
                    }
                }

                // Regular movement
                p.x += p.dx;
                p.y += p.dy;

                // Border collision
                if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color + p.alpha + ')';
                ctx.fill();
            });

            // Draw lines between particles and mouse
            if (mouse.x !== null && mouse.y !== null) {
                particles.forEach(p => {
                    const distToMouse = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                    if (distToMouse < mouse.radius) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(6,182,212,${0.12 * (1 - distToMouse / mouse.radius)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            }

            // Draw lines between nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(139,92,246,${0.05 * (1 - dist / 100)})`;
                        ctx.lineWidth = 0.4;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(drawParticles);
        }
        drawParticles();
    }

    // ============================================
    // 7. BACKGROUND ORBS MOUSE PARALLAX
    // ============================================
    const orb1 = document.querySelector('.orb-1');
    const orb2 = document.querySelector('.orb-2');
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;

    window.addEventListener('mousemove', e => {
        targetX = (e.clientX - window.innerWidth / 2) * 0.05;
        targetY = (e.clientY - window.innerHeight / 2) * 0.05;
    });

    function updateOrbs() {
        // Easing interpolation
        currentX += (targetX - currentX) * 0.05;
        currentY += (targetY - currentY) * 0.05;

        // Apply smooth offset translation to custom background orbs
        if (orb1) orb1.style.transform = `translate(${currentX}px, ${currentY}px)`;
        if (orb2) orb2.style.transform = `translate(${-currentX * 1.3}px, ${-currentY * 1.3}px)`;

        requestAnimationFrame(updateOrbs);
    }
    updateOrbs();

    // ============================================
    // 8. SKILL CARD STAGGER ON APPEAR
    // ============================================
    document.querySelectorAll('.skills-grid').forEach(grid => {
        const cards = grid.querySelectorAll('.skill-card');
        const gridObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                cards.forEach((card, i) => {
                    setTimeout(() => card.classList.add('appear'), i * 60);
                });
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.15 });
        gridObserver.observe(grid);
    });

});
