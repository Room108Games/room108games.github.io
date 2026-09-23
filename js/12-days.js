/**
 * 12 Days - Interactive Presidential Desk & Audio Controller
 * Handles custom pen clicking SFX, title audio streaming, dilemma signings,
 * political balance meters, and screenshot lightbox modal.
 */

document.addEventListener("DOMContentLoaded", () => {
    /* ==========================================================================
       1. Audio SFX & Music Deck
       ========================================================================== */
    const clickAudio = new Audio("assets/12-days/audio/click.wav");
    clickAudio.preload = "auto";
    clickAudio.volume = 0.4;

    const signingAudio = new Audio("assets/12-days/audio/signing.wav");
    signingAudio.preload = "auto";
    signingAudio.volume = 0.6;

    const partyUpAudio = new Audio("assets/12-days/audio/party_up.wav");
    partyUpAudio.volume = 0.5;
    const partyDownAudio = new Audio("assets/12-days/audio/party_down.wav");
    partyDownAudio.volume = 0.5;
    const peopleUpAudio = new Audio("assets/12-days/audio/people_up.wav");
    peopleUpAudio.volume = 0.5;
    const peopleDownAudio = new Audio("assets/12-days/audio/people_down.wav");
    peopleDownAudio.volume = 0.5;

    let soundEnabled = localStorage.getItem("room108_sound") !== "false";
    const bgmAudio = document.getElementById("days-bgm");
    const audioDeck = document.getElementById("days-audio-deck");
    const playBtn = document.getElementById("days-audio-play-btn");
    const muteBtn = document.getElementById("days-audio-mute-btn");
    const volSlider = document.getElementById("days-audio-vol");
    const navAudioBtn = document.getElementById("pixel-audio-btn");

    function playClickSfx() {
        if (!soundEnabled) return;
        try {
            clickAudio.currentTime = 0;
            clickAudio.play().catch(() => {});
        } catch (e) {}
    }

    function playSigningSfx() {
        if (!soundEnabled) return;
        try {
            signingAudio.currentTime = 0;
            signingAudio.play().catch(() => {});
        } catch (e) {}
    }

    // Attach click sound to interactive elements
    document.addEventListener("click", (e) => {
        const target = e.target.closest("button, a, input, select, .clickable, .dossier-tab, .decree-choice-card");
        if (target) {
            playClickSfx();
        }
    });

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
       2. The Presidential Crisis Desk (Interactive Dilemmas & Meters)
       ========================================================================== */
    const crisisDaysData = [
        {
            dayNumber: 1,
            title: "DAY 01: BORDER ARTILLERY MOBILIZATION",
            subject: "DEFENSE DIRECTIVE // SOLONIAN NORTHERN SECTOR",
            brief: "Military intelligence confirms troop buildup across the Solonian border river. Party hawks led by General Vance insist that Navros must position heavy artillery regiments right against the ceasefire perimeter before Solonia fortifies.",
            choiceA: {
                title: "EXECUTIVE ORDER 108-A: FORWARD ARTILLERY",
                desc: "Deploy 3 artillery divisions to border trenches. Signal unwavering military strength to party leadership.",
                partyDelta: +20,
                peopleDelta: -15,
                stamp: "blood"
            },
            choiceB: {
                title: "EXECUTIVE ORDER 108-B: DIPLOMATIC ENVOY",
                desc: "Hold regiments in regional barracks and dispatch an urgent de-escalation envoy to Solonia.",
                partyDelta: -20,
                peopleDelta: +20,
                stamp: "normal"
            }
        },
        {
            dayNumber: 4,
            title: "DAY 04: THE REFUGEE BLOCKADE",
            subject: "HUMANITARIAN CRISIS // WESTERN CROSSING 7",
            brief: "Thousands of Solonian civilian families are fleeing starvation and violence, amassing at the western crossing. Party hardliners demand barbed-wire barricades and armed warning fire to prevent 'demographic subversion'.",
            choiceA: {
                title: "EXECUTIVE ORDER 108-C: CLOSE THE BORDER",
                desc: "Deploy armored border patrol. Enforce complete exclusion of Solonian refugees with live munitions.",
                partyDelta: +15,
                peopleDelta: -25,
                stamp: "blood"
            },
            choiceB: {
                title: "EXECUTIVE ORDER 108-D: HUMANITARIAN CORRIDOR",
                desc: "Open emergency processing stations and distribute national grain reserves to refugees.",
                partyDelta: -25,
                peopleDelta: +25,
                stamp: "normal"
            }
        },
        {
            dayNumber: 8,
            title: "DAY 08: THE CAPITAL GENERAL STRIKE",
            subject: "INTERNAL SECURITY // NAVROS CIVIC SQUARE",
            brief: "Anti-war student unions, trade guilds, and war veterans assemble in the capital plaza demanding an immediate end to militarization. The Minister of State urges the declaration of Martial Law and mass detention of dissidents.",
            choiceA: {
                title: "EXECUTIVE ORDER 108-E: MARTIAL LAW & CURFEW",
                desc: "Send internal security tanks to clear the plaza. Impose night curfews and silence independent radio.",
                partyDelta: +25,
                peopleDelta: -30,
                stamp: "blood"
            },
            choiceB: {
                title: "EXECUTIVE ORDER 108-F: PRESIDENTIAL AUDIENCE",
                desc: "Walk out to the plaza without armed escort. Guarantee freedom of speech and promise to seek accord.",
                partyDelta: -30,
                peopleDelta: +25,
                stamp: "normal"
            }
        },
        {
            dayNumber: 12,
            title: "DAY 12: THE FINAL ULTIMATUM",
            subject: "SUPREME COMMAND // SOLONIAN CASUS BELLI",
            brief: "The 12th day has dawned. Solonia delivers an unconditional ultimatum demanding withdrawal of border claims within two hours. The War Cabinet places the Declaration of War on your desk. The pen is in your hand.",
            choiceA: {
                title: "EXECUTIVE ORDER 108-G: DECLARATION OF TOTAL WAR",
                desc: "Authorize immediate pre-emptive missile strikes and total mobilization of Navros.",
                partyDelta: +35,
                peopleDelta: -35,
                stamp: "blood"
            },
            choiceB: {
                title: "EXECUTIVE ORDER 108-H: SIGN PEACE ACCORD",
                desc: "Sign the neutral demilitarization treaty, defying party hawks and refusing to shed blood.",
                partyDelta: -35,
                peopleDelta: +35,
                stamp: "normal"
            }
        }
    ];

    let currentDayIndex = 0;
    const playerDecisions = [null, null, null, null]; // Track choice for each day: 'A' or 'B'

    const partyFill = document.getElementById("party-meter-fill");
    const partyVal = document.getElementById("party-meter-val");
    const peopleFill = document.getElementById("people-meter-fill");
    const peopleVal = document.getElementById("people-meter-val");

    const dayTabs = document.querySelectorAll(".dossier-tab");
    const docTitle = document.getElementById("dossier-day-title");
    const docSubject = document.getElementById("dossier-day-subject");
    const docBrief = document.getElementById("dossier-doc-brief");

    const choiceCardA = document.getElementById("decree-card-a");
    const choiceCardB = document.getElementById("decree-card-b");
    const outcomeDrawer = document.getElementById("crisis-outcome-drawer");
    const outcomeBadge = document.getElementById("outcome-badge-img");
    const outcomeTitle = document.getElementById("outcome-title-text");
    const outcomeSub = document.getElementById("outcome-sub-text");
    const outcomeDesc = document.getElementById("outcome-desc-text");
    const resetDeskBtn = document.getElementById("reset-crisis-btn");

    function calculateMeters() {
        let party = 50;
        let people = 50;

        playerDecisions.forEach((dec, idx) => {
            if (!dec) return;
            const day = crisisDaysData[idx];
            if (dec === "A") {
                party += day.choiceA.partyDelta;
                people += day.choiceA.peopleDelta;
            } else if (dec === "B") {
                party += day.choiceB.partyDelta;
                people += day.choiceB.peopleDelta;
            }
        });

        party = Math.max(5, Math.min(95, party));
        people = Math.max(5, Math.min(95, people));
        return { party, people };
    }

    function renderMeters() {
        const { party, people } = calculateMeters();
        if (partyFill && partyVal) {
            partyFill.style.width = `${party}%`;
            partyVal.textContent = `${party}%`;
        }
        if (peopleFill && peopleVal) {
            peopleFill.style.width = `${people}%`;
            peopleVal.textContent = `${people}%`;
        }
    }

    function renderCurrentDay() {
        const day = crisisDaysData[currentDayIndex];
        if (!day) return;

        // Update tabs
        dayTabs.forEach((tab, idx) => {
            tab.classList.toggle("active", idx === currentDayIndex);
            tab.classList.toggle("signed", playerDecisions[idx] !== null);
        });

        // Update document header & text
        if (docTitle) docTitle.textContent = day.title;
        if (docSubject) docSubject.textContent = day.subject;
        if (docBrief) docBrief.textContent = day.brief;

        // Choice A setup
        if (choiceCardA) {
            const titleEl = choiceCardA.querySelector(".decree-title");
            const descEl = choiceCardA.querySelector(".decree-desc");
            const impactEl = choiceCardA.querySelector(".decree-impact-row");
            const stampImg = choiceCardA.querySelector(".decree-stamp-applied");

            if (titleEl) titleEl.textContent = day.choiceA.title;
            if (descEl) descEl.textContent = day.choiceA.desc;
            if (impactEl) {
                impactEl.innerHTML = `<span>PARTY: +${day.choiceA.partyDelta}%</span> <span>PEOPLE: ${day.choiceA.peopleDelta}%</span>`;
            }
            if (stampImg) {
                stampImg.src = "assets/12-days/images/ui/signature-blood.png";
            }
            choiceCardA.classList.toggle("selected", playerDecisions[currentDayIndex] === "A");
        }

        // Choice B setup
        if (choiceCardB) {
            const titleEl = choiceCardB.querySelector(".decree-title");
            const descEl = choiceCardB.querySelector(".decree-desc");
            const impactEl = choiceCardB.querySelector(".decree-impact-row");
            const stampImg = choiceCardB.querySelector(".decree-stamp-applied");

            if (titleEl) titleEl.textContent = day.choiceB.title;
            if (descEl) descEl.textContent = day.choiceB.desc;
            if (impactEl) {
                impactEl.innerHTML = `<span>PARTY: ${day.choiceB.partyDelta}%</span> <span>PEOPLE: +${day.choiceB.peopleDelta}%</span>`;
            }
            if (stampImg) {
                stampImg.src = "assets/12-days/images/ui/signature-normal.png";
            }
            choiceCardB.classList.toggle("selected", playerDecisions[currentDayIndex] === "B");
        }

        checkOutcome();
    }

    function signDecree(choiceLetter) {
        playerDecisions[currentDayIndex] = choiceLetter;
        playSigningSfx();

        const day = crisisDaysData[currentDayIndex];
        const chosen = choiceLetter === "A" ? day.choiceA : day.choiceB;

        // Sound cues for meter shifts
        if (soundEnabled) {
            setTimeout(() => {
                if (chosen.partyDelta > 0) partyUpAudio.play().catch(() => {});
                else partyDownAudio.play().catch(() => {});
            }, 120);

            setTimeout(() => {
                if (chosen.peopleDelta > 0) peopleUpAudio.play().catch(() => {});
                else peopleDownAudio.play().catch(() => {});
            }, 300);
        }

        renderMeters();
        renderCurrentDay();

        // Advance to next unsigned day automatically
        const nextUnsigned = playerDecisions.findIndex((d) => d === null);
        if (nextUnsigned !== -1 && nextUnsigned !== currentDayIndex) {
            setTimeout(() => {
                currentDayIndex = nextUnsigned;
                renderCurrentDay();
            }, 600);
        }
    }

    function checkOutcome() {
        const allSigned = playerDecisions.every((d) => d !== null);
        if (!allSigned) {
            if (outcomeDrawer) outcomeDrawer.classList.remove("visible");
            return;
        }

        const { party, people } = calculateMeters();
        if (!outcomeDrawer) return;

        outcomeDrawer.classList.add("visible");

        if (party >= 65 && people <= 35) {
            // Military Dictatorship
            if (outcomeBadge) outcomeBadge.src = "assets/12-days/images/endings/agenda-win.png";
            if (outcomeTitle) outcomeTitle.textContent = "ENDING: TOTAL WAR REGIME";
            if (outcomeSub) outcomeSub.textContent = "THE PARTY'S TRIUMPH // CASUALTIES UNCOUNTED";
            if (outcomeDesc) outcomeDesc.textContent = "You bowed to the party hawks and led Navros into total war with Solonia. The borders burn, the youth are drafted to the front lines, and internal dissent has been crushed. Navros stands militarized and unyielding.";
        } else if (people >= 65 && party <= 35) {
            // Popular Peace Accord
            if (outcomeBadge) outcomeBadge.src = "assets/12-days/images/endings/peace.png";
            if (outcomeTitle) outcomeTitle.textContent = "ENDING: THE POPULAR ACCORD";
            if (outcomeSub) outcomeSub.textContent = "PEACE RESTORED // PARTY RETALIATION IMMINENT";
            if (outcomeDesc) outcomeDesc.textContent = "You defied your own political party to heed the cries of the people. Solonia signed the demilitarized accord, averting a bloodbath. Party hardliners brand you a traitor in the dark corridors, but the streets celebrate your courage.";
        } else if (party < 35 && people < 35) {
            // Nationwide Collapse
            if (outcomeBadge) outcomeBadge.src = "assets/12-days/images/endings/rebellion.png";
            if (outcomeTitle) outcomeTitle.textContent = "ENDING: CIVIL COLLAPSE";
            if (outcomeSub) outcomeSub.textContent = "CHAOS IN THE STREETS // PALACE SURROUNDED";
            if (outcomeDesc) outcomeDesc.textContent = "Uncertain compromises left both factions enraged. Street barricades rise outside the ministry while generals refuse presidential orders. The 12-day crisis has plunged Navros into civil fragmentation.";
        } else {
            // Fragile Standoff
            if (outcomeBadge) outcomeBadge.src = "assets/12-days/images/endings/blood.png";
            if (outcomeTitle) outcomeTitle.textContent = "ENDING: FRAGILE STALEMATE";
            if (outcomeSub) outcomeSub.textContent = "AN UNEASY CEASEFIRE // SHADOWS REMAIN";
            if (outcomeDesc) outcomeDesc.textContent = "Through delicate maneuvering, you held the hawks at bay without provoking an all-out civil strike. The border remains tense and guns are loaded, but for now, peace hangs by a single frayed thread.";
        }
    }

    // Attach day tab clicks
    dayTabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const dayNum = parseInt(tab.getAttribute("data-day"), 10);
            const targetIdx = crisisDaysData.findIndex((d) => d.dayNumber === dayNum);
            if (targetIdx !== -1) {
                currentDayIndex = targetIdx;
                renderCurrentDay();
            }
        });
    });

    // Attach signing buttons
    const signBtnA = document.getElementById("sign-btn-a");
    const signBtnB = document.getElementById("sign-btn-b");

    if (signBtnA) {
        signBtnA.addEventListener("click", (e) => {
            e.stopPropagation();
            signDecree("A");
        });
    }

    if (signBtnB) {
        signBtnB.addEventListener("click", (e) => {
            e.stopPropagation();
            signDecree("B");
        });
    }

    // Reset Desk
    if (resetDeskBtn) {
        resetDeskBtn.addEventListener("click", () => {
            for (let i = 0; i < playerDecisions.length; i++) {
                playerDecisions[i] = null;
            }
            currentDayIndex = 0;
            renderMeters();
            renderCurrentDay();
        });
    }

    // Initial render
    renderMeters();
    renderCurrentDay();

    /* ==========================================================================
       3. Lightbox Screenshot Modal
       ========================================================================== */
    const lightboxModal = document.getElementById("days-lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption-text");
    const lightboxClose = document.getElementById("lightbox-close-btn");
    const galleryThumbs = document.querySelectorAll(".gallery-thumb-card");

    galleryThumbs.forEach((thumb) => {
        thumb.addEventListener("click", () => {
            const fullSrc = thumb.getAttribute("data-full");
            const caption = thumb.getAttribute("data-caption");
            if (lightboxImg && lightboxCaption && lightboxModal) {
                lightboxImg.src = fullSrc;
                lightboxCaption.textContent = caption;
                lightboxModal.classList.add("active");
            }
        });
    });

    function closeLightbox() {
        if (lightboxModal) lightboxModal.classList.remove("active");
    }

    if (lightboxClose) {
        lightboxClose.addEventListener("click", closeLightbox);
    }

    if (lightboxModal) {
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
    });

    /* ==========================================================================
       4. Mobile Burger Navigation
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
       5. Theme Toggle
       ========================================================================== */
    const themeBtn = document.getElementById("pixel-theme-btn");
    const htmlEl = document.documentElement;

    function applyTheme(theme) {
        htmlEl.setAttribute("data-theme", theme);
        localStorage.setItem("room108_theme", theme);
        if (themeBtn) {
            themeBtn.innerHTML = `<span>${theme === "dark" ? "LIGHT" : "DARK"}</span>`;
        }
    }

    const savedTheme = localStorage.getItem("room108_theme") || "dark";
    applyTheme(savedTheme);

    if (themeBtn) {
        themeBtn.addEventListener("click", () => {
            const current = htmlEl.getAttribute("data-theme") || "dark";
            applyTheme(current === "dark" ? "light" : "dark");
        });
    }
});
