// main.js - Core functionality

// ============================================================
// EMAILJS CONFIGURATION — Replace these with your own values
// Sign up free at https://www.emailjs.com
// 1. Create a Service (e.g. Gmail)  → copy Service ID
// 2. Create an Email Template       → copy Template ID
// 3. Go to Account → API Keys       → copy Public Key
// ============================================================
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // e.g. 'abc123XYZ'
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // e.g. 'service_xxxxxx'
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // e.g. 'template_xxxxxx'

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

        // ── Strategy 1: Try local server (works when running node server.js)
        const sentViaServer = await trySendViaServer({ name, email, message });

        if (sentViaServer) {
            showStatus(statusDiv, '✅ Message sent successfully!', 'var(--accent)');
            contactForm.reset();
        } else {
            // ── Strategy 2: Fallback to EmailJS (works on Vercel / any static host)
            const sentViaEmail = await trySendViaEmailJS({ name, email, message });
            if (sentViaEmail) {
                showStatus(statusDiv, '✅ Message sent successfully!', 'var(--accent)');
                contactForm.reset();
            } else {
                showStatus(
                    statusDiv,
                    '❌ Could not send message. Please email directly at dikshitsinha186@gmail.com',
                    '#ef4444'
                );
            }
        }

        submitBtn.textContent = 'Send Message';
        submitBtn.disabled    = false;
    });
});

/* ── Helpers ──────────────────────────────────────────────── */

function showStatus(el, msg, color) {
    el.textContent    = msg;
    el.style.color    = color;
    el.style.display  = 'block';
}

/**
 * Try to POST to the local Express server.
 * Returns true on success, false on any failure (including network error).
 */
async function trySendViaServer(data) {
    try {
        const response = await fetch('/api/contact', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(data),
            signal:  AbortSignal.timeout(5000) // 5-second timeout
        });
        if (!response.ok) return false;
        const result = await response.json();
        return !!result.message;
    } catch (_) {
        return false; // Server not running (e.g. on Vercel) — fall through to EmailJS
    }
}

/**
 * Send via EmailJS (works on any static host, including Vercel).
 * Requires EMAILJS_PUBLIC_KEY, EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID to be configured above.
 */
async function trySendViaEmailJS(data) {
    if (typeof emailjs === 'undefined') return false;
    if (
        EMAILJS_PUBLIC_KEY  === 'YOUR_PUBLIC_KEY'  ||
        EMAILJS_SERVICE_ID  === 'YOUR_SERVICE_ID'  ||
        EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID'
    ) {
        console.warn('EmailJS not configured. Replace placeholder values in js/main.js');
        return false;
    }
    try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            from_name:    data.name,
            from_email:   data.email,
            message:      data.message,
            to_name:      'Dikshit Sinha',
            reply_to:     data.email,
        });
        return true;
    } catch (err) {
        console.error('EmailJS error:', err);
        return false;
    }
}
