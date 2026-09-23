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

    let soundEnabled = localStorage.getItem("room108_sound") !== "false";
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
        navAudioBtn.addEventListener("click", () => {
            soundEnabled = !soundEnabled;
            localStorage.setItem("room108_sound", soundEnabled ? "true" : "false");
            navAudioBtn.innerHTML = `<span>SFX: ${soundEnabled ? "ON" : "OFF"}</span>`;
            if (bgmAudio) {
                bgmAudio.muted = !soundEnabled;
                if (muteBtn) muteBtn.innerHTML = bgmAudio.muted ? "<span>UNMUTE</span>" : "<span>MUTE</span>";
            }
        });
    }

    /* ==========================================================================
       2. Mobile Burger Navigation
       ========================================================================== */
    const burgerBtn = document.getElementById("pixel-burger-btn");
    const navMenu = document.getElementById("nav-menu");
    const navBackdrop = document.getElementById("pixel-nav-backdrop");

    if (burgerBtn && navMenu) {
        burgerBtn.addEventListener("click", () => {
            const isOpen = navMenu.classList.toggle("open");
            burgerBtn.classList.toggle("active", isOpen);
            burgerBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
            if (navBackdrop) navBackdrop.classList.toggle("active", isOpen);
        });

        if (navBackdrop) {
            navBackdrop.addEventListener("click", () => {
                navMenu.classList.remove("open");
                burgerBtn.classList.remove("active");
                burgerBtn.setAttribute("aria-expanded", "false");
                navBackdrop.classList.remove("active");
            });
        }
    }

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
