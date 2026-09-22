/**
 * Room108 Games - Interactive Particle Canvas Background
 */

(function () {
    const canvas = document.getElementById("hero-canvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    let animationFrameId;

    // Theme color palettes
    const getColors = () => {
        const isLight = document.documentElement.getAttribute("data-theme") === "light";
        return {
            particle: isLight ? "rgba(30, 41, 59, 0.45)" : "rgba(147, 197, 253, 0.6)",
            particleGlow: isLight ? "rgba(99, 102, 241, 0.3)" : "rgba(129, 140, 248, 0.5)",
            line: isLight ? "rgba(100, 116, 139, " : "rgba(147, 197, 253, ",
            accent: isLight ? "#6366f1" : "#a855f7"
        };
    };

    let colors = getColors();

    // Responsive resize
    function resize() {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.vx = (Math.random() - 0.5) * 0.7;
            this.vy = (Math.random() - 0.5) * 0.7;
            this.density = (Math.random() * 20) + 10;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = colors.particle;
            ctx.fill();

            // Subtle glow
            if (this.size > 2) {
                ctx.shadowBlur = 8;
                ctx.shadowColor = colors.particleGlow;
            } else {
                ctx.shadowBlur = 0;
            }
        }

        update() {
            // Mouse interaction (gentle displacement and spring-back)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouse.radius - distance) / mouse.radius;
                    const directionX = forceDirectionX * force * this.density * 0.5;
                    const directionY = forceDirectionY * force * this.density * 0.5;

                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            // Natural drift
            this.x += this.vx;
            this.y += this.vy;

            // Wrap edges
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }
    }

    function initParticles() {
        particles = [];
        // Calculate particle density based on screen size (prevent lag on big displays)
        const count = Math.min(Math.floor((width * height) / 12000), 100);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function connect() {
        const maxDistance = 110;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDistance) {
                    const opacity = (1 - dist / maxDistance) * 0.25;
                    ctx.strokeStyle = colors.line + opacity + ")";
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        connect();

        animationFrameId = requestAnimationFrame(animate);
    }

    // Mouse events
    window.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        ) {
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        } else {
            mouse.x = null;
            mouse.y = null;
        }
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Handle theme updates
    window.addEventListener("themeChanged", () => {
        colors = getColors();
    });

    // Resize listener with debounce
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 100);
    });

    // Reduced motion accessibility check
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        resize();
        animate();
    } else {
        resize();
        // Just draw one static frame
        for (let i = 0; i < particles.length; i++) {
            particles[i].draw();
        }
        connect();
    }
})();
