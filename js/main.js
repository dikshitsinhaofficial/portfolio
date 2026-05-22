// main.js - Core functionality

// ============================================================
// EMAILJS CONFIGURATION — Replace with your own values
// Sign up free at https://www.emailjs.com
// 1. Create a Service (e.g. Gmail)  → copy Service ID
// 2. Create an Email Template       → copy Template ID
//    Template variables needed: {{from_name}}, {{from_email}}, {{message}}
// 3. Account → API Keys             → copy Public Key
// ============================================================
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

document.addEventListener('DOMContentLoaded', () => {

    // Initialise EmailJS
    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }

    // ─── Smooth Scrolling ────────────────────────────────────
    document.querySelectorAll('.nav-links a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
            }
        });
    });

    // ─── Theme Toggle ────────────────────────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    const body        = document.body;

    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-mode');
        themeToggle.textContent = '🌙';
    }

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        const isLight = body.classList.contains('light-mode');
        themeToggle.textContent = isLight ? '🌙' : '☀️';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // ─── Contact Form ─────────────────────────────────────────
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const statusDiv = document.getElementById('form-status');
        const name      = document.getElementById('name').value.trim();
        const email     = document.getElementById('email').value.trim();
        const message   = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            showStatus(statusDiv, '⚠️ Please fill in all fields.', '#f59e0b');
            return;
        }

        // Button loading state
        submitBtn.textContent = 'Sending…';
        submitBtn.disabled    = true;
        statusDiv.style.display = 'none';

        // ── Strategy 1: Local Express server (localhost with node server.js)
        const sentViaServer = await trySendViaServer({ name, email, message });
        if (sentViaServer) {
            showStatus(statusDiv, '✅ Message sent successfully!', 'var(--accent)');
            contactForm.reset();
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled    = false;
            return;
        }

        // ── Strategy 2: EmailJS (works on Vercel when configured)
        const sentViaEmail = await trySendViaEmailJS({ name, email, message });
        if (sentViaEmail) {
            showStatus(statusDiv, '✅ Message sent successfully!', 'var(--accent)');
            contactForm.reset();
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled    = false;
            return;
        }

        // ── Strategy 3: mailto fallback — always works, opens email client
        openMailtoFallback({ name, email, message });
        showStatus(
            statusDiv,
            '📧 Your email client has been opened with the message pre-filled. Please press Send there!',
            'var(--accent)'
        );
        contactForm.reset();

        submitBtn.textContent = 'Send Message';
        submitBtn.disabled    = false;
    });
});

/* ── Helpers ──────────────────────────────────────────────── */

function showStatus(el, msg, color) {
    el.textContent   = msg;
    el.style.color   = color;
    el.style.display = 'block';
}

/**
 * Try POST to local Express server (works on localhost with node server.js).
 * Returns true on success, false on any failure.
 */
async function trySendViaServer(data) {
    try {
        const controller = new AbortController();
        const timeout    = setTimeout(() => controller.abort(), 4000);
        const response   = await fetch('/api/contact', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(data),
            signal:  controller.signal
        });
        clearTimeout(timeout);
        if (!response.ok) return false;
        const result = await response.json();
        return !!result.message;
    } catch (_) {
        return false; // Server not running — try next strategy
    }
}

/**
 * Send via EmailJS (works on Vercel/static hosting).
 * Configure EMAILJS_* constants at the top of this file.
 */
async function trySendViaEmailJS(data) {
    if (typeof emailjs === 'undefined') return false;
    if (
        EMAILJS_PUBLIC_KEY  === 'YOUR_PUBLIC_KEY'  ||
        EMAILJS_SERVICE_ID  === 'YOUR_SERVICE_ID'  ||
        EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID'
    ) return false; // Not configured yet

    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name:  data.name,
            from_email: data.email,
            message:    data.message,
            to_name:    'Dikshit Sinha',
            reply_to:   data.email,
        });
        return true;
    } catch (err) {
        console.error('EmailJS error:', err);
        return false;
    }
}

/**
 * Last-resort fallback: open the user's default email client
 * with name, email and message pre-filled in the body.
 */
function openMailtoFallback({ name, email, message }) {
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
    const body    = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    );
    window.location.href = `mailto:dikshitsinha186@gmail.com?subject=${subject}&body=${body}`;
}
