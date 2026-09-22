/**
 * Room108 Games - Portfolio & Devlog Data
 */

const studioData = {
    studio: {
        name: "Room108 Games",
        tagline: "Atmospheric Worlds. Uncompromising Gameplay.",
        founded: "2023",
        stats: [
            { label: "Active Projects", value: "3", suffix: "" },
            { label: "Community Members", value: "15", suffix: "k+" },
            { label: "Playtest Hours", value: "6,200", suffix: "+" },
            { label: "Positive Steam Rating", value: "94", suffix: "%" }
        ],
        pillars: [
            {
                icon: "sparkles",
                title: "Atmospheric Immersion",
                desc: "We build worlds that breathe, sound, and feel tangible—anchored by bespoke audio design and meticulous art direction."
            },
            {
                icon: "cpu",
                title: "Deep Game Systems",
                desc: "Every mechanic respects player intelligence. Emergent systems, tight feedback loops, and high skill ceilings."
            },
            {
                icon: "users",
                title: "Player-First Indie Spirit",
                desc: "Zero bloat, zero dark patterns. Direct communication with our community through transparent development."
            },
            {
                icon: "shield",
                title: "Precision Polish",
                desc: "From input response times to tactile UI transitions, we obsess over the micro-interactions that define game feel."
            }
        ]
    },
    games: [
        {
            id: "voidfall",
            title: "Project: Voidfall",
            category: "in-dev",
            tagline: "Atmospheric Sci-Fi Psychological Thriller",
            genre: "Sci-Fi / Psychological Thriller",
            engine: "Unreal Engine 5",
            platforms: ["Steam / PC", "PlayStation 5", "Xbox Series X|S"],
            status: "Alpha Milestone Q4 2026",
            badge: "Featured In-Dev",
            color: "#6366f1",
            imageGradient: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #030712 100%)",
            shortDesc: "Awaken inside decommissioned deep-space mining station Nadir-108. An anomalous signal echoes in the core, the gravity grid is collapsing, and you are not alone.",
            fullDesc: "Awaken inside the decommissioned deep-space mining station Nadir-108 orbiting a dying blue supergiant. The automated systems are turning hostile, life support is dwindling, and the station's gravity grid pulses with a localized quantum anomaly. Every corridor requires tactical resource management, stealth, and sharp intuition as you reconstruct what happened to the 108 crew members.",
            features: [
                "Dynamic zero-G atmospheric navigation with realistic inertial physics",
                "Binaural spatial audio engine crafted for high-tension acoustic awareness",
                "Branching psychological sanity system influencing environmental perception",
                "Volumetric lighting powered by Unreal Engine 5 Lumen & Nanite"
            ],
            specs: {
                release: "2027",
                mode: "Single-player Story",
                languages: "EN, DE, FR, JP, ES"
            }
        },
        {
            id: "echoes-spire",
            title: "Echoes of the Spire",
            category: "released",
            tagline: "Tactical Roguelike Deckbuilder with Dark Fantasy Lore",
            genre: "Roguelike / Tactical Deckbuilder",
            engine: "Custom Unity Pipeline",
            platforms: ["Steam / PC", "Nintendo Switch", "Steam Deck Verified"],
            status: "Available Now on Steam",
            badge: "94% Overwhelmingly Positive",
            color: "#10b981",
            imageGradient: "linear-gradient(135deg, #064e3b 0%, #022c22 50%, #030712 100%)",
            shortDesc: "Ascend a constantly morphing clockwork fortress where ancient relics alter turn orders and occult synergies tear through the void.",
            fullDesc: "Ascend a constantly morphing clockwork fortress where ancient relics dictate the rules of engagement. Combine occult synergy cards, manipulate timeline turns before enemies act, and challenge the keepers of the Shattered Spire. With procedural dungeon branching and deep meta-progression, no two ascents ever play the same.",
            features: [
                "Over 260 handcrafted synergy cards and 85 game-warping relics",
                "Dynamic timeline combat where you can foresee and disrupt enemy intents",
                "Procedural clockwork dungeon rooms with interactive risk-reward events",
                "Steam Deck Verified with native 60fps optimizations and cloud saves"
            ],
            specs: {
                release: "Available Now",
                mode: "Single-player Strategy",
                languages: "EN, FR, DE, ZH, JA, ES"
            }
        },
        {
            id: "chrono-drift",
            title: "Chrono Drift: Overdrive",
            category: "prototype",
            tagline: "Anti-Gravity Cyberpunk Combat Racing",
            genre: "Anti-Grav Racing / Arcade Combat",
            engine: "Unreal Engine 5",
            platforms: ["PC", "Next-Gen Consoles"],
            status: "Public Playtest Soon",
            badge: "Playable Prototype",
            color: "#ec4899",
            imageGradient: "linear-gradient(135deg, #831843 0%, #310b2a 50%, #030712 100%)",
            shortDesc: "Rip through neon megacities at Mach 2 in magnetized hover-chassis. Customize your drift physics and trigger temporal slipstreams.",
            fullDesc: "Rip through neon-drenched megacities at Mach 2 in magnetized hover-chassis. Customize your drift physics, out-maneuver rival syndicates, and trigger temporal slipstreams to rewind tight mistakes or slingshot ahead of the pack. An adrenaline-soaked homage to futuristic arcade racing with modern physics.",
            features: [
                "Hyperspeed 120 FPS anti-grav handling with modular thruster tuning",
                "High-octane electronic synth soundtrack dynamically reactive to race speeds",
                "Chrono-slipstream rewind and slingshot mechanics",
                "4-player local split-screen and 16-player competitive netcode"
            ],
            specs: {
                release: "Beta Q2 2027",
                mode: "Single & Online Multiplayer",
                languages: "EN, JP, FR, IT"
            }
        },
        {
            id: "sublevel-108",
            title: "Sub-Level 108",
            category: "in-dev",
            tagline: "Tactical Stealth Bio-Mechanical Horror",
            genre: "Isometric Stealth / Tactical Survival",
            engine: "Custom Engine",
            platforms: ["Steam / PC", "Mac"],
            status: "In Active Development",
            badge: "In Production",
            color: "#f59e0b",
            imageGradient: "linear-gradient(135deg, #78350f 0%, #291505 50%, #030712 100%)",
            shortDesc: "A minimalist, hyper-tactical stealth game set in an abandoned underground research facility. Sound is your greatest weapon and worst enemy.",
            fullDesc: "An underground bioweapons facility has been sealed under quarantine protocol 108. As a lone salvage operative, map out patrol vectors using acoustic radar probes, disable security sub-grids, and evade blind biomechanical prowlers that hunt strictly by auditory vibrations.",
            features: [
                "Acoustic physics propagation: every step and dropped bolt emits realistic sound ripples",
                "Grid-free fluid stealth mechanics and emergent physics-based traps",
                "Minimalist vector visual aesthetic inspired by tactical telemetry monitors",
                "Hardcore permadeath expedition mode with modular difficulty modifiers"
            ],
            specs: {
                release: "TBA",
                mode: "Single-player Tactical",
                languages: "EN, DE, JA"
            }
        }
    ],
    devlogs: [
        {
            id: 1,
            title: "Devlog #15: Designing the Acoustic Proximity Radar for Sub-Level 108",
            date: "September 18, 2026",
            author: "Lead Systems Designer",
            readTime: "4 min read",
            category: "Game Design",
            excerpt: "How we modeled sound reverberation through metallic vents so players can 'see' patrolling threats in pitch darkness.",
            content: "In Sub-Level 108, lighting is an extreme luxury. When designing the navigation tools, we realized regular radar felt too artificial. Instead, we built an acoustic wave propagation system. Whenever an entity moves, steps on debris, or triggers a vent fan, sound waves bounce off wall geometries. By tapping into the terminal audio sensors, players reconstruct an echoing wireframe silhouette of the surroundings."
        },
        {
            id: 2,
            title: "Devlog #14: Echoes of the Spire Update 1.4 'Clockwork Harvest' Released",
            date: "August 24, 2026",
            author: "Room108 Balance Team",
            readTime: "3 min read",
            category: "Patch Notes",
            excerpt: "Introducing 18 new relic combinations, steam cloud sync polish, and full localization support for Japanese & Korean.",
            content: "Update 1.4 is now live on Steam! We focused on refining high-tier ascension runs, adding 18 brand new synergy relics, and addressing player feedback regarding the third-floor clockwork boss encounter. We also completely overhauled input mapping for the Steam Deck, making hand-held ascents smoother than ever."
        },
        {
            id: 3,
            title: "Devlog #13: Zero-G Inertia & Camera Feel in Project: Voidfall",
            date: "July 30, 2026",
            author: "Gameplay Engineer",
            readTime: "5 min read",
            category: "Engineering",
            excerpt: "Zero gravity without motion sickness: balancing angular drag, head-bob mitigation, and authentic Newton mechanics.",
            content: "Simulating authentic physics in space often conflicts with player comfort. Pure Newtonian physics means you spin infinitely unless counter-thrusted. We created an intuitive magnetic boot stabilization threshold that automatically compensates for micro-rotations while preserving the terrifying feeling of drifting when thruster fuel is cut."
        },
        {
            id: 4,
            title: "Devlog #12: The Philosophy Behind Room108 Games",
            date: "June 15, 2026",
            author: "Studio Founders",
            readTime: "6 min read",
            category: "Studio Culture",
            excerpt: "Why we believe smaller, laser-focused teams create bolder, more memorable player experiences.",
            content: "Room108 started with a single conviction: games should feel crafted, intentional, and respectful of the player's time and imagination. We choose deep mechanical coherence over inflated map sizes, atmospheric intimacy over generic spectacle, and direct community dialogue over corporate marketing."
        }
    ]
};
