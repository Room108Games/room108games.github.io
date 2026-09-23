/**
 * Wicked West - Interactive Script
 * Features: Randomly Spawned Planetary Drifting Sprites (Draggable & Rotating),
 * Theme Toggle, Ambient Canvas, OST Player.
 * Developed by Burstyn Santillo // Published by Room108
 */

(function () {
    'use strict';

    // ==========================================================================
    // 1. Theme Management (Light / Dark)
    // ==========================================================================

    const state = {
        theme: localStorage.getItem('room108_theme') || 'light',
        sfxEnabled: localStorage.getItem('room108_sfx') !== 'false',
        musicPlaying: false
    };

    const themeBtn = document.getElementById('pixel-theme-btn');
    const navLogo = document.getElementById('nav-logo');
    const footerLogo = document.getElementById('footer-logo');

    function applyTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('room108_theme', theme);

        if (themeBtn) {
            const span = themeBtn.querySelector('span') || themeBtn;
            span.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
        }

        const logoSrc = theme === 'dark' ? 'assets/logo-white-cropped.svg' : 'assets/logo-black-cropped.svg';
        if (navLogo) navLogo.src = logoSrc;
        if (footerLogo) footerLogo.src = logoSrc;
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            applyTheme(state.theme === 'dark' ? 'light' : 'dark');
        });
    }

    applyTheme(state.theme);

    // ==========================================================================
    // 2. SFX Toggle
    // ==========================================================================

    const audioBtn = document.getElementById('pixel-audio-btn');

    function updateAudioButton() {
        if (audioBtn) {
            const span = audioBtn.querySelector('span') || audioBtn;
            span.textContent = state.sfxEnabled ? 'SFX: ON' : 'SFX: OFF';
            audioBtn.style.opacity = state.sfxEnabled ? '1' : '0.7';
        }
    }

    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            state.sfxEnabled = !state.sfxEnabled;
            localStorage.setItem('room108_sfx', state.sfxEnabled.toString());
            updateAudioButton();
        });
    }
    updateAudioButton();

    // ==========================================================================
    // 2b. Mobile Burger Navigation Menu
    // ==========================================================================

    const burgerBtn = document.getElementById('pixel-burger-btn');
    const navMenu = document.getElementById('nav-menu');
    const navBackdrop = document.getElementById('pixel-nav-backdrop');

    function openMobileMenu() {
        if (!burgerBtn || !navMenu) return;
        burgerBtn.classList.add('is-active');
        burgerBtn.setAttribute('aria-expanded', 'true');
        navMenu.classList.add('is-open');
        if (navBackdrop) navBackdrop.classList.add('is-active');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileMenu() {
        if (!burgerBtn || !navMenu) return;
        burgerBtn.classList.remove('is-active');
        burgerBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
        if (navBackdrop) navBackdrop.classList.remove('is-active');
        document.body.style.overflow = '';
    }

    function toggleMobileMenu() {
        if (navMenu && navMenu.classList.contains('is-open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    if (burgerBtn) {
        burgerBtn.addEventListener('click', toggleMobileMenu);
    }

    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeMobileMenu);
    }

    if (navMenu) {
        navMenu.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('is-open')) {
            closeMobileMenu();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navMenu && navMenu.classList.contains('is-open')) {
            closeMobileMenu();
        }
    }, { passive: true });

    // ==========================================================================
    // 3. Audio & Sound Effects Engine
    // ==========================================================================

    const sfxShoot = new Audio('assets/wicked-west/audio/shoot_revolver.wav');
    sfxShoot.volume = 0.5;

    const sfxHurt = new Audio('assets/wicked-west/audio/hurt.wav');
    sfxHurt.volume = 0.7;

    const sfxChest = new Audio('assets/wicked-west/audio/chest_open.wav');
    sfxChest.volume = 0.75;

    const sfxExplosion = new Audio('assets/wicked-west/audio/explosion.wav');
    sfxExplosion.volume = 0.65;

    const sfxPickup = new Audio('assets/wicked-west/audio/pickup.wav');
    sfxPickup.volume = 0.7;

    function playSfx(audioObj) {
        if (!state.sfxEnabled || !audioObj) return;
        try {
            const clone = audioObj.cloneNode();
            clone.volume = audioObj.volume;
            clone.play().catch(() => {});
        } catch (e) {}
    }

    // Universal Click SFX (Revolver Shot with 80ms throttle guard)
    let lastShootTime = 0;
    function playUniversalShoot() {
        if (!state.sfxEnabled) return;
        const now = performance.now();
        if (now - lastShootTime < 80) return;
        lastShootTime = now;
        playSfx(sfxShoot);
    }

    window.addEventListener('pointerdown', (e) => {
        // Sprite interactions handle their own custom sound effects
        if (e.target && e.target.closest && e.target.closest('.ww-draggable-sprite')) {
            return;
        }
        // Exclude volume sliders to prevent gunshots on slider dragging
        if (e.target && (e.target.id === 'ww-audio-vol' || e.target.type === 'range')) {
            return;
        }
        playUniversalShoot();
    }, { capture: true, passive: true });

    // ==========================================================================
    // 3b. Saloon Jukebox Soundtrack Deck (Empty Tavern)
    // ==========================================================================

    const ostAudio = new Audio('assets/wicked-west/audio/EmptyTavern.mp3');
    ostAudio.loop = true;
    ostAudio.volume = 0.5;

    const jukeboxDeck = document.getElementById('ww-jukebox-deck');
    const playBtn = document.getElementById('ww-audio-play-btn');
    const muteBtn = document.getElementById('ww-audio-mute-btn');
    const volSlider = document.getElementById('ww-audio-vol');
    const statusLabel = document.getElementById('ww-jukebox-status');

    let isMuted = false;
    let previousVol = 0.5;

    function updateJukeboxUI() {
        if (!jukeboxDeck) return;
        if (state.musicPlaying) {
            jukeboxDeck.classList.add('is-playing');
            if (playBtn) playBtn.querySelector('span').textContent = 'PAUSE OST';
            if (statusLabel) statusLabel.textContent = 'PLAYING: EMPTY TAVERN';
        } else {
            jukeboxDeck.classList.remove('is-playing');
            if (playBtn) playBtn.querySelector('span').textContent = 'PLAY OST';
            if (statusLabel) statusLabel.textContent = 'FRONTIER BROADCAST: PAUSED';
        }
    }

    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (state.musicPlaying) {
                ostAudio.pause();
                state.musicPlaying = false;
                updateJukeboxUI();
            } else {
                ostAudio.play().then(() => {
                    state.musicPlaying = true;
                    updateJukeboxUI();
                }).catch(() => {});
            }
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                previousVol = ostAudio.volume;
                ostAudio.volume = 0;
                if (volSlider) volSlider.value = 0;
                muteBtn.querySelector('span').textContent = 'UNMUTE';
            } else {
                ostAudio.volume = previousVol || 0.5;
                if (volSlider) volSlider.value = ostAudio.volume;
                muteBtn.querySelector('span').textContent = 'MUTE';
            }
        });
    }

    if (volSlider) {
        volSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            ostAudio.volume = val;
            if (val === 0) {
                isMuted = true;
                if (muteBtn) muteBtn.querySelector('span').textContent = 'UNMUTE';
            } else {
                isMuted = false;
                previousVol = val;
                if (muteBtn) muteBtn.querySelector('span').textContent = 'MUTE';
            }
        });
    }

    // ==========================================================================
    // 4. Random Planetary Drifting & Draggable Sprites Engine
    // ==========================================================================

    const SPRITE_POOL = [
        { name: 'Cowboy Cody', src: 'assets/wicked-west/sprites/Player.png', type: 'character', quotes: ["Don't shoot the barkeep!", "Just tending the taps, partner!", "Time to brew another batch!"] },
        { name: 'Gianni Jones', src: 'assets/wicked-west/npcs/GianniJones.png', type: 'character', quotes: ["Watch your aim, partner!", "Got any fresh beer ready?", "Careful with that trigger!"] },
        { name: 'J. Enriquez', src: 'assets/wicked-west/npcs/JEnriquez.png', type: 'character', quotes: ["Order at the bar, stranger!", "Keep your weapons holstered!", "Fairytale monsters at the gates!"] },
        { name: 'Cactus Jumper', src: 'assets/wicked-west/enemies/CactusJumper.png', type: 'enemy' },
        { name: 'Sand Crab', src: 'assets/wicked-west/enemies/CrabSprite.png', type: 'enemy' },
        { name: 'Tornado Snake', src: 'assets/wicked-west/enemies/TornadoSnake.png', type: 'enemy' },
        { name: 'PowerUp Chest', src: 'assets/wicked-west/items/PowerUpChest.png', type: 'chest', loot: 'POWER-UP UNLOCKED!' },
        { name: 'Common Chest', src: 'assets/wicked-west/items/CommonChest.png', type: 'chest', loot: '+50 BEER ESSENCE!' },
        { name: 'Desert Cactus 1', src: 'assets/wicked-west/env/Cactus1.png', type: 'env' },
        { name: 'Desert Cactus 2', src: 'assets/wicked-west/env/Cactus2.png', type: 'env' },
        { name: 'Basic Revolver', src: 'assets/wicked-west/weapons/BasicRevolver.png', type: 'weapon' },
        { name: 'Basic Shotgun', src: 'assets/wicked-west/weapons/BasicShotgun.png', type: 'weapon' }
    ];

    function triggerSpriteInteraction(sprite) {
        if (!state.sfxEnabled) return;
        const type = sprite.type;
        const el = sprite.el;

        if (type === 'character') {
            playSfx(sfxHurt);
            const existing = el.querySelector('.ww-dialogue-bubble');
            if (existing) existing.remove();
            const bubble = document.createElement('div');
            bubble.className = 'ww-dialogue-bubble';
            const quotes = sprite.quotes || ["Howdy, partner!"];
            bubble.textContent = quotes[Math.floor(Math.random() * quotes.length)];
            el.appendChild(bubble);
            setTimeout(() => bubble.remove(), 1800);
        } else if (type === 'enemy') {
            playSfx(sfxExplosion);
            el.classList.add('ww-hit-flash');
            setTimeout(() => el.classList.remove('ww-hit-flash'), 300);
        } else if (type === 'chest') {
            playSfx(sfxChest);
            const existing = el.querySelector('.ww-loot-toast');
            if (existing) existing.remove();
            const toast = document.createElement('div');
            toast.className = 'ww-loot-toast';
            toast.textContent = sprite.loot || '+50 BEER ESSENCE!';
            el.appendChild(toast);
            setTimeout(() => toast.remove(), 1500);
        } else {
            playSfx(sfxPickup);
        }
    }

    const container = document.getElementById('sprites-container');
    const parentSection = document.querySelector('.ww-main-section') || document.body;

    function getBounds() {
        return {
            width: parentSection.clientWidth || window.innerWidth,
            height: Math.max(parentSection.clientHeight || 0, window.innerHeight || 0, 700)
        };
    }

    const sprites = [];
    let activeDrag = null;
    const isMobile = window.innerWidth <= 768 || window.matchMedia('(max-width: 768px)').matches;
    const isSmallMobile = window.innerWidth <= 480;

    // Summon floating planetary sprites (smaller count and size on mobile devices)
    if (container) {
        // Shuffle pool
        const shuffled = [...SPRITE_POOL].sort(() => Math.random() - 0.5);

        // Pick random unique sprites: 3 to 4 on mobile, 5 to 7 on desktop
        const countToSpawn = isMobile
            ? Math.min(3 + Math.floor(Math.random() * 2), shuffled.length)
            : Math.min(Math.floor(Math.random() * 3) + 5, shuffled.length);
        const selected = shuffled.slice(0, countToSpawn);

        const bounds = getBounds();
        const spriteSize = isSmallMobile ? 68 : (isMobile ? 85 : 180);
        const placedPositions = [];

        function getBlankSpaceSpawnPosition(index) {
            const parentRect = parentSection.getBoundingClientRect();
            const introContainer = document.querySelector('.ww-intro-container');

            const minPadding = isMobile ? 12 : 20;
            const maxX = Math.max(minPadding, bounds.width - spriteSize - minPadding);
            const maxY = Math.max(minPadding, bounds.height - spriteSize - minPadding);

            if (isMobile) {
                // Guaranteed spaced mobile slots: distributed vertically and horizontally
                // Alternating Upper Right, Upper Left, Lower Right, Lower Left
                // All completely clear of the central story text card
                const mobileSlots = [
                    // Slot 0: Upper Right (beside title / badges)
                    {
                        x: Math.max(minPadding, bounds.width - spriteSize - 16 + (Math.random() * 12 - 6)),
                        y: Math.max(20, bounds.height * 0.14 + (Math.random() * 20 - 10))
                    },
                    // Slot 1: Upper Left (beside badges / top title)
                    {
                        x: Math.max(minPadding, 16 + (Math.random() * 16)),
                        y: Math.max(20, bounds.height * 0.16 + (Math.random() * 20 - 10))
                    },
                    // Slot 2: Lower Right (below story card, beside feature tags & action buttons)
                    {
                        x: Math.max(minPadding, bounds.width - spriteSize - 18 + (Math.random() * 12 - 6)),
                        y: Math.max(180, bounds.height * 0.78 + (Math.random() * 25 - 12))
                    },
                    // Slot 3: Lower Left (below story card, near bottom action buttons)
                    {
                        x: Math.max(minPadding, 16 + (Math.random() * 16)),
                        y: Math.max(180, bounds.height * 0.84 + (Math.random() * 25 - 12))
                    }
                ];

                const slot = mobileSlots[index % mobileSlots.length];
                const clampedX = Math.max(minPadding, Math.min(maxX, slot.x));
                const clampedY = Math.max(minPadding, Math.min(maxY, slot.y));
                return { x: clampedX, y: clampedY };
            }

            // Desktop Placement (Wide Flanks around center card)
            const buffer = 32;
            const occupiedBoxes = [];
            const occupiedElements = [
                document.querySelector('.ww-badge-row'),
                document.querySelector('.ww-title-container'),
                document.querySelector('.ww-tagline'),
                document.querySelector('.ww-intro-card'),
                document.querySelector('.ww-tags-row'),
                document.querySelector('.ww-actions-row'),
                document.querySelector('.pixel-navbar')
            ].filter(Boolean);

            if (introContainer && bounds.width >= 1150) {
                const ir = introContainer.getBoundingClientRect();
                occupiedBoxes.push({
                    left: ir.left - parentRect.left - buffer,
                    right: ir.right - parentRect.left + buffer,
                    top: ir.top - parentRect.top - buffer,
                    bottom: ir.bottom - parentRect.top + buffer
                });
            } else {
                occupiedElements.forEach(el => {
                    const r = el.getBoundingClientRect();
                    occupiedBoxes.push({
                        left: r.left - parentRect.left - buffer,
                        right: r.right - parentRect.left + buffer,
                        top: r.top - parentRect.top - buffer,
                        bottom: r.bottom - parentRect.top + buffer
                    });
                });
            }

            function overlapsAnyOccupied(candBox) {
                return occupiedBoxes.some(occ => !(
                    candBox.right < occ.left ||
                    candBox.left > occ.right ||
                    candBox.bottom < occ.top ||
                    candBox.top > occ.bottom
                ));
            }

            const regions = [];
            if (introContainer) {
                const ir = introContainer.getBoundingClientRect();
                const introLeft = ir.left - parentRect.left;
                const introRight = ir.right - parentRect.left;
                const introTop = ir.top - parentRect.top;
                const introBottom = ir.bottom - parentRect.top;

                // Left Flank
                const leftMaxX = (introLeft - buffer) - spriteSize;
                if (leftMaxX >= minPadding) {
                    regions.push({
                        name: 'left',
                        minX: minPadding,
                        maxX: leftMaxX,
                        minY: minPadding,
                        maxY: maxY
                    });
                }

                // Right Flank
                const rightMinX = introRight + buffer;
                if (maxX >= rightMinX) {
                    regions.push({
                        name: 'right',
                        minX: rightMinX,
                        maxX: maxX,
                        minY: minPadding,
                        maxY: maxY
                    });
                }

                // Top Space
                const topMaxY = (introTop - buffer) - spriteSize;
                if (topMaxY >= minPadding) {
                    regions.push({
                        name: 'top',
                        minX: minPadding,
                        maxX: maxX,
                        minY: minPadding,
                        maxY: topMaxY
                    });
                }

                // Bottom Space
                const bottomMinY = introBottom + buffer;
                if (maxY >= bottomMinY) {
                    regions.push({
                        name: 'bottom',
                        minX: minPadding,
                        maxX: maxX,
                        minY: bottomMinY,
                        maxY: maxY
                    });
                }
            }

            const desktopSlots = [
                { x: 35, y: bounds.height * 0.22 },
                { x: Math.max(35, bounds.width - spriteSize - 45), y: bounds.height * 0.26 },
                { x: 50, y: bounds.height * 0.62 },
                { x: Math.max(35, bounds.width - spriteSize - 55), y: bounds.height * 0.66 },
                { x: Math.max(35, bounds.width * 0.5 - spriteSize / 2), y: 35 },
                { x: Math.max(35, bounds.width * 0.5 - spriteSize / 2), y: Math.max(60, bounds.height - spriteSize - 40) }
            ];
            const fallbackSlot = desktopSlots[index % desktopSlots.length];
            let fallbackX = Math.max(minPadding, Math.min(maxX, fallbackSlot.x));
            let fallbackY = Math.max(minPadding, Math.min(maxY, fallbackSlot.y));
            let maxMinDist = -1;

            for (let attempt = 0; attempt < 160; attempt++) {
                let cx, cy;

                if (regions.length > 0 && attempt < 100) {
                    const regIdx = (index + attempt) % regions.length;
                    const reg = regions[regIdx];
                    cx = reg.minX + Math.random() * (reg.maxX - reg.minX);
                    cy = reg.minY + Math.random() * (reg.maxY - reg.minY);
                } else {
                    cx = minPadding + Math.random() * Math.max(1, maxX - minPadding);
                    cy = minPadding + Math.random() * Math.max(1, maxY - minPadding);
                }

                const candBox = {
                    left: cx,
                    right: cx + spriteSize,
                    top: cy,
                    bottom: cy + spriteSize
                };

                if (overlapsAnyOccupied(candBox)) {
                    continue;
                }

                const candCenterX = cx + spriteSize / 2;
                const candCenterY = cy + spriteSize / 2;
                let closestDist = Infinity;

                for (const p of placedPositions) {
                    const d = Math.hypot(candCenterX - p.cx, candCenterY - p.cy);
                    if (d < closestDist) {
                        closestDist = d;
                    }
                }

                const requiredDist = attempt < 40 ? 150 : (attempt < 80 ? 100 : 60);
                if (closestDist < requiredDist) {
                    if (closestDist > maxMinDist) {
                        maxMinDist = closestDist;
                        fallbackX = cx;
                        fallbackY = cy;
                    }
                    continue;
                }

                return { x: cx, y: cy };
            }

            return { x: fallbackX, y: fallbackY };
        }

        selected.forEach((item, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'ww-draggable-sprite';
            wrapper.setAttribute('data-target-type', item.type);

            const img = document.createElement('img');
            img.className = 'pixel-art';
            img.src = item.src;
            img.alt = item.name;

            // Safe fallback if user deletes a sprite file
            img.onerror = () => {
                wrapper.remove();
                const idx = sprites.indexOf(spriteObj);
                if (idx !== -1) sprites.splice(idx, 1);
            };

            wrapper.appendChild(img);
            container.appendChild(wrapper);

            // Spawn exclusively in blank space outside center content
            const spawnPos = getBlankSpaceSpawnPosition(index);
            const spawnX = spawnPos.x;
            const spawnY = spawnPos.y;
            placedPositions.push({
                x: spawnX,
                y: spawnY,
                cx: spawnX + spriteSize / 2,
                cy: spawnY + spriteSize / 2
            });

            // Random planetary drift velocity vector
            const angle = Math.random() * Math.PI * 2;
            const speed = (isMobile ? 0.15 : 0.2) + Math.random() * (isMobile ? 0.25 : 0.35); // gentle floating speed
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            // Random initial rotation and slow planetary spin rate
            const rotation = Math.random() * 360;
            const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.12 + Math.random() * 0.22); // slow majestic rotation

            // Apply initial position immediately so element never sits at (0, 0)
            wrapper.style.transform = `translate3d(${spawnX.toFixed(1)}px, ${spawnY.toFixed(1)}px, 0) rotate(${rotation.toFixed(1)}deg)`;

            const spriteObj = {
                id: index,
                el: wrapper,
                type: item.type,
                quotes: item.quotes,
                loot: item.loot,
                size: spriteSize,
                x: spawnX,
                y: spawnY,
                vx: vx,
                vy: vy,
                rotation: rotation,
                rotSpeed: rotSpeed,
                bobPhase: Math.random() * Math.PI * 2,
                bobAmp: isMobile ? (2 + Math.random() * 2.5) : (4 + Math.random() * 5),
                isDragging: false,
                dragStartX: 0,
                dragStartY: 0,
                spriteStartX: 0,
                spriteStartY: 0,
                lastX: 0,
                lastY: 0,
                lastTime: 0
            };

            sprites.push(spriteObj);

            // Pointer down handler
            function onPointerDown(e) {
                e.preventDefault();
                const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

                activeDrag = spriteObj;
                spriteObj.isDragging = true;
                spriteObj.dragStartX = clientX;
                spriteObj.dragStartY = clientY;
                spriteObj.spriteStartX = spriteObj.x;
                spriteObj.spriteStartY = spriteObj.y;
                spriteObj.lastX = clientX;
                spriteObj.lastY = clientY;
                spriteObj.lastTime = performance.now();

                wrapper.classList.add('is-dragging');
            }

            wrapper.addEventListener('mousedown', onPointerDown);
            wrapper.addEventListener('touchstart', onPointerDown, { passive: false });
        });
    }

    // Window drag handlers
    function onPointerMove(e) {
        if (!activeDrag) return;
        e.preventDefault();

        const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

        const dx = clientX - activeDrag.dragStartX;
        const dy = clientY - activeDrag.dragStartY;

        activeDrag.x = activeDrag.spriteStartX + dx;
        activeDrag.y = activeDrag.spriteStartY + dy;

        // Fling momentum calculation
        const now = performance.now();
        const dt = Math.max(1, now - activeDrag.lastTime);
        const vx = ((clientX - activeDrag.lastX) / dt) * 16;
        const vy = ((clientY - activeDrag.lastY) / dt) * 16;

        const maxSpeed = 3.0;
        activeDrag.vx = Math.max(-maxSpeed, Math.min(maxSpeed, vx));
        activeDrag.vy = Math.max(-maxSpeed, Math.min(maxSpeed, vy));

        activeDrag.lastX = clientX;
        activeDrag.lastY = clientY;
        activeDrag.lastTime = now;

        // Render immediately with current rotation
        activeDrag.el.style.transform = `translate3d(${activeDrag.x.toFixed(1)}px, ${activeDrag.y.toFixed(1)}px, 0) rotate(${activeDrag.rotation.toFixed(1)}deg)`;
    }

    function onPointerUp(e) {
        if (!activeDrag) return;

        const clientX = e && e.clientX !== undefined ? e.clientX : (e && e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientX : activeDrag.lastX);
        const clientY = e && e.clientY !== undefined ? e.clientY : (e && e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : activeDrag.lastY);

        const dist = Math.hypot(clientX - activeDrag.dragStartX, clientY - activeDrag.dragStartY);
        if (dist < 8) {
            triggerSpriteInteraction(activeDrag);
        }

        activeDrag.isDragging = false;
        activeDrag.el.classList.remove('is-dragging');

        // Minimum drift velocity on release
        if (Math.abs(activeDrag.vx) < 0.2) {
            activeDrag.vx = (Math.random() > 0.5 ? 1 : -1) * 0.4;
        }
        if (Math.abs(activeDrag.vy) < 0.2) {
            activeDrag.vy = (Math.random() > 0.5 ? 1 : -1) * 0.35;
        }

        activeDrag = null;
    }

    // --- Planetary Floating & Rotating Physics Loop ---
    let animTime = 0;

    function animatePlanetarySprites() {
        if (sprites.length === 0) return;
        animTime += 0.02;
        const bounds = getBounds();

        for (let i = 0; i < sprites.length; i++) {
            const s = sprites[i];

            // Always slowly rotate like a floating planet!
            s.rotation = (s.rotation + s.rotSpeed) % 360;

            if (!s.isDragging) {
                s.x += s.vx;
                s.y += s.vy;

                const spritePadding = (s.size || 180) + 12;
                const minX = 6;
                const maxX = Math.max(minX + 30, bounds.width - spritePadding);
                const minY = 6;
                const maxY = Math.max(minY + 30, bounds.height - spritePadding);

                // Gentle planetary bounce off edges
                if (s.x <= minX) {
                    s.x = minX;
                    s.vx = Math.abs(s.vx);
                } else if (s.x >= maxX) {
                    s.x = maxX;
                    s.vx = -Math.abs(s.vx);
                }

                if (s.y <= minY) {
                    s.y = minY;
                    s.vy = Math.abs(s.vy);
                } else if (s.y >= maxY) {
                    s.y = maxY;
                    s.vy = -Math.abs(s.vy);
                }

                // Orbital sine bob
                const bob = Math.sin(animTime * 1.4 + s.bobPhase) * s.bobAmp;
                s.el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${(s.y + bob).toFixed(1)}px, 0) rotate(${s.rotation.toFixed(1)}deg)`;
            }
        }

        requestAnimationFrame(animatePlanetarySprites);
    }

    // Only attach drag listeners and start physics loop if sprites exist (Desktop)
    if (sprites.length > 0) {
        window.addEventListener('mousemove', onPointerMove, { passive: false });
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);
        window.addEventListener('blur', onPointerUp);

        requestAnimationFrame(animatePlanetarySprites);
    }

    // ==========================================================================
    // 5. Ambient Floating Pixel Dust Canvas
    // ==========================================================================

    const canvas = document.getElementById('pixel-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = (canvas.width = canvas.parentElement.offsetWidth || window.innerWidth);
        let height = (canvas.height = canvas.parentElement.offsetHeight || 600);

        function resize() {
            if (!canvas.parentElement) return;
            width = canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
            height = canvas.height = canvas.parentElement.offsetHeight || 600;
        }
        window.addEventListener('resize', resize);

        const particles = [];
        const count = 30;
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() > 0.6 ? 5 : 3,
                speedX: (Math.random() - 0.5) * 0.4 - 0.2,
                speedY: (Math.random() - 0.5) * 0.4,
                color: Math.random() > 0.5 ? '#8CC63F' : '#0B9444',
                opacity: Math.random() * 0.4 + 0.15
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
            }
            ctx.globalAlpha = 1.0;
            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }
})();
