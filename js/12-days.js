/**
 * 12 Days - Audio Controller & Global Page Interaction
 * Features:
 * - Mechanical pen click SFX on every single page click (with debounce to prevent double effects)
 * - "12 Days Theme" background music deck with playback, volume, and mute controls
 * - Responsive mobile burger navigation
 * - Full Dark & Light Theme toggle with SVG logo syncing
 */

document.addEventListener("DOMContentLoaded", () => {
    /* ==========================================================================
       1. Audio SFX & Music Deck
       ========================================================================== */
    const clickAudio = new Audio("assets/12-days/audio/click.wav");
    clickAudio.preload = "auto";
    clickAudio.volume = 0.45;

    let soundEnabled = localStorage.getItem("room108_sfx") !== "false";
    const bgmAudio = document.getElementById("days-bgm");
    const audioDeck = document.getElementById("days-audio-deck");
    const playBtn = document.getElementById("days-audio-play-btn");
    const muteBtn = document.getElementById("days-audio-mute-btn");
    const volSlider = document.getElementById("days-audio-vol");
    const navAudioBtn = document.getElementById("pixel-audio-btn");

    let lastClickTime = 0;
    function playClickSfx() {
        if (!soundEnabled) return;
        const now = performance.now();
        // Prevent double effects within 70ms (e.g. pointerdown followed by click or nested bubbles)
        if (now - lastClickTime < 70) return;
        lastClickTime = now;

        try {
            clickAudio.currentTime = 0;
            clickAudio.play().catch(() => {});
        } catch (e) {}
    }

    // Every click anywhere on the page plays the mechanical pen clicking sound exactly once
    window.addEventListener("pointerdown", () => {
        playClickSfx();
    }, { capture: true });

    // Music Deck Controller
    let hasInteracted = false;

    function updateBgmState(isPlaying) {
        if (!audioDeck || !playBtn) return;
        if (isPlaying) {
            audioDeck.classList.add("is-playing");
            playBtn.innerHTML = "<span>PAUSE</span>";
            const statusEl = audioDeck.querySelector(".audio-track-status");
            if (statusEl) statusEl.textContent = "STATE BROADCAST: ACTIVE";
        } else {
            audioDeck.classList.remove("is-playing");
            playBtn.innerHTML = "<span>PLAY</span>";
            const statusEl = audioDeck.querySelector(".audio-track-status");
            if (statusEl) statusEl.textContent = "STATE BROADCAST: PAUSED";
        }
    }

    if (bgmAudio) {
        bgmAudio.volume = volSlider ? parseFloat(volSlider.value) : 0.4;

        if (playBtn) {
            playBtn.addEventListener("click", () => {
                if (bgmAudio.paused) {
                    bgmAudio.play().then(() => updateBgmState(true)).catch(() => {});
                } else {
                    bgmAudio.pause();
                    updateBgmState(false);
                }
            });
        }

        if (muteBtn) {
            muteBtn.addEventListener("click", () => {
                bgmAudio.muted = !bgmAudio.muted;
                muteBtn.innerHTML = bgmAudio.muted ? "<span>UNMUTE</span>" : "<span>MUTE</span>";
            });
        }

        if (volSlider) {
            volSlider.addEventListener("input", (e) => {
                bgmAudio.volume = parseFloat(e.target.value);
                if (bgmAudio.muted) {
                    bgmAudio.muted = false;
                    if (muteBtn) muteBtn.innerHTML = "<span>MUTE</span>";
                }
            });
        }

        // Soft autoplay on first user gesture
        const unlockAudio = () => {
            if (!hasInteracted && bgmAudio.paused && soundEnabled) {
                hasInteracted = true;
                bgmAudio.play().then(() => updateBgmState(true)).catch(() => {});
            }
            document.removeEventListener("pointerdown", unlockAudio);
            document.removeEventListener("keydown", unlockAudio);
        };
        document.addEventListener("pointerdown", unlockAudio, { once: true });
        document.addEventListener("keydown", unlockAudio, { once: true });
    }

    // Sync with global Room108 navbar audio toggle
    if (navAudioBtn) {
        navAudioBtn.innerHTML = `<span>SFX: ${soundEnabled ? "ON" : "OFF"}</span>`;
        navAudioBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem("room108_sfx", soundEnabled ? "true" : "false");
            navAudioBtn.innerHTML = `<span>SFX: ${soundEnabled ? "ON" : "OFF"}</span>`;
            if (bgmAudio) {
                bgmAudio.muted = !soundEnabled;
                if (muteBtn) muteBtn.innerHTML = bgmAudio.muted ? "<span>UNMUTE</span>" : "<span>MUTE</span>";
            }
            if (soundEnabled) sfxClick();
        });
    }

    /* ==========================================================================
       2. Mobile Burger Navigation
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

    // Navbar Web Audio Synthesizer (Matching Room108 Global Navbar)
    let navAudioCtx = null;
    function initNavAudio() {
        if (!navAudioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) navAudioCtx = new AudioContext();
        }
        if (navAudioCtx && navAudioCtx.state === "suspended") navAudioCtx.resume();
    }
    function playNavTone(freq, duration = 0.08, type = "square", volume = 0.05) {
        if (!soundEnabled) return;
        initNavAudio();
        if (!navAudioCtx) return;
        try {
            const osc = navAudioCtx.createOscillator();
            const gain = navAudioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, navAudioCtx.currentTime);
            gain.gain.setValueAtTime(volume, navAudioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, navAudioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(navAudioCtx.destination);
            osc.start();
            osc.stop(navAudioCtx.currentTime + duration);
        } catch (e) {}
    }
    function sfxClick() {
        playNavTone(660, 0.04, "square", 0.04);
        setTimeout(() => playNavTone(880, 0.05, "square", 0.04), 35);
    }
    function sfxBleep() {
        playNavTone(520, 0.04, "triangle", 0.05);
    }

    document.querySelectorAll(".pixel-navbar a, .pixel-navbar button").forEach(el => {
        el.addEventListener("mouseenter", () => sfxBleep());
        el.addEventListener("click", () => sfxClick());
    });

    /* ==========================================================================
       3. Theme Toggle & Logo Swapping
       ========================================================================== */
    const themeBtn = document.getElementById("pixel-theme-btn");
    const navLogo = document.getElementById("nav-logo");
    const footerLogo = document.getElementById("footer-logo");
    const htmlEl = document.documentElement;

    function applyTheme(theme) {
        htmlEl.setAttribute("data-theme", theme);
        localStorage.setItem("room108_theme", theme);
        if (themeBtn) {
            themeBtn.innerHTML = `<span>${theme === "dark" ? "LIGHT" : "DARK"}</span>`;
            themeBtn.setAttribute("title", theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode");
        }

        const logoSrc = theme === "dark" ? "assets/logo-white-cropped.svg" : "assets/logo-black-cropped.svg";
        if (navLogo) navLogo.src = logoSrc;
        if (footerLogo) footerLogo.src = logoSrc;
    }

    const savedTheme = localStorage.getItem("room108_theme") || "light";
    applyTheme(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = htmlEl.getAttribute("data-theme") || "light";
            applyTheme(current === "dark" ? "light" : "dark");
        });
    }
});

