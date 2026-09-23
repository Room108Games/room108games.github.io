/**
 * Room108 Games - Pixel Art Interactive Controller
 * Features: Dark Theme Toggle, 8-Bit Web Audio Synthesizer, Pixel Particle Canvas, Contact Form.
 */

document.addEventListener("DOMContentLoaded", () => {
    /* ==========================================================================
       1. 8-Bit Web Audio Synthesizer (Square Waves)
       ========================================================================== */
    let audioCtx = null;
    let soundEnabled = true;
    const audioToggleBtn = document.getElementById("pixel-audio-btn");

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                audioCtx = new AudioContext();
            }
        }
        if (audioCtx && audioCtx.state === "suspended") {
            audioCtx.resume();
        }
    }

    function playTone(freq, duration = 0.08, type = "square", volume = 0.06) {
        if (!soundEnabled) return;
        initAudio();
        if (!audioCtx) return;

        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

            gain.gain.setValueAtTime(volume, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {}
    }

    function sfxClick() {
        playTone(660, 0.04, "square", 0.04);
        setTimeout(() => playTone(880, 0.05, "square", 0.04), 35);
    }

    function sfxBleep() {
        playTone(520, 0.04, "triangle", 0.05);
    }

    function sfxSuccess() {
        if (!soundEnabled) return;
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                playTone(freq, 0.1, "square", 0.07);
            }, idx * 70);
        });
    }

    if (audioToggleBtn) {
        audioToggleBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            audioToggleBtn.innerHTML = soundEnabled
                ? '<span>SFX: ON</span>'
                : '<span>SFX: OFF</span>';
            if (soundEnabled) sfxClick();
        });
    }

    /* ==========================================================================
       1b. Mobile Burger Navigation Menu
       ========================================================================== */
    const burgerBtn = document.getElementById("pixel-burger-btn");
    const navMenu = document.getElementById("nav-menu");
    const navBackdrop = document.getElementById("pixel-nav-backdrop");

    function openMobileMenu() {
        if (!burgerBtn || !navMenu) return;
        burgerBtn.classList.add("is-active");
        burgerBtn.setAttribute("aria-expanded", "true");
        navMenu.classList.add("is-open");
        if (navBackdrop) navBackdrop.classList.add("is-active");
        document.body.style.overflow = "hidden";
        sfxClick();
    }

    function closeMobileMenu() {
        if (!burgerBtn || !navMenu) return;
        burgerBtn.classList.remove("is-active");
        burgerBtn.setAttribute("aria-expanded", "false");
        navMenu.classList.remove("is-open");
        if (navBackdrop) navBackdrop.classList.remove("is-active");
        document.body.style.overflow = "";
    }

    function toggleMobileMenu() {
        if (navMenu && navMenu.classList.contains("is-open")) {
            closeMobileMenu();
            sfxClick();
        } else {
            openMobileMenu();
        }
    }

    if (burgerBtn) {
        burgerBtn.addEventListener("click", toggleMobileMenu);
    }

    if (navBackdrop) {
        navBackdrop.addEventListener("click", closeMobileMenu);
    }

    if (navMenu) {
        navMenu.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", closeMobileMenu);
        });
    }

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && navMenu && navMenu.classList.contains("is-open")) {
            closeMobileMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768 && navMenu && navMenu.classList.contains("is-open")) {
            closeMobileMenu();
        }
    }, { passive: true });

    // Attach audio to pixel buttons
    document.querySelectorAll(".pixel-btn, .pixel-submit-btn, .channel-link, .nav-link, .pixel-theme-btn, .pixel-burger-btn").forEach(el => {
        el.addEventListener("mouseenter", () => sfxBleep());
        el.addEventListener("click", () => sfxClick());
    });

    /* ==========================================================================
       2. Dark Theme Toggle & Logo Swapping
       ========================================================================== */
    const themeBtn = document.getElementById("pixel-theme-btn");
    const navLogo = document.getElementById("nav-logo");
    const heroLogo = document.getElementById("hero-logo");
    const footerLogo = document.getElementById("footer-logo");

    const LOGO_NAV_LIGHT = "assets/logo-black-cropped.svg";
    const LOGO_NAV_DARK = "assets/logo-white-cropped.svg";
    const LOGO_HERO_LIGHT = "assets/logo-black-cropped.svg";
    const LOGO_HERO_DARK = "assets/logo-white-cropped.svg";

    const savedTheme = localStorage.getItem("room108_theme") || "light";
    applyTheme(savedTheme);

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("room108_theme", theme);

        const isDark = theme === "dark";

        // Swap SVG Logos
        if (navLogo) navLogo.src = isDark ? LOGO_NAV_DARK : LOGO_NAV_LIGHT;
        if (heroLogo) heroLogo.src = isDark ? LOGO_HERO_DARK : LOGO_HERO_LIGHT;
        if (footerLogo) footerLogo.src = isDark ? LOGO_NAV_DARK : LOGO_NAV_LIGHT;

        // Button label (No emojis)
        if (themeBtn) {
            themeBtn.innerHTML = isDark
                ? '<span>LIGHT</span>'
                : '<span>DARK</span>';
            themeBtn.setAttribute("title", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
        }

        // Meta theme-color
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) {
            metaTheme.setAttribute("content", isDark ? "#0a140d" : "#DDE9CE");
        }
    }

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme") || "light";
            const next = current === "dark" ? "light" : "dark";
            applyTheme(next);
            showToast(`THEME: ${next.toUpperCase()} MODE ACTIVATED`, "info");
        });
    }

    /* ==========================================================================
       3. Hero Emblem Interaction
       ========================================================================== */
    const heroEmblem = document.getElementById("hero-emblem-box");
    if (heroEmblem) {
        heroEmblem.addEventListener("click", () => {
            sfxSuccess();
            heroEmblem.style.animation = "pixelShake 0.4s steps(4)";
            setTimeout(() => {
                heroEmblem.style.animation = "";
            }, 400);
        });
    }

    /* ==========================================================================
       4. Floating Pixel Particle Background Canvas
       ========================================================================== */
    const canvas = document.getElementById("pixel-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let width, height;
        let pixels = [];

        function resize() {
            width = canvas.width = canvas.parentElement.offsetWidth;
            height = canvas.height = canvas.parentElement.offsetHeight;
            initPixels();
        }

        class PixelBit {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.floor(Math.random() * (width / 6)) * 6;
                this.y = height + Math.random() * 40;
                this.size = Math.random() > 0.6 ? 6 : 4;
                this.speed = Math.random() * 0.7 + 0.3;
                this.color = Math.random() > 0.5 ? "#8CC63F" : "#0B9444";
                this.alpha = Math.random() * 0.45 + 0.2;
            }

            update() {
                this.y -= this.speed;
                if (this.y < -10) this.reset();
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
                ctx.restore();
            }
        }

        function initPixels() {
            pixels = [];
            const count = Math.min(Math.floor(width / 35), 35);
            for (let i = 0; i < count; i++) {
                const p = new PixelBit();
                p.y = Math.random() * height;
                pixels.push(p);
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < pixels.length; i++) {
                pixels[i].update();
                pixels[i].draw();
            }
            requestAnimationFrame(animate);
        }

        window.addEventListener("resize", resize);
        resize();
        animate();
    }

    /* ==========================================================================
       5. Contact Form Submission
       ========================================================================== */
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            sfxSuccess();

            const name = document.getElementById("field-name").value.trim();
            const email = document.getElementById("field-email").value.trim();
            const message = document.getElementById("field-message").value.trim();

            if (!name || !email || !message) {
                showToast("[!] PLEASE FILL IN ALL FIELDS", "warn");
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "TRANSMITTING...";
            }

            setTimeout(() => {
                showToast(`[>] DISPATCH LOGGED! Thanks ${name}, our team will reply soon!`, "success");
                contactForm.reset();

                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "SEND TRANSMISSION";
                }
            }, 600);
        });
    }

    function showToast(text, type = "success") {
        const container = document.getElementById("toast-container");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = "pixel-toast";

        const prefixEl = document.createElement("span");
        prefixEl.style.fontFamily = "var(--font-pixel-heading)";
        prefixEl.style.fontSize = "0.75rem";
        prefixEl.style.color = "var(--color-secondary)";
        prefixEl.style.fontWeight = "bold";
        prefixEl.textContent = type === "success" ? "[OK]" : "[!]";

        const msgEl = document.createElement("span");
        msgEl.className = "toast-msg";
        msgEl.textContent = text; // Safe textContent neutralizes XSS

        toast.appendChild(prefixEl);
        toast.appendChild(msgEl);
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
});
