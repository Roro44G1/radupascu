/* ═══════════════════════════════════════════════════
   radupascu.online — Main Script
   ═══════════════════════════════════════════════════ */

// Inițializare iconițe Lucide
document.addEventListener('DOMContentLoaded', function() {
    lucide.createIcons();
});

// Fetch Footer
fetch('https://radupascu.online/footer.html')
    .then(res => res.text())
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
        // Re-inițializare Lucide pentru iconițele din footer
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    })
    .catch(err => console.error('Footer fetch error:', err));

// Fetch Protection Script
fetch('https://radupascu.online/script_protect.js')
    .then(res => res.text())
    .then(data => {
        const script = document.createElement('script');
        script.textContent = data;
        document.body.appendChild(script);
    })
    .catch(err => console.error('Protection script fetch error:', err));
