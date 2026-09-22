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
    // 3. Compact OST Player (Empty Tavern)
    // ==========================================================================

    const ostAudio = new Audio('assets/wicked-west/audio/EmptyTavern.mp3');
    ostAudio.loop = true;
    ostAudio.volume = 0.6;

    const ostBtn = document.getElementById('ww-ost-btn');
    if (ostBtn) {
        ostBtn.addEventListener('click', () => {
            const span = ostBtn.querySelector('span') || ostBtn;
            if (state.musicPlaying) {
                ostAudio.pause();
                state.musicPlaying = false;
                span.textContent = 'PLAY OST: EMPTY TAVERN';
            } else {
                ostAudio.play().then(() => {
                    state.musicPlaying = true;
                    span.textContent = 'PAUSE OST: EMPTY TAVERN';
                }).catch(() => {});
            }
        });
    }

    // ==========================================================================
    // 4. Random Planetary Drifting & Draggable Sprites Engine
    // ==========================================================================

    const SPRITE_POOL = [
        { name: 'Cowboy Cody', src: 'assets/wicked-west/sprites/Player.png' },
        { name: 'Gianni Jones', src: 'assets/wicked-west/npcs/GianniJones.png' },
        { name: 'J. Enriquez', src: 'assets/wicked-west/npcs/JEnriquez.png' },
        { name: 'Cactus Jumper', src: 'assets/wicked-west/enemies/CactusJumper.png' },
        { name: 'Sand Crab', src: 'assets/wicked-west/enemies/CrabSprite.png' },
        { name: 'Tornado Snake', src: 'assets/wicked-west/enemies/TornadoSnake.png' },
        { name: 'PowerUp Chest', src: 'assets/wicked-west/items/PowerUpChest.png' },
        { name: 'Common Chest', src: 'assets/wicked-west/items/CommonChest.png' },
        { name: 'Desert Cactus 1', src: 'assets/wicked-west/env/Cactus1.png' },
        { name: 'Desert Cactus 2', src: 'assets/wicked-west/env/Cactus2.png' },
        { name: 'Basic Revolver', src: 'assets/wicked-west/weapons/BasicRevolver.png' },
        { name: 'Basic Shotgun', src: 'assets/wicked-west/weapons/BasicShotgun.png' }
    ];

    const container = document.getElementById('sprites-container');
    const parentSection = document.querySelector('.ww-main-section') || document.body;

    function getBounds() {
        return {
            width: parentSection.clientWidth || window.innerWidth,
            height: parentSection.clientHeight || window.innerHeight
        };
    }

    const sprites = [];
    let activeDrag = null;

    if (container) {
        // Shuffle pool
        const shuffled = [...SPRITE_POOL].sort(() => Math.random() - 0.5);

        // Pick 5 to 7 random unique sprites on every load
        const countToSpawn = Math.min(Math.floor(Math.random() * 3) + 5, shuffled.length);
        const selected = shuffled.slice(0, countToSpawn);

        const bounds = getBounds();
        const spriteSize = window.innerWidth <= 640 ? 110 : 180;
        const placedPositions = [];

        function getBlankSpaceSpawnPosition(index) {
            const parentRect = parentSection.getBoundingClientRect();
            const introContainer = document.querySelector('.ww-intro-container');

            const buffer = 32; // Buffer clearance around content
            const minPadding = 15;
            const maxX = Math.max(minPadding, bounds.width - spriteSize - minPadding);
            const maxY = Math.max(minPadding, bounds.height - spriteSize - minPadding);

            // Bounding boxes that sprites must NEVER overlap at spawn time
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
                // Wide desktop: keep the entire center column completely clear
                const ir = introContainer.getBoundingClientRect();
                occupiedBoxes.push({
                    left: ir.left - parentRect.left - buffer,
                    right: ir.right - parentRect.left + buffer,
                    top: ir.top - parentRect.top - buffer,
                    bottom: ir.bottom - parentRect.top + buffer
                });
            } else {
                // Narrower screen: avoid each occupied UI element specifically
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

            // Identify primary blank space regions around the center content
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

            let fallbackX = minPadding;
            let fallbackY = minPadding;
            let maxMinDist = -1;

            for (let attempt = 0; attempt < 160; attempt++) {
                let cx, cy;

                if (regions.length > 0 && attempt < 100) {
                    // Alternate starting region across sprites (e.g. Sprite 0 -> Left, Sprite 1 -> Right, etc.)
                    const regIdx = (index + attempt) % regions.length;
                    const reg = regions[regIdx];
                    cx = reg.minX + Math.random() * (reg.maxX - reg.minX);
                    cy = reg.minY + Math.random() * (reg.maxY - reg.minY);
                } else {
                    // Fallback to random coordinate across canvas
                    cx = minPadding + Math.random() * Math.max(1, maxX - minPadding);
                    cy = minPadding + Math.random() * Math.max(1, maxY - minPadding);
                }

                const candBox = {
                    left: cx,
                    right: cx + spriteSize,
                    top: cy,
                    bottom: cy + spriteSize
                };

                // Must never overlap occupied content
                if (overlapsAnyOccupied(candBox)) {
                    continue;
                }

                // Maintain separation from already spawned sprites
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
            const speed = 0.2 + Math.random() * 0.35; // gentle, majestic floating speed
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;

            // Random initial rotation and slow planetary spin rate
            const rotation = Math.random() * 360;
            const rotSpeed = (Math.random() > 0.5 ? 1 : -1) * (0.12 + Math.random() * 0.22); // slow majestic rotation

            const spriteObj = {
                id: index,
                el: wrapper,
                x: spawnX,
                y: spawnY,
                vx: vx,
                vy: vy,
                rotation: rotation,
                rotSpeed: rotSpeed,
                bobPhase: Math.random() * Math.PI * 2,
                bobAmp: 4 + Math.random() * 5,
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
                const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
                const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

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

        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : 0);

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

    function onPointerUp() {
        if (!activeDrag) return;
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

    window.addEventListener('mousemove', onPointerMove, { passive: false });
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // --- Planetary Floating & Rotating Physics Loop ---
    let animTime = 0;

    function animatePlanetarySprites() {
        animTime += 0.02;
        const bounds = getBounds();

        for (let i = 0; i < sprites.length; i++) {
            const s = sprites[i];

            // Always slowly rotate like a floating planet!
            s.rotation = (s.rotation + s.rotSpeed) % 360;

            if (!s.isDragging) {
                s.x += s.vx;
                s.y += s.vy;

                const minX = 8;
                const maxX = Math.max(minX + 50, bounds.width - 210);
                const minY = 8;
                const maxY = Math.max(minY + 50, bounds.height - 210);

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

    requestAnimationFrame(animatePlanetarySprites);

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
