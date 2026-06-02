/**
 * certificates.js
 * ─────────────────────────────────────────────────────────────
 * Manages the "🎓 Certificate" buttons on every project card.
 *
 * HOW IT WORKS
 *  1. Each button carries data-project="<key>" (e.g. "desicart").
 *  2. On first click  → opens a modal so you can paste the Google
 *     Drive link and hit "Save & Open".
 *  3. On subsequent clicks → opens the saved link directly in a
 *     new tab (no modal needed).
 *  4. The link is stored in localStorage as cert_<key>.
 *  5. Buttons with a saved link get a green "cert-saved" style so
 *     you can tell at a glance which certs are wired up.
 *  6. "Clear" removes the saved link and resets the button state.
 * ─────────────────────────────────────────────────────────────
 */

(function () {
    'use strict';

    const STORAGE_PREFIX = 'cert_';

    /* ── DOM refs ───────────────────────────────────────────── */
    const overlay   = document.getElementById('cert-modal-overlay');
    const closeBtn  = document.getElementById('cert-modal-close');
    const input     = document.getElementById('cert-link-input');
    const saveBtn   = document.getElementById('cert-save-btn');
    const clearBtn  = document.getElementById('cert-clear-btn');
    const hint      = document.getElementById('cert-modal-hint');

    if (!overlay) return; // Safety guard

    let activeProjectKey = null; // Which project is currently open in the modal

    /* ── Helpers ────────────────────────────────────────────── */

    function storageKey(projectKey) {
        return STORAGE_PREFIX + projectKey;
    }

    function getSavedLink(projectKey) {
        return localStorage.getItem(storageKey(projectKey)) || '';
    }

    function saveLink(projectKey, url) {
        if (url) {
            localStorage.setItem(storageKey(projectKey), url);
        } else {
            localStorage.removeItem(storageKey(projectKey));
        }
    }

    /** Mark a button green if it already has a saved link */
    function refreshButtonState(btn) {
        const key  = btn.dataset.project;
        const saved = getSavedLink(key);
        if (saved) {
            btn.classList.add('cert-saved');
            btn.title = 'Certificate saved — click to open';
        } else {
            btn.classList.remove('cert-saved');
            btn.title = 'Paste your Google Drive certificate link';
        }
    }

    function showHint(msg, color) {
        hint.textContent  = msg;
        hint.style.color  = color || 'var(--accent)';
    }

    function clearHint() {
        hint.textContent = '';
    }

    /* ── Open / Close modal ─────────────────────────────────── */

    function openModal(projectKey) {
        activeProjectKey = projectKey;
        const saved      = getSavedLink(projectKey);
        input.value      = saved;
        clearHint();
        overlay.classList.add('active');
        // Focus input after animation
        setTimeout(() => input.focus(), 320);
    }

    function closeModal() {
        overlay.classList.remove('active');
        activeProjectKey = null;
        clearHint();
    }

    /* ── Button click handler ───────────────────────────────── */

    function handleCertButtonClick(e) {
        const btn = e.currentTarget;
        const key = btn.dataset.project;
        const saved = getSavedLink(key);

        if (saved) {
            // Link already stored — open directly
            window.open(saved, '_blank', 'noopener,noreferrer');
        } else {
            // No link yet — open modal to paste one
            openModal(key);
        }
    }

    /* ── Save button ────────────────────────────────────────── */

    function handleSave() {
        const rawUrl = input.value.trim();

        if (!rawUrl) {
            showHint('⚠️ Please paste a link first.', '#f59e0b');
            input.focus();
            return;
        }

        // Basic URL validation
        try {
            new URL(rawUrl);
        } catch (_) {
            showHint('⚠️ That doesn\'t look like a valid URL.', '#ef4444');
            input.focus();
            return;
        }

        // Save and open
        saveLink(activeProjectKey, rawUrl);
        showHint('✅ Link saved!', '#10b981');

        // Refresh the corresponding button
        document.querySelectorAll(`.btn-cert[data-project="${activeProjectKey}"]`)
            .forEach(refreshButtonState);

        // Open the certificate in a new tab
        window.open(rawUrl, '_blank', 'noopener,noreferrer');

        // Close modal after a short delay so the user sees "✅ Link saved!"
        setTimeout(closeModal, 900);
    }

    /* ── Clear button ───────────────────────────────────────── */

    function handleClear() {
        if (!activeProjectKey) return;
        saveLink(activeProjectKey, '');
        input.value = '';
        document.querySelectorAll(`.btn-cert[data-project="${activeProjectKey}"]`)
            .forEach(refreshButtonState);
        showHint('🗑 Link cleared.', 'var(--text-muted)');
    }

    /* ── Close on overlay click ─────────────────────────────── */

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    /* ── Close on Escape key ────────────────────────────────── */

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) {
            closeModal();
        }
    });

    /* ── Save on Enter inside input ─────────────────────────── */

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSave();
    });

    /* ── Wire up modal buttons ──────────────────────────────── */

    closeBtn.addEventListener('click', closeModal);
    saveBtn.addEventListener('click', handleSave);
    clearBtn.addEventListener('click', handleClear);

    /* ── Wire up all cert buttons on the page ───────────────── */

    document.querySelectorAll('.btn-cert').forEach((btn) => {
        const key        = btn.dataset.project;
        const defaultUrl = btn.dataset.certUrl || '';

        // Auto-seed hardcoded links into localStorage on first visit
        if (defaultUrl && !getSavedLink(key)) {
            saveLink(key, defaultUrl);
        }

        refreshButtonState(btn);
        btn.addEventListener('click', handleCertButtonClick);
    });

})();

