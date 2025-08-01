// LoopTrain - Main Game Logic
// Core game state management and circular movement system

// Simple seedable PRNG (Linear Congruential Generator)
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        // LCG parameters from Numerical Recipes
        this.seed = (this.seed * 1664525 + 1013904223) % 2147483647;
        return this.seed / 2147483647;
    }

    nextFloat(min, max) {
        return min + this.next() * (max - min);
    }
}

const LoopTrain = {
    // Game state
    gameState: {
        currentState: GAME_STATES.START,
        beads: [],
        score: 0,
        finalScore: 0,
        highScore: 0,
        health: 3,
        maxHealth: 3,
        spawnTimer: 0,
        chainActive: false,
        lastBeadId: 0,
        needsNewTarget: false,
        spawnDelay: 0,
        // Debug info
        lastHitDistance: 0,
        lastHitResult: "None",
        lastHitTime: 0,
        pulseEffects: [], // Array of pulse effects
        missFlashes: [], // Array of miss flash effects
        particles: [], // Array of particle effects for explosions
        currentTargetZone: { angle: 0, spawned: true, hasHealthBonus: false }, // Current target zone position - start with freebie at top
        nextTargetZone: { angle: 0, spawned: false, hasHealthBonus: false }, // Preview of next target zone
        seed: null,
        rng: null, // Seeded random number generator
        gameTime: 0, // Total game time in seconds
        targetSpeedMultiplier: 1.0 // Speed multiplier that increases over time
    },

    // PIXI Application
    app: null,
    renderer: null,
    input: null,

    // Generate a random seed
    generateSeed() {
        return Math.floor(Math.random() * 2147483647);
    },

    // Get seed from URL or generate new one
    getSeedFromURL() {
        const params = new URLSearchParams(window.location.search);
        const urlSeed = params.get('seed');

        if (urlSeed && !isNaN(urlSeed)) {
            return parseInt(urlSeed);
        }

        // Generate new seed if none in URL
        return this.generateSeed();
    },

    // Update URL with current seed
    updateURLSeed(seed) {
        const url = new URL(window.location);
        url.searchParams.set('seed', seed);
        window.history.replaceState({}, '', url);
    },

    // Load high score from localStorage
    loadHighScore() {
        const stored = localStorage.getItem('looptrain_highscore');
        return stored ? parseInt(stored) : 0;
    },

    // Save high score to localStorage
    saveHighScore(score) {
        localStorage.setItem('looptrain_highscore', score.toString());
    },

    // Initialize the game
    async init() {
        console.log('🎮 LoopTrain.init() - Starting game initialization');

        // Load high score from localStorage
        this.gameState.highScore = this.loadHighScore();
        console.log(`🏆 Loaded high score: ${this.gameState.highScore}`);

        // Initialize seed from URL if present
        const urlSeed = this.getSeedFromURL();
        this.gameState.seed = urlSeed;
        this.gameState.rng = new SeededRandom(urlSeed);
        this.updateURLSeed(urlSeed);
        console.log(`🎲 Initial seed: ${urlSeed}`);

        // Get responsive dimensions
        const dimensions = this.getResponsiveDimensions();

        // Create PIXI application with new v8+ syntax
        this.app = new PIXI.Application();
        await this.app.init({
            width: dimensions.width,
            height: dimensions.height,
            backgroundColor: CONFIG.COLORS.BACKGROUND,
            canvas: document.getElementById('gameCanvas'),
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
            // Additional settings for smoother animation
            powerPreference: 'high-performance',
            backgroundAlpha: 1
        });

        // Configure ticker for smooth animation
        this.app.ticker.maxFPS = 0; // Uncap FPS for smoother animation
        this.app.ticker.minFPS = 30; // Minimum 30 FPS

        console.log('📱 PIXI app created -', this.app.canvas.width, 'x', this.app.canvas.height);

        // Initialize renderer
        if (typeof GameRenderer !== 'undefined') {
            this.renderer = new GameRenderer(this.app);
            this.renderer.game = this; // Connect renderer to game instance
            console.log('🎨 Renderer initialized');
        } else {
            console.error('❌ GameRenderer not found!');
        }

        // Initialize input
        if (typeof InputHandler !== 'undefined') {
            this.input = new InputHandler(this);
            console.log('🎯 Input handler initialized');
        } else {
            console.error('❌ InputHandler not found!');
        }

        // Initialize debug chain if in debug mode
        if (CONFIG.DEBUG.ENABLED) {
            this.createDebugChain();
            console.log('🐛 Debug chain created');
            // Force an immediate render to show the beads
            setTimeout(() => {
                if (this.renderer) {
                    this.renderer.render(this.gameState);
                }
            }, 100);
        } else {
            // Start with the start screen
            this.showStartScreen();
        }

        // Start the game loop
        this.app.ticker.add((delta) => this.update(delta));
        console.log('⏰ Game ticker started');

        // Set up UI event handlers
        this.setupUI();
        
        // Set up resize handler
        this.setupResizeHandler();

        console.log('✅ LoopTrain initialization complete!');
        console.log('📐 Canvas dimensions:', this.app.screen.width, 'x', this.app.screen.height);
        console.log('🎯 Track radius:', this.getTrackRadius());
    },
    
    getResponsiveDimensions() {
        const container = document.getElementById('gameContainer');
        const rect = container.getBoundingClientRect();
        
        // Account for border and padding, use inner dimensions
        const borderWidth = 4; // 2px border on each side
        const size = Math.min(rect.width - borderWidth, rect.height - borderWidth);
        
        return {
            width: Math.max(400, size), // Minimum 400px
            height: Math.max(400, size)
        };
    },
    
    getTrackRadius() {
        // Calculate track radius based on current canvas size
        return Math.min(this.app.screen.width, this.app.screen.height) * 0.35;
    },
    
    getCenterX() {
        return this.app.screen.width / 2;
    },
    
    getCenterY() {
        return this.app.screen.height / 2;
    },
    
    setupResizeHandler() {
        let resizeTimeout;
        
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('📐 Window resized, updating game dimensions');
                this.updateGameDimensions();
            }, 100); // Debounce resize events
        };
        
        window.addEventListener('resize', handleResize);
        console.log('📐 Resize handler set up');
    },
    
    updateGameDimensions() {
        const dimensions = this.getResponsiveDimensions();
        
        // Resize the renderer
        this.app.renderer.resize(dimensions.width, dimensions.height);
        
        // Update all visual elements
        if (this.renderer) {
            this.renderer.updateDimensions();
        }
        
        console.log('📐 Game dimensions updated:', dimensions.width, 'x', dimensions.height);
    },

    // Set up UI event handlers
    setupUI() {
        const startButton = document.getElementById('startButton');
        const restartButton = document.getElementById('restartButton');

        startButton.addEventListener('click', () => this.startGame());
        restartButton.addEventListener('click', () => this.restartGame());

        console.log('🖱️ UI event handlers setup');
    },

    // Helper Functions
    resetGame() {
        console.log('🔄 Resetting game state');
        this.gameState.beads = [];
        this.gameState.score = 0;
        this.gameState.health = this.gameState.maxHealth;
        this.gameState.spawnTimer = 0;
        this.gameState.chainActive = false;
        this.gameState.lastBeadId = 0;
        this.gameState.needsNewTarget = false;
        this.gameState.spawnDelay = 0;
        this.gameState.pulseEffects = [];
        this.gameState.missFlashes = [];
        this.gameState.particles = [];

        // Initialize seed and RNG for new game
        this.gameState.seed = this.generateSeed();
        this.gameState.rng = new SeededRandom(this.gameState.seed);
        this.updateURLSeed(this.gameState.seed);
        console.log(`🎲 New game seed: ${this.gameState.seed}`);

        // First target zone is ALWAYS at top (noon)
        this.gameState.currentTargetZone = { angle: 0, spawned: true, hasHealthBonus: false };

        // Generate next target zone
        this.generateNextTargetZone();

        // Reset speed multiplier for new game
        this.gameState.targetSpeedMultiplier = 1.0;
        this.gameState.gameTime = 0;

        this.updateScoreDisplay();
    },

    createBead(beadType, angle = 0) {
        this.gameState.lastBeadId++;
        const bead = {
            id: this.gameState.lastBeadId,
            type: beadType,
            angle: angle, // Start at center of target zone (12 o'clock)
            activated: false,
            inChain: false,
            lastHitAngle: null, // Track when last hit to provide grace period
            currentZoneEntered: false, // Track if we've entered current zone
            hitInCurrentZone: false, // Track if we were hit while in current zone
            hasInitialGrace: beadType === BEAD_TYPES.TARGET, // Initial grace period for target beads
            flashTimer: 0, // Timer for white flash effect
            growthFactor: 0 // 0-1 for bead size growth animation
        };

        console.log(`🔵 Created bead: ID=${bead.id}, type=${beadType}, angle=${angle.toFixed(2)}`);
        return bead;
    },

    createPulseEffect(x, y) {
        const pulse = {
            x: x,
            y: y,
            radius: 1,
            maxRadius: 50,
            duration: 0.5,
            timer: 0
        };

        console.log(`💥 Created pulse effect at (${x.toFixed(1)}, ${y.toFixed(1)})`);
        return pulse;
    },

    createMissFlash(x, y) {
        const flash = {
            x: x,
            y: y,
            radius: 40,
            duration: 0.3,
            timer: 0
        };

        console.log(`⚡ Created miss flash at (${x.toFixed(1)}, ${y.toFixed(1)})`);
        return flash;
    },

    createParticleExplosion(x, y, particleCount = 15) {
        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * 2 * Math.PI;
            const speed = 50 + Math.random() * 100; // Random speed between 50-150
            const particle = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                maxLife: 0.8 + Math.random() * 0.4, // Random life between 0.8-1.2 seconds
                size: 3 + Math.random() * 4, // Random size between 3-7
                color: Math.random() > 0.5 ? 0xff1493 : 0xffffff // Mix of target color and white
            };
            particles.push(particle);
        }

        console.log(`💥 Created particle explosion with ${particleCount} particles at (${x.toFixed(1)}, ${y.toFixed(1)})`);
        return particles;
    },

    generateNextTargetZone() {
        // Generate next target zone using seeded random
        let newAngle;
        do {
            newAngle = this.gameState.rng.nextFloat(0, 2 * Math.PI);
        } while (Math.abs(newAngle - this.gameState.currentTargetZone.angle) < Math.PI / 6); // At least 30 degrees away

        // 5% chance for health bonus
        const hasHealthBonus = this.gameState.rng.next() < 0.05;

        this.gameState.nextTargetZone = {
            angle: newAngle,
            spawned: true,
            hasHealthBonus: hasHealthBonus
        };

        console.log(`🎯 Next target zone generated at angle ${newAngle.toFixed(2)} (${(newAngle * 180 / Math.PI).toFixed(1)}°)${hasHealthBonus ? ' with +1 health bonus!' : ''}`);
        return this.gameState.nextTargetZone;
    },

    spawnRandomTargetZone() {
        // Move next zone to current
        this.gameState.currentTargetZone = {
            angle: this.gameState.nextTargetZone.angle,
            spawned: true,
            hasHealthBonus: this.gameState.nextTargetZone.hasHealthBonus
        };

        // Generate new next zone
        this.generateNextTargetZone();

        console.log(`🎯 Target zones shifted - current: ${(this.gameState.currentTargetZone.angle * 180 / Math.PI).toFixed(1)}°${this.gameState.currentTargetZone.hasHealthBonus ? ' with +1 health!' : ''}, next: ${(this.gameState.nextTargetZone.angle * 180 / Math.PI).toFixed(1)}°`);
        return this.gameState.currentTargetZone;
    },

    createDebugChain() {
        console.log('🐛 Creating debug chain with', CONFIG.DEBUG.CHAIN_LENGTH, 'beads');
        this.gameState.beads = [];

        // Initialize zones for debug mode
        this.gameState.currentTargetZone = { angle: 0, spawned: true, hasHealthBonus: false };
        this.generateNextTargetZone();

        // Create a chain of beads with proper spacing for movement
        for (let i = 1; i <= CONFIG.DEBUG.CHAIN_LENGTH; i++) {
            const beadType = (i === 1) ? BEAD_TYPES.TARGET : BEAD_TYPES.POINT_1;
            const angle = -(i - 1) * 0.5; // Use spacing for chain movement
            const bead = this.createBead(beadType, angle);
            bead.inChain = true;
            this.gameState.beads.push(bead);
            console.log(`🐛 Created debug bead ${i}: type=${beadType}, angle=${angle.toFixed(2)}, ID=${bead.id}`);
        }

        console.log('🐛 Debug chain created with', this.gameState.beads.length, 'beads');
        console.log('🐛 Game state:', this.gameState.currentState);
        this.logBeadChain();
    },

    // Helper method to log current bead chain state
    logBeadChain() {
        console.log('🔗 Current bead chain:');
        this.gameState.beads.forEach((bead, index) => {
            console.log(`  ${index + 1}: ID=${bead.id}, type=${bead.type}, angle=${bead.angle.toFixed(2)}, inChain=${bead.inChain}`);
        });
    },

    getBeadPosition(bead) {
        const x = this.getCenterX() + Math.cos(bead.angle - Math.PI / 2) * this.getTrackRadius();
        const y = this.getCenterY() + Math.sin(bead.angle - Math.PI / 2) * this.getTrackRadius();
        return { x, y };
    },

    isInTargetZone(angle) {
        // Check if angle is in the current target zone
        const currentZone = this.gameState.currentTargetZone;
        let diff = Math.abs(angle - currentZone.angle);
        // Handle angle wrapping
        if (diff > Math.PI) {
            diff = 2 * Math.PI - diff;
        }
        return diff <= CONFIG.TARGET.SIZE;
    },

    // Check and combine beads according to rules
    checkAndCombineBeads() {
        const newBeads = [];
        let i = 0;

        while (i < this.gameState.beads.length) {
            const bead = this.gameState.beads[i];

            // Check for combining 1-point beads into 10-point
            if (bead.type === BEAD_TYPES.POINT_1 && bead.inChain) {
                let count = 1;
                let j = i + 1;
                while (j < this.gameState.beads.length &&
                    this.gameState.beads[j].type === BEAD_TYPES.POINT_1 &&
                    this.gameState.beads[j].inChain &&
                    count < 10) {
                    count++;
                    j++;
                }

                if (count === 10) {
                    // Create 10-point bead at average position
                    const newBead = this.createBead(BEAD_TYPES.POINT_10, bead.angle);
                    newBead.inChain = true;
                    newBeads.push(newBead);
                    console.log(`🔄 Combined 10 POINT_1 beads into 1 POINT_10 at angle ${bead.angle.toFixed(2)}`);
                    i = j; // Skip the combined beads
                } else {
                    newBeads.push(bead);
                    i++;
                }

                // Check for combining 10-point beads into 50-point
            } else if (bead.type === BEAD_TYPES.POINT_10 && bead.inChain) {
                let count = 1;
                let j = i + 1;
                while (j < this.gameState.beads.length &&
                    this.gameState.beads[j].type === BEAD_TYPES.POINT_10 &&
                    this.gameState.beads[j].inChain &&
                    count < 5) {
                    count++;
                    j++;
                }

                if (count === 5) {
                    const newBead = this.createBead(BEAD_TYPES.POINT_50, bead.angle);
                    newBead.inChain = true;
                    newBeads.push(newBead);
                    console.log(`🔄 Combined 5 POINT_10 beads into 1 POINT_50 at angle ${bead.angle.toFixed(2)}`);
                    i = j;
                } else {
                    newBeads.push(bead);
                    i++;
                }

                // Check for combining 50-point beads into 100-point
            } else if (bead.type === BEAD_TYPES.POINT_50 && bead.inChain) {
                let count = 1;
                let j = i + 1;
                while (j < this.gameState.beads.length &&
                    this.gameState.beads[j].type === BEAD_TYPES.POINT_50 &&
                    this.gameState.beads[j].inChain &&
                    count < 2) {
                    count++;
                    j++;
                }

                if (count === 2) {
                    const newBead = this.createBead(BEAD_TYPES.POINT_100, bead.angle);
                    newBead.inChain = true;
                    newBeads.push(newBead);
                    console.log(`🔄 Combined 2 POINT_50 beads into 1 POINT_100 at angle ${bead.angle.toFixed(2)}`);
                    i = j;
                } else {
                    newBeads.push(bead);
                    i++;
                }
            } else {
                newBeads.push(bead);
                i++;
            }
        }

        if (newBeads.length !== this.gameState.beads.length) {
            console.log(`🔄 Bead combination: ${this.gameState.beads.length} → ${newBeads.length} beads`);
            this.gameState.beads = newBeads;
        }
    },

    // Handle tap/click input
    handleTap() {
        if (this.gameState.currentState !== GAME_STATES.PLAYING) {
            return;
        }

        console.log('👆 Tap detected - checking for target beads');

        let hitTarget = false;
        let closestDistance = Infinity;
        let closestBead = null;

        // Find the closest target bead to measure precision
        for (const bead of this.gameState.beads) {
            if (bead.type === BEAD_TYPES.TARGET && !bead.activated) {
                let distance = Math.abs(bead.angle - this.gameState.currentTargetZone.angle);
                if (distance > Math.PI) {
                    distance = 2 * Math.PI - distance;
                }

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestBead = bead;
                }

                // Check if this bead can be hit (in any target zone)
                if (this.isInTargetZone(bead.angle)) {
                    console.log(`🎯 HIT! Bead ID=${bead.id}, distance=${distance.toFixed(3)} rad`);

                    // Create pulse effect at bead position
                    const pos = this.getBeadPosition(bead);
                    this.gameState.pulseEffects.push(this.createPulseEffect(pos.x, pos.y));

                    // Mark as hit recently - this gives grace period
                    bead.lastHitAngle = bead.angle;
                    bead.hitInCurrentZone = true; // Mark that we hit in this zone
                    bead.flashTimer = 0.3; // Flash for 300ms
                    hitTarget = true;

                    // Add to score
                    this.gameState.score++;
                    this.updateScoreDisplay();

                    // Check for health bonus
                    if (this.gameState.currentTargetZone.hasHealthBonus && this.gameState.health < this.gameState.maxHealth) {
                        this.gameState.health++;
                        console.log(`💚 HEALTH BONUS! Health increased to ${this.gameState.health}`);
                    }

                    // Spawn a point bead at current position
                    const pointBead = this.createBead(BEAD_TYPES.POINT_1, bead.angle);
                    pointBead.inChain = true;
                    this.gameState.beads.push(pointBead);

                    // Spawn new random target zone
                    this.spawnRandomTargetZone();

                    console.log(`✅ HIT TARGET at angle=${bead.angle.toFixed(2)}, spawned point bead and new target zone`);

                    // Debug info
                    this.gameState.lastHitDistance = distance;
                    this.gameState.lastHitResult = "HIT";
                    this.gameState.lastHitTime = performance.now();

                    break; // Only process one hit per tap
                }
            }
        }

        // Update debug info for misses
        if (!hitTarget) {
            // Check if any target bead is in the current target zone
            let targetInZone = false;
            for (const bead of this.gameState.beads) {
                if (bead.type === BEAD_TYPES.TARGET && !bead.activated && this.isInTargetZone(bead.angle)) {
                    targetInZone = true;
                    break;
                }
            }

            if (!targetInZone) {
                // No target in zone - penalize the player
                this.gameState.health--;
                console.log(`💥 FIRED OUTSIDE TARGET ZONE! Health reduced to ${this.gameState.health}`);
                
                // Create miss flash at target zone position
                const zoneAngle = this.gameState.currentTargetZone.angle;
                const x = this.getCenterX() + Math.cos(zoneAngle - Math.PI / 2) * this.getTrackRadius();
                const y = this.getCenterY() + Math.sin(zoneAngle - Math.PI / 2) * this.getTrackRadius();
                this.gameState.missFlashes.push(this.createMissFlash(x, y));
                
                // Check if health is now 0
                if (this.gameState.health <= 0) {
                    console.log('💀 GAME OVER - Health depleted');
                    this.gameState.finalScore = this.gameState.score;
                    
                    // Check and update high score
                    if (this.gameState.score > this.gameState.highScore) {
                        this.gameState.highScore = this.gameState.score;
                        this.saveHighScore(this.gameState.highScore);
                        console.log(`🏆 NEW HIGH SCORE: ${this.gameState.highScore}`);
                    }
                    
                    this.gameState.currentState = GAME_STATES.GAME_OVER;
                    this.showGameOver();
                    return;
                }
            }

            if (closestBead) {
                this.gameState.lastHitDistance = closestDistance;
                this.gameState.lastHitResult = `MISS (hasLeft:${closestBead.hasLeftTargetZone}, inZone:${this.isInTargetZone(closestBead.angle)})`;
                this.gameState.lastHitTime = performance.now();
                console.log(`❌ ${this.gameState.lastHitResult}, distance=${closestDistance.toFixed(3)} rad`);
            } else {
                this.gameState.lastHitResult = "NO TARGET";
                console.log('❌ NO TARGET available');
            }
        }

        this.updateDebugInfo();
    },

    // Main update loop
    update(delta) {
        // PIXI v8 ticker: delta is the time multiplier (1.0 = normal speed)
        // Use elapsedMS for actual time passed
        const dt = this.app.ticker.elapsedMS / 1000; // Convert to seconds

        // Cap delta time to prevent large jumps (max 33ms = 30fps)
        const cappedDt = Math.min(dt, 0.033);

        if (CONFIG.DEBUG.ENABLED) {
            this.updateDebugMode(cappedDt);
        } else if (this.gameState.currentState === GAME_STATES.PLAYING) {
            this.updateGameplay(cappedDt);
        }

        // Update pulse effects
        for (let i = this.gameState.pulseEffects.length - 1; i >= 0; i--) {
            const pulse = this.gameState.pulseEffects[i];
            pulse.timer += cappedDt;
            pulse.radius = (pulse.timer / pulse.duration) * pulse.maxRadius;

            if (pulse.timer >= pulse.duration) {
                this.gameState.pulseEffects.splice(i, 1);
            }
        }

        // Update miss flash effects
        for (let i = this.gameState.missFlashes.length - 1; i >= 0; i--) {
            const flash = this.gameState.missFlashes[i];
            flash.timer += cappedDt;

            if (flash.timer >= flash.duration) {
                this.gameState.missFlashes.splice(i, 1);
            }
        }

        // Update particle effects
        for (let i = this.gameState.particles.length - 1; i >= 0; i--) {
            const particle = this.gameState.particles[i];
            particle.x += particle.vx * cappedDt;
            particle.y += particle.vy * cappedDt;
            particle.life -= cappedDt / particle.maxLife;

            // Apply slight gravity effect
            particle.vy += 50 * cappedDt;

            if (particle.life <= 0) {
                this.gameState.particles.splice(i, 1);
            }
        }

        // Update renderer
        if (this.renderer) {
            this.renderer.render(this.gameState);
        }
    },

    updateDebugMode(dt) {
        // Debug mode: Simple chain movement with safe constants
        const SAFE_BEAD_SPEED = 1.5; // Fixed safe value instead of CONFIG getter
        const SAFE_BEAD_SPACING = 0.5; // Fixed safe value

        // Log occasionally to verify updates are running
        if (!this._updateCounter) this._updateCounter = 0;
        this._updateCounter++;

        if (this._updateCounter % 60 === 0) { // Log every 60 frames (about 1 second)
            console.log(`🐛 Update running: frame ${this._updateCounter}, dt=${dt.toFixed(3)}, beads=${this.gameState.beads.length}`);
            if (this.gameState.beads.length > 0) {
                console.log(`🐛 Lead bead angle: ${this.gameState.beads[0].angle.toFixed(3)}`);
            }
        }

        for (let i = 0; i < this.gameState.beads.length; i++) {
            const bead = this.gameState.beads[i];

            if (i === 0) {
                // Lead bead moves autonomously
                bead.angle += SAFE_BEAD_SPEED * dt;
            } else {
                // Following beads maintain fixed spacing behind previous bead
                const prevBead = this.gameState.beads[i - 1];
                bead.angle = prevBead.angle - SAFE_BEAD_SPACING;
            }

            // Normalize angles to 0-2π range for display consistency
            while (bead.angle < 0) {
                bead.angle += 2 * Math.PI;
            }
            while (bead.angle > 2 * Math.PI) {
                bead.angle -= 2 * Math.PI;
            }
        }
    },

    updateGameplay(dt) {
        // Update game time and speed multiplier
        this.gameState.gameTime += dt;

        // Increase speed gradually using config rate
        this.gameState.targetSpeedMultiplier = 1.0 + (this.gameState.gameTime * CONFIG.MOVEMENT.SPEED_INCREASE_RATE);

        // Always move all beads continuously - no pausing
        for (let i = 0; i < this.gameState.beads.length; i++) {
            const bead = this.gameState.beads[i];

            if (i === 0) {
                // Lead bead ALWAYS moves at constant speed
                const speed = bead.type === BEAD_TYPES.TARGET ?
                    CONFIG.MOVEMENT.BEAD_SPEED * this.gameState.targetSpeedMultiplier :
                    CONFIG.MOVEMENT.BEAD_SPEED;
                bead.angle += speed * dt;
            } else {
                // Following beads maintain fixed spacing behind previous bead
                const prevBead = this.gameState.beads[i - 1];
                bead.angle = prevBead.angle - CONFIG.MOVEMENT.BEAD_SPACING;
            }

            // Update flash timer
            if (bead.flashTimer > 0) {
                bead.flashTimer -= dt;
            }

            // Update growth factor for target beads
            if (bead.type === BEAD_TYPES.TARGET && !bead.activated) {
                let distanceToTarget = Math.abs(bead.angle - this.gameState.currentTargetZone.angle);
                if (distanceToTarget > Math.PI) {
                    distanceToTarget = 2 * Math.PI - distanceToTarget;
                }

                // Start growing when approaching target zone
                if (distanceToTarget <= CONFIG.TIMING.BEAD_GROW_START) {
                    bead.growthFactor = 1 - (distanceToTarget / CONFIG.TIMING.BEAD_GROW_START);
                } else {
                    bead.growthFactor = 0;
                }

                // Flash white when at perfect timing
                if (distanceToTarget <= CONFIG.TIMING.PERFECT_HIT_THRESHOLD && bead.flashTimer <= 0) {
                    bead.flashTimer = CONFIG.TIMING.FLASH_DURATION;
                }

                // Track zone entry/exit and check for game over
                const inZone = this.isInTargetZone(bead.angle);

                // Grace period check - only initial grace matters for game over
                // Hit-based grace only prevents immediate game over, not indefinite protection
                const hasInitialGrace = bead.hasInitialGrace;

                // Clear initial grace period after first full zone exit
                if (bead.hasInitialGrace && bead.angle > Math.PI) {
                    bead.hasInitialGrace = false;
                    console.log(`🎮 Initial grace period ended at angle ${bead.angle.toFixed(2)}`);
                }

                if (inZone && !bead.currentZoneEntered) {
                    // Entering a target zone
                    bead.currentZoneEntered = true;
                    bead.hitInCurrentZone = false; // Reset hit flag for new zone
                    console.log(`➡️ Target bead entering zone at angle ${bead.angle.toFixed(2)}`);
                } else if (!inZone && bead.currentZoneEntered) {
                    // Leaving a target zone
                    bead.currentZoneEntered = false;

                    // Check if we hit the target while in this zone or had initial grace
                    const wasHitInZone = bead.hitInCurrentZone;
                    if (!wasHitInZone && !hasInitialGrace) {
                        // Create miss flash at target position
                        const pos = this.getBeadPosition(bead);
                        this.gameState.missFlashes.push(this.createMissFlash(pos.x, pos.y));

                        // Reduce health instead of immediate game over
                        this.gameState.health--;
                        console.log(`💥 MISS! Health reduced to ${this.gameState.health}`);

                        // Check if health is now 0
                        if (this.gameState.health <= 0) {
                            console.log('💀 GAME OVER - Health depleted');
                            this.gameState.finalScore = this.gameState.score;
                            
                            // Check and update high score
                            if (this.gameState.score > this.gameState.highScore) {
                                this.gameState.highScore = this.gameState.score;
                                this.saveHighScore(this.gameState.highScore);
                                console.log(`🏆 NEW HIGH SCORE: ${this.gameState.highScore}`);
                            }
                            
                            this.gameState.currentState = GAME_STATES.GAME_OVER;
                            this.showGameOver();
                            return;
                        }
                    } else if (wasHitInZone) {
                        console.log(`⬅️ Target bead leaving zone - was hit successfully`);
                    } else {
                        console.log(`⬅️ Target bead leaving zone with initial grace period`);
                    }

                    // Reset hit flag after leaving zone
                    bead.hitInCurrentZone = false;
                }
            }
        }

        // Handle bead cleanup and angle wrapping
        for (let i = this.gameState.beads.length - 1; i >= 0; i--) {
            const bead = this.gameState.beads[i];

            if (bead.type === BEAD_TYPES.TARGET) {
                // Target beads NEVER get removed - they wrap around
                if (bead.angle > 2 * Math.PI) {
                    const oldAngle = bead.angle;
                    bead.angle = bead.angle - 2 * Math.PI; // Wrap to 0-2π range
                    console.log(`🔄 TARGET BEAD wrapped: ${oldAngle.toFixed(2)} → ${bead.angle.toFixed(2)}`);
                }
            } else {
                // Point beads get removed after completing the circle
                if (bead.angle > 2 * Math.PI + CONFIG.TARGET.SIZE) {
                    console.log(`🗑️ REMOVING POINT BEAD: ID=${bead.id}, type=${bead.type}, angle=${bead.angle.toFixed(2)}`);
                    this.gameState.beads.splice(i, 1);
                }
            }
        }

        // Check for bead combinations
        this.checkAndCombineBeads();

        this.updateDebugInfo();
    },

    // UI Control Methods
    startGame() {
        console.log('🎮 Starting new game');
        if (CONFIG.DEBUG.ENABLED) {
            this.createDebugChain();
        } else {
            this.resetGame();
            this.gameState.currentState = GAME_STATES.PLAYING;
            // Create initial target bead at top center
            const initialBead = this.createBead(BEAD_TYPES.TARGET, 0);
            this.gameState.beads.push(initialBead);
            // Initial target zone is already spawned at top (freebie)
            // Next target zone is already generated in resetGame()
        }

        this.showGameScreen();
    },

    restartGame() {
        console.log('🔄 Restarting game');
        this.startGame();
    },

    showStartScreen() {
        document.getElementById('startScreen').style.display = 'flex';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('touchHitbox').classList.remove('playing');
    },

    showGameScreen() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'flex';
        document.getElementById('gameOverScreen').style.display = 'none';
        document.getElementById('touchHitbox').classList.add('playing');
    },

    showGameOver() {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'flex';
        document.getElementById('touchHitbox').classList.remove('playing');

        document.getElementById('finalScoreDisplay').textContent = `Final Score: ${this.gameState.finalScore}`;
    },

    updateScoreDisplay() {
        document.getElementById('scoreDisplay').textContent = this.gameState.score;
    },

    updateDebugInfo() {
        if (!CONFIG.DEBUG.SHOW_TIMING && !CONFIG.DEBUG.SHOW_HIT_INFO) return;

        let debugText = '';

        if (CONFIG.DEBUG.SHOW_HIT_INFO) {
            debugText += `Last Hit: ${this.gameState.lastHitResult}\n`;
            debugText += `Distance: ${this.gameState.lastHitDistance.toFixed(3)} rad (${(this.gameState.lastHitDistance * 180 / Math.PI).toFixed(1)}°)\n\n`;
        }

        if (CONFIG.DEBUG.SHOW_TIMING) {
            // Show current target bead info
            for (let i = 0; i < this.gameState.beads.length; i++) {
                const bead = this.gameState.beads[i];
                if (bead.type === BEAD_TYPES.TARGET && !bead.activated) {
                    let distance = Math.abs(bead.angle - CONFIG.TARGET.ANGLE);
                    if (distance > Math.PI) {
                        distance = 2 * Math.PI - distance;
                    }
                    debugText += `Target #${i + 1}: ${distance.toFixed(3)} rad (${(distance * 180 / Math.PI).toFixed(1)}°) hasLeft:${bead.hasLeftTargetZone} inZone:${this.isInTargetZone(bead.angle)}\n`;
                    break; // Only show first target
                }
            }

            debugText += `Beads: ${this.gameState.beads.length} | Chain Active: ${this.gameState.chainActive}\n`;
            debugText += `Spawn Delay: ${this.gameState.spawnDelay.toFixed(2)} | Needs New: ${this.gameState.needsNewTarget}`;
        }

        const debugElement = document.getElementById('debugInfo');
        debugElement.textContent = debugText;
        debugElement.style.display = debugText ? 'block' : 'none';
    }
};

// Export for browser
if (typeof window !== 'undefined') {
    window.LoopTrain = LoopTrain;
}

console.log('🎮 LoopTrain game logic loaded');