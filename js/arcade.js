/**
 * Room108 Games - Interactive Arcade Mini-Game: "Protocol 108"
 * A fast-paced cyber runner / avoider with Web Audio SFX & particles.
 */

class Room108Arcade {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext("2d");
        this.width = 800;
        this.height = 400;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Audio synthesizer via Web Audio API
        this.audioCtx = null;
        this.soundEnabled = true;

        // High score in localStorage
        this.highScore = parseInt(localStorage.getItem("room108_arcade_highscore") || "0", 10);
        this.updateHighScoreDisplay();

        // Game state
        this.state = "START"; // START, PLAYING, GAMEOVER, PAUSED
        this.score = 0;
        this.combo = 1;
        this.speed = 4;
        this.frame = 0;

        // Player probe
        this.player = {
            x: 100,
            y: 200,
            width: 28,
            height: 20,
            vy: 0,
            gravity: 0.38,
            lift: -7.5,
            trail: []
        };

        // Obstacles & Pickups
        this.obstacles = [];
        this.pickups = [];
        this.particles = [];

        // Controls
        this.keys = {};
        this.setupEventListeners();
        this.drawInitialScreen();
    }

    initAudio() {
        if (!this.audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioCtx = new AudioContext();
            }
        }
        if (this.audioCtx && this.audioCtx.state === "suspended") {
            this.audioCtx.resume();
        }
    }

    playTone(freq, type = "sine", duration = 0.1, gainVal = 0.15) {
        if (!this.soundEnabled || !this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

            gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            osc.start();
            osc.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            // Audio context safe fallback
        }
    }

    sfxJump() {
        this.playTone(320, "triangle", 0.12, 0.2);
    }

    sfxPickup() {
        if (!this.soundEnabled || !this.audioCtx) return;
        this.playTone(520, "sine", 0.08, 0.18);
        setTimeout(() => this.playTone(780, "sine", 0.12, 0.18), 70);
    }

    sfxHit() {
        if (!this.soundEnabled || !this.audioCtx) return;
        this.playTone(130, "sawtooth", 0.35, 0.3);
    }

    setupEventListeners() {
        window.addEventListener("keydown", (e) => {
            if (["Space", "ArrowUp", "KeyW"].includes(e.code)) {
                // If game is on screen, prevent scroll
                const rect = this.canvas.getBoundingClientRect();
                if (rect.top >= -100 && rect.bottom <= window.innerHeight + 100) {
                    e.preventDefault();
                }
                this.handleAction();
            }
        });

        this.canvas.addEventListener("pointerdown", (e) => {
            e.preventDefault();
            this.handleAction();
        });

        // Mobile on-screen button if present
        const jumpBtn = document.getElementById("arcade-touch-btn");
        if (jumpBtn) {
            jumpBtn.addEventListener("pointerdown", (e) => {
                e.preventDefault();
                this.handleAction();
            });
        }

        const startBtn = document.getElementById("arcade-start-btn");
        if (startBtn) {
            startBtn.addEventListener("click", () => {
                this.initAudio();
                this.startGame();
            });
        }

        const muteBtn = document.getElementById("arcade-mute-btn");
        if (muteBtn) {
            muteBtn.addEventListener("click", () => {
                this.soundEnabled = !this.soundEnabled;
                muteBtn.classList.toggle("muted", !this.soundEnabled);
                muteBtn.setAttribute("aria-label", this.soundEnabled ? "Mute Arcade SFX" : "Unmute Arcade SFX");
                muteBtn.innerHTML = this.soundEnabled
                    ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>'
                    : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
            });
        }
    }

    handleAction() {
        this.initAudio();
        if (this.state === "START" || this.state === "GAMEOVER") {
            this.startGame();
        } else if (this.state === "PLAYING") {
            this.player.vy = this.player.lift;
            this.sfxJump();
            // Emit propulsion particles
            for (let i = 0; i < 4; i++) {
                this.particles.push({
                    x: this.player.x,
                    y: this.player.y + this.player.height / 2,
                    vx: -Math.random() * 4 - 2,
                    vy: (Math.random() - 0.5) * 3,
                    size: Math.random() * 3 + 2,
                    color: "#6366f1",
                    alpha: 1,
                    decay: 0.05
                });
            }
        }
    }

    startGame() {
        this.state = "PLAYING";
        this.score = 0;
        this.combo = 1;
        this.speed = 4.2;
        this.frame = 0;

        this.player.x = 90;
        this.player.y = 190;
        this.player.vy = 0;
        this.player.trail = [];

        this.obstacles = [];
        this.pickups = [];
        this.particles = [];

        this.updateScoreDisplay();
        this.loop();
    }

    spawnObstacle() {
        const gap = 125;
        const minHeight = 40;
        const maxHeight = this.height - gap - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight)) + minHeight;

        this.obstacles.push({
            x: this.width,
            topHeight: topHeight,
            bottomY: topHeight + gap,
            width: 32,
            passed: false
        });

        // Chance to spawn an energy core inside the gap
        if (Math.random() > 0.3) {
            this.pickups.push({
                x: this.width + 16,
                y: topHeight + gap / 2,
                size: 9,
                collected: false
            });
        }
    }

    createExplosion(x, y, color = "#ef4444", count = 24) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 5 + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 4 + 2,
                color: color,
                alpha: 1,
                decay: Math.random() * 0.03 + 0.02
            });
        }
    }

    update() {
        this.frame++;

        // Speed ramps slowly
        if (this.frame % 300 === 0 && this.speed < 8.5) {
            this.speed += 0.3;
        }

        // Apply gravity
        this.player.vy += this.player.gravity;
        this.player.y += this.player.vy;

        // Player trail
        if (this.frame % 3 === 0) {
            this.player.trail.push({ x: this.player.x, y: this.player.y + this.player.height / 2 });
            if (this.player.trail.length > 8) this.player.trail.shift();
        }

        // Screen boundary collision
        if (this.player.y < 0) {
            this.player.y = 0;
            this.player.vy = 0;
        }
        if (this.player.y + this.player.height > this.height) {
            this.gameOver();
            return;
        }

        // Spawn obstacles
        if (this.frame % 95 === 0) {
            this.spawnObstacle();
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.x -= this.speed;

            // Player hitbox check
            const px = this.player.x + 4;
            const py = this.player.y + 4;
            const pw = this.player.width - 8;
            const ph = this.player.height - 8;

            // Collision with top pillar
            if (px + pw > obs.x && px < obs.x + obs.width && py < obs.topHeight) {
                this.gameOver();
                return;
            }

            // Collision with bottom pillar
            if (px + pw > obs.x && px < obs.x + obs.width && py + ph > obs.bottomY) {
                this.gameOver();
                return;
            }

            // Passed score
            if (!obs.passed && obs.x + obs.width < this.player.x) {
                obs.passed = true;
                this.score += 25 * this.combo;
                this.updateScoreDisplay();
            }

            // Remove out of bounds
            if (obs.x + obs.width < -10) {
                this.obstacles.splice(i, 1);
            }
        }

        // Update energy core pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            const p = this.pickups[i];
            p.x -= this.speed;

            // Collision check
            const dx = (this.player.x + this.player.width / 2) - p.x;
            const dy = (this.player.y + this.player.height / 2) - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < p.size + 15) {
                this.score += 100 * this.combo;
                this.combo = Math.min(this.combo + 1, 8);
                this.sfxPickup();
                this.createExplosion(p.x, p.y, "#10b981", 14);
                this.pickups.splice(i, 1);
                this.updateScoreDisplay();
                continue;
            }

            if (p.x < -20) {
                this.pickups.splice(i, 1);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.alpha -= pt.decay;

            if (pt.alpha <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw() {
        // Clear background with deep cyber grid tone
        this.ctx.fillStyle = "#090d16";
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Cyber Grid Lines
        this.ctx.strokeStyle = "rgba(99, 102, 241, 0.08)";
        this.ctx.lineWidth = 1;
        const gridOffset = (this.frame * this.speed) % 40;
        for (let x = -gridOffset; x < this.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        for (let y = 0; y < this.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }

        // Draw Player Trail
        for (let i = 0; i < this.player.trail.length; i++) {
            const t = this.player.trail[i];
            const ratio = (i + 1) / this.player.trail.length;
            this.ctx.fillStyle = `rgba(99, 102, 241, ${ratio * 0.4})`;
            this.ctx.beginPath();
            this.ctx.arc(t.x - (this.player.trail.length - i) * 3, t.y, 4 * ratio, 0, Math.PI * 2);
            this.ctx.fill();
        }

        // Draw Player (Futuristic Arrowhead Probe)
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        const tilt = Math.min(Math.max(this.player.vy * 0.05, -0.6), 0.6);
        this.ctx.rotate(tilt);

        // Probe Body
        this.ctx.fillStyle = "#ffffff";
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = "#818cf8";
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.width, this.player.height / 2);
        this.ctx.lineTo(0, 0);
        this.ctx.lineTo(6, this.player.height / 2);
        this.ctx.lineTo(0, this.player.height);
        this.ctx.closePath();
        this.ctx.fill();

        // Neon Cockpit / Core
        this.ctx.fillStyle = "#6366f1";
        this.ctx.beginPath();
        this.ctx.arc(this.player.width * 0.4, this.player.height / 2, 3.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        // Draw Obstacles (Firewall Gates)
        for (const obs of this.obstacles) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = "rgba(239, 68, 68, 0.6)";
            this.ctx.fillStyle = "#ef4444";

            // Top Gate
            this.ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);
            this.ctx.fillStyle = "#f87171";
            this.ctx.fillRect(obs.x + 3, 0, obs.width - 6, obs.topHeight - 6);

            // Gate Emitter tip
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(obs.x - 2, obs.topHeight - 6, obs.width + 4, 6);

            // Bottom Gate
            this.ctx.fillStyle = "#ef4444";
            this.ctx.fillRect(obs.x, obs.bottomY, obs.width, this.height - obs.bottomY);
            this.ctx.fillStyle = "#f87171";
            this.ctx.fillRect(obs.x + 3, obs.bottomY + 6, obs.width - 6, this.height - obs.bottomY - 6);

            // Gate Emitter tip
            this.ctx.fillStyle = "#ffffff";
            this.ctx.fillRect(obs.x - 2, obs.bottomY, obs.width + 4, 6);

            // Energy Field Beam between gates
            this.ctx.strokeStyle = "rgba(248, 113, 113, 0.25)";
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([4, 4]);
            this.ctx.beginPath();
            this.ctx.moveTo(obs.x + obs.width / 2, obs.topHeight);
            this.ctx.lineTo(obs.x + obs.width / 2, obs.bottomY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw Pickups (Quantum Cores)
        for (const p of this.pickups) {
            this.ctx.save();
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = "#10b981";
            this.ctx.fillStyle = "#34d399";

            const pulse = Math.sin(this.frame * 0.1) * 2;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size + pulse, 0, Math.PI * 2);
            this.ctx.fill();

            this.ctx.fillStyle = "#ffffff";
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, (p.size + pulse) * 0.4, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // Draw Particles
        for (const pt of this.particles) {
            this.ctx.save();
            this.ctx.globalAlpha = pt.alpha;
            this.ctx.fillStyle = pt.color;
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // CRT Scanline Overlay
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        for (let y = 0; y < this.height; y += 3) {
            this.ctx.fillRect(0, y, this.width, 1);
        }

        // In-game HUD
        this.ctx.fillStyle = "#94a3b8";
        this.ctx.font = "12px 'Space Grotesk', monospace";
        this.ctx.fillText(`PROTOCOL // 108`, 20, 26);

        if (this.combo > 1) {
            this.ctx.fillStyle = "#10b981";
            this.ctx.font = "bold 13px 'Space Grotesk', sans-serif";
            this.ctx.fillText(`COMBO x${this.combo}`, 20, 48);
        }
    }

    gameOver() {
        this.state = "GAMEOVER";
        this.sfxHit();
        this.createExplosion(this.player.x + 10, this.player.y + 10, "#ef4444", 36);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem("room108_arcade_highscore", this.highScore.toString());
            this.updateHighScoreDisplay();
        }

        // Render one final crash frame
        this.draw();

        // Game Over Overlay
        this.ctx.fillStyle = "rgba(3, 7, 18, 0.85)";
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#ef4444";
        this.ctx.font = "bold 32px 'Space Grotesk', sans-serif";
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "#ef4444";
        this.ctx.fillText("SIGNAL LOST // COLLISION", this.width / 2, this.height / 2 - 35);

        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = "#f8fafc";
        this.ctx.font = "18px 'Space Grotesk', sans-serif";
        this.ctx.fillText(`Final Score: ${this.score} pts`, this.width / 2, this.height / 2 + 5);

        this.ctx.fillStyle = "#94a3b8";
        this.ctx.font = "14px 'Space Grotesk', sans-serif";
        this.ctx.fillText("Press Space, Click, or Tap Jump to Reboot", this.width / 2, this.height / 2 + 45);

        this.ctx.textAlign = "left";
    }

    drawInitialScreen() {
        this.ctx.fillStyle = "#090d16";
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 28px 'Space Grotesk', sans-serif";
        this.ctx.fillText("ROOM108 // PROTOCOL RUNNER", this.width / 2, this.height / 2 - 30);

        this.ctx.fillStyle = "#818cf8";
        this.ctx.font = "15px 'Space Grotesk', sans-serif";
        this.ctx.fillText("Dodge Firewalls • Collect Green Cores • Defy Gravity", this.width / 2, this.height / 2);

        this.ctx.fillStyle = "#64748b";
        this.ctx.font = "13px 'Space Grotesk', sans-serif";
        this.ctx.fillText("[SPACEBAR / CLICK / TAP TO INITIALIZE]", this.width / 2, this.height / 2 + 45);

        this.ctx.textAlign = "left";
    }

    updateScoreDisplay() {
        const scoreElem = document.getElementById("arcade-current-score");
        if (scoreElem) scoreElem.textContent = this.score;
    }

    updateHighScoreDisplay() {
        const highElem = document.getElementById("arcade-high-score");
        if (highElem) highElem.textContent = this.highScore;
    }

    loop() {
        if (this.state !== "PLAYING") return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}

window.Room108Arcade = Room108Arcade;
