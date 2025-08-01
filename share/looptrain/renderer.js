// LoopTrain Renderer - PixiJS rendering and visual effects
// Handles all visual rendering including beads, track, effects

class GameRenderer {
    constructor(app) {
        this.app = app;
        this.stage = app.stage;
        this.game = null; // Will be set by game.js
        
        // Create containers for different layers
        this.trackContainer = new PIXI.Container();
        this.beadContainer = new PIXI.Container();
        this.effectContainer = new PIXI.Container();
        this.uiContainer = new PIXI.Container();
        this.bonusTextContainer = new PIXI.Container(); // Separate container for bonus text
        
        // Add containers to stage in correct order (back to front)
        this.stage.addChild(this.trackContainer);
        this.stage.addChild(this.beadContainer);
        this.stage.addChild(this.bonusTextContainer); // Add between beads and effects
        this.stage.addChild(this.effectContainer);
        this.stage.addChild(this.uiContainer);
        
        // Create screen flash overlay for miss effects
        this.flashOverlay = new PIXI.Graphics();
        this.flashOverlay.alpha = 0;
        this.effectContainer.addChild(this.flashOverlay);
        
        // Create persistent health pill graphics
        this.healthPills = [];
        this.setupHealthDisplay();
        
        // Create high score text
        this.highScoreText = new PIXI.Text('', {
            fontFamily: 'monospace',
            fontSize: this.getScaledFontSize(16),
            fill: CONFIG.COLORS.UI_TEXT,
            align: 'right'
        });
        this.highScoreText.anchor.set(1, 0); // Anchor to top-right
        this.updateHighScorePosition();
        this.uiContainer.addChild(this.highScoreText);
        
        this.setupTrack();
        
        console.log('🎨 GameRenderer initialized with containers');
    }
    
    setupHealthDisplay() {
        // Create persistent health pill graphics
        const startX = 40;
        const startY = 30;
        const spacing = 35;
        const maxHealth = 3; // Hardcoded max health
        
        for (let i = 0; i < maxHealth; i++) {
            const x = startX + i * spacing;
            const y = startY;
            
            const graphics = new PIXI.Graphics();
            graphics.x = x;
            graphics.y = y;
            this.healthPills.push(graphics);
            this.uiContainer.addChild(graphics);
        }
    }
    
    setupTrack() {
        // Create track circle
        this.trackGraphics = new PIXI.Graphics();
        this.drawTrack();
        this.trackContainer.addChild(this.trackGraphics);
        
        // Create target zone circles (will be updated dynamically)
        this.nextTargetZoneGraphics = new PIXI.Graphics(); // Next zone (50% opacity)
        this.targetZoneGraphics = new PIXI.Graphics(); // Current zone (full opacity)
        this.trackContainer.addChild(this.nextTargetZoneGraphics);
        this.trackContainer.addChild(this.targetZoneGraphics);
        
        // Initialize miss flash state
        this.missFlashProgress = 0;
        
        console.log('🛤️ Track created');
    }
    
    drawTrack() {
        const centerX = this.getCenterX();
        const centerY = this.getCenterY();
        const radius = this.getTrackRadius();
        
        this.trackGraphics.clear();
        this.trackGraphics
            .circle(centerX, centerY, radius)
            .stroke({ width: this.getTrackLineWidth(), color: CONFIG.COLORS.TRACK });
    }
    
    getCenterX() {
        return this.app.screen.width / 2;
    }
    
    getCenterY() {
        return this.app.screen.height / 2;
    }
    
    getTrackRadius() {
        return Math.min(this.app.screen.width, this.app.screen.height) * 0.35;
    }
    
    getTargetZoneRadius() {
        // Target zone should be 125% the size of target bead (25% larger radius)
        const targetBeadSize = this.getScaledBeadSize(CONFIG.VISUAL.BEAD_SIZES.TARGET);
        return targetBeadSize * 1.25;
    }
    
    getTargetZoneLineWidth() {
        // Scale line width based on canvas size
        const baseLineWidth = 4;
        const baseCanvasSize = 400;
        const currentCanvasSize = Math.min(this.app.screen.width, this.app.screen.height);
        return Math.max(2, (baseLineWidth * currentCanvasSize) / baseCanvasSize);
    }
    
    getPreviewZoneLineWidth() {
        // Thinner line width for preview zones
        return Math.max(1, this.getTargetZoneLineWidth() * 0.6);
    }
    
    getTrackLineWidth() {
        // Scale track line width based on canvas size
        const baseLineWidth = 3;
        const baseCanvasSize = 400;
        const currentCanvasSize = Math.min(this.app.screen.width, this.app.screen.height);
        return Math.max(1, (baseLineWidth * currentCanvasSize) / baseCanvasSize);
    }
    
    getScaledBeadSize(baseSize) {
        // Scale bead sizes based on canvas size
        const baseCanvasSize = 400;
        const currentCanvasSize = Math.min(this.app.screen.width, this.app.screen.height);
        return (baseSize * currentCanvasSize) / baseCanvasSize;
    }
    
    getScaledFontSize(baseFontSize) {
        // Scale font sizes based on canvas size
        const baseCanvasSize = 400;
        const currentCanvasSize = Math.min(this.app.screen.width, this.app.screen.height);
        return Math.max(10, (baseFontSize * currentCanvasSize) / baseCanvasSize);
    }
    
    drawDashedCircle(graphics, centerX, centerY, radius, style) {
        // Draw a dashed circle by drawing multiple small arcs
        graphics.clear();
        
        const circumference = 2 * Math.PI * radius;
        const scaledDashLength = (style.dashLength / circumference) * 2 * Math.PI;
        const scaledGapLength = (style.gapLength / circumference) * 2 * Math.PI;
        const segmentLength = scaledDashLength + scaledGapLength;
        
        let currentAngle = 0;
        
        while (currentAngle < 2 * Math.PI) {
            const endAngle = Math.min(currentAngle + scaledDashLength, 2 * Math.PI);
            
            // Draw dash segment
            graphics.arc(centerX, centerY, radius, currentAngle, endAngle)
                   .stroke({ 
                       width: style.width, 
                       color: style.color, 
                       alpha: style.alpha 
                   });
            
            currentAngle += segmentLength;
        }
    }
    
    updateHighScorePosition() {
        this.highScoreText.x = this.app.screen.width - 40;
        this.highScoreText.y = 30;
    }
    
    updateDimensions() {
        // Redraw track
        this.drawTrack();
        
        // Update UI positions and sizes
        this.updateHighScorePosition();
        this.updateHealthDisplay();
        
        // Update font sizes
        this.highScoreText.style.fontSize = this.getScaledFontSize(16);
        
        // Redraw flash overlay
        if (this.flashOverlay) {
            this.flashOverlay.clear();
            this.flashOverlay.rect(0, 0, this.app.screen.width, this.app.screen.height).fill(0xff0000);
        }
        
        console.log('📦 Renderer dimensions updated');
    }
    
    updateHealthDisplay() {
        const startX = 40;
        const startY = 30;
        const spacing = 35;
        
        for (let i = 0; i < this.healthPills.length; i++) {
            this.healthPills[i].x = startX + i * spacing;
            this.healthPills[i].y = startY;
        }
    }
    
    renderTestShape() {
        // Add a simple test circle to verify rendering is working - using old API
        const testGraphics = new PIXI.Graphics();
        testGraphics.beginFill(0xff0000); // Red circle
        testGraphics.drawCircle(this.getCenterX(), this.getCenterY(), 20);
        testGraphics.endFill();
        this.uiContainer.addChild(testGraphics);
        console.log('🔴 Test red circle added at center:', this.getCenterX(), this.getCenterY());
        
        // Add a test bead at a known position
        const testBead = new PIXI.Graphics();
        testBead.beginFill(0x00ff00); // Green circle
        testBead.drawCircle(0, 0, 15);
        testBead.endFill();
        testBead.x = this.getCenterX() + 100; // Offset from center
        testBead.y = this.getCenterY();
        this.beadContainer.addChild(testBead);
        console.log('🟢 Test green bead added at:', testBead.x, testBead.y);
    }
    
    getBeadPosition(bead) {
        const x = this.getCenterX() + Math.cos(bead.angle - Math.PI/2) * this.getTrackRadius();
        const y = this.getCenterY() + Math.sin(bead.angle - Math.PI/2) * this.getTrackRadius();
        return { x, y };
    }
    
    createBeadGraphics(bead) {
        const graphics = new PIXI.Graphics();
        const pos = this.getBeadPosition(bead);
        
        if (bead.type === BEAD_TYPES.TARGET) {
            // Calculate size with growth animation
            const baseSize = CONFIG.VISUAL.BEAD_SIZES.TARGET;
            const targetSize = this.getTargetZoneRadius() * 0.8; // Grow towards target zone size
            const currentSize = baseSize + (targetSize - baseSize) * bead.growthFactor;
            
            // Flash white when hit, otherwise normal pink color
            const color = (bead.flashTimer > 0) ? 0xffffff : CONFIG.COLORS.TARGET_BEAD;
            
            graphics.beginFill(color);
            graphics.drawCircle(0, 0, currentSize);
            graphics.endFill();
            
        } else if (bead.type === BEAD_TYPES.POINT_1) {
            // Normal white for point beads
            graphics.beginFill(CONFIG.COLORS.POINT_1);
            graphics.drawCircle(0, 0, this.getScaledBeadSize(CONFIG.VISUAL.BEAD_SIZES.POINT_1));
            graphics.endFill();
            
        } else if (bead.type === BEAD_TYPES.POINT_10) {
            // Draw triangle
            const size = this.getScaledBeadSize(CONFIG.VISUAL.BEAD_SIZES.POINT_10);
            graphics.beginFill(CONFIG.COLORS.POINT_1);
            graphics.moveTo(0, -size);
            graphics.lineTo(size * 0.87, size * 0.5);
            graphics.lineTo(-size * 0.87, size * 0.5);
            graphics.closePath();
            graphics.endFill();
            
        } else if (bead.type === BEAD_TYPES.POINT_50) {
            // Draw diamond
            const size = this.getScaledBeadSize(CONFIG.VISUAL.BEAD_SIZES.POINT_50);
            graphics.beginFill(CONFIG.COLORS.POINT_1);
            graphics.moveTo(0, -size);
            graphics.lineTo(size * 0.75, 0);
            graphics.lineTo(0, size);
            graphics.lineTo(-size * 0.75, 0);
            graphics.closePath();
            graphics.endFill();
            
        } else if (bead.type === BEAD_TYPES.POINT_100) {
            // Draw star
            const size = this.getScaledBeadSize(CONFIG.VISUAL.BEAD_SIZES.POINT_100);
            graphics.beginFill(CONFIG.COLORS.POINT_1);
            
            // Create star points
            const points = [];
            for (let i = 0; i < 5; i++) {
                // Outer point
                const outerAngle = (i * 2 * Math.PI / 5) - Math.PI/2;
                points.push(Math.cos(outerAngle) * size);
                points.push(Math.sin(outerAngle) * size);
                
                // Inner point
                const innerAngle = ((i + 0.5) * 2 * Math.PI / 5) - Math.PI/2;
                points.push(Math.cos(innerAngle) * size * 0.4);
                points.push(Math.sin(innerAngle) * size * 0.4);
            }
            
            graphics.drawPolygon(points);
            graphics.endFill();
        }
        
        graphics.x = pos.x;
        graphics.y = pos.y;
        
        return graphics;
    }
    
    createPulseGraphics(pulse) {
        const graphics = new PIXI.Graphics();
        const alpha = 1 - (pulse.timer / pulse.duration); // Fade out
        
        graphics
            .circle(pulse.x, pulse.y, pulse.radius)
            .stroke({ width: 1, color: 0xffffff, alpha: alpha });
        
        return graphics;
    }
    
    createMissFlashGraphics(flash) {
        const graphics = new PIXI.Graphics();
        const alpha = 1 - (flash.timer / flash.duration); // Fade out
        
        graphics
            .circle(flash.x, flash.y, flash.radius)
            .stroke({ width: 3, color: 0xff0000, alpha: alpha * 0.8 });
        
        return graphics;
    }
    
    createParticleGraphics(particle) {
        const graphics = new PIXI.Graphics();
        const alpha = particle.life; // Fade with life
        
        graphics
            .circle(particle.x, particle.y, particle.size * particle.life)
            .fill({ color: particle.color, alpha: alpha });
        
        return graphics;
    }
    
    createHealthPill(x, y, filled) {
        const graphics = new PIXI.Graphics();
        const width = 24;
        const height = 16;
        const cornerRadius = 8; // Half of height for rounded ends
        
        if (filled) {
            // Filled health pill - same color as target bead
            graphics
                .roundRect(x - width/2, y - height/2, width, height, cornerRadius)
                .fill({ color: CONFIG.COLORS.TARGET_BEAD });
        } else {
            // Empty health pill - just 1px stroke outline
            graphics
                .roundRect(x - width/2, y - height/2, width, height, cornerRadius)
                .stroke({ width: 1, color: CONFIG.COLORS.TARGET_BEAD });
        }
        
        return graphics;
    }
    
    updateTargetZone(gameState) {
        // Clear both graphics
        this.targetZoneGraphics.clear();
        this.nextTargetZoneGraphics.clear();
        
        // Clear bonus text container
        this.bonusTextContainer.removeChildren();
        
        // Draw current target zone (full opacity)
        if (gameState.currentTargetZone.spawned) {
            const targetX = this.getCenterX() + Math.cos(gameState.currentTargetZone.angle - Math.PI/2) * this.getTrackRadius();
            const targetY = this.getCenterY() + Math.sin(gameState.currentTargetZone.angle - Math.PI/2) * this.getTrackRadius();
            
            // Check if any target bead is in the zone
            let targetInZone = false;
            for (const bead of gameState.beads) {
                if (bead.type === BEAD_TYPES.TARGET && !bead.activated) {
                    let distance = Math.abs(bead.angle - gameState.currentTargetZone.angle);
                    if (distance > Math.PI) {
                        distance = 2 * Math.PI - distance;
                    }
                    if (distance <= CONFIG.TARGET.SIZE) {
                        targetInZone = true;
                        break;
                    }
                }
            }
            
            // Primary zone uses the calculated target zone radius
            const primaryRadius = this.getTargetZoneRadius();
            const strokeColor = targetInZone ? 0xffffff : CONFIG.COLORS.TRACK;
            
            this.targetZoneGraphics
                .circle(targetX, targetY, primaryRadius)
                .stroke({ width: this.getTargetZoneLineWidth(), color: strokeColor, alpha: 1.0 });
            
            // Draw +1 text if this zone has health bonus
            if (gameState.currentTargetZone.hasHealthBonus) {
                const bonusText = new PIXI.Text('+1', {
                    fontFamily: 'monospace',
                    fontSize: this.getScaledFontSize(14),
                    fill: CONFIG.COLORS.TARGET_BEAD,
                    align: 'center'
                });
                bonusText.anchor.set(0.5);
                bonusText.x = targetX;
                bonusText.y = targetY - primaryRadius - 20; // Position above the zone
                this.bonusTextContainer.addChild(bonusText);
            }
        }
        
        // Draw next target zone (50% opacity)
        if (gameState.nextTargetZone && gameState.nextTargetZone.spawned) {
            const nextX = this.getCenterX() + Math.cos(gameState.nextTargetZone.angle - Math.PI/2) * this.getTrackRadius();
            const nextY = this.getCenterY() + Math.sin(gameState.nextTargetZone.angle - Math.PI/2) * this.getTrackRadius();
            
            // Draw dashed circle for preview zone
            this.drawDashedCircle(
                this.nextTargetZoneGraphics,
                nextX, 
                nextY, 
                this.getTargetZoneRadius(),
                {
                    width: this.getPreviewZoneLineWidth(),
                    color: CONFIG.COLORS.TRACK,
                    alpha: 0.5,
                    dashLength: 8,
                    gapLength: 4
                }
            );
            
            // Draw +1 text if next zone has health bonus (also at 50% opacity)
            if (gameState.nextTargetZone.hasHealthBonus) {
                const bonusText = new PIXI.Text('+1', {
                    fontFamily: 'monospace',
                    fontSize: this.getScaledFontSize(14),
                    fill: CONFIG.COLORS.TARGET_BEAD,
                    align: 'center'
                });
                bonusText.anchor.set(0.5);
                bonusText.x = nextX;
                bonusText.y = nextY - this.getTargetZoneRadius() - 20; // Position above the zone
                bonusText.alpha = 0.5; // Match zone opacity
                this.bonusTextContainer.addChild(bonusText);
            }
        }
    }
    
    renderHealthDisplay(gameState) {
        // Update existing health pill graphics
        const width = 24;
        const height = 16;
        const cornerRadius = 8;
        
        for (let i = 0; i < this.healthPills.length; i++) {
            const graphics = this.healthPills[i];
            const filled = i < gameState.health;
            
            graphics.clear();
            
            if (filled) {
                // Filled health pill - same color as target bead
                graphics
                    .roundRect(-width/2, -height/2, width, height, cornerRadius)
                    .fill({ color: CONFIG.COLORS.TARGET_BEAD });
            } else {
                // Empty health pill - just 1px stroke outline
                graphics
                    .roundRect(-width/2, -height/2, width, height, cornerRadius)
                    .stroke({ width: 1, color: CONFIG.COLORS.TARGET_BEAD });
            }
        }
    }
    
    render(gameState) {
        // Clear previous frame (but not UI container - it has persistent elements)
        this.beadContainer.removeChildren();
        this.effectContainer.removeChildren();
        
        // Update target zone position
        this.updateTargetZone(gameState);
        
        // Update health display (always visible)
        this.renderHealthDisplay(gameState);
        
        // Update high score display
        this.highScoreText.text = `HS: ${gameState.highScore}`;
        
        // Update miss flash effect
        this.updateMissFlash(gameState);
        
        // Only render game elements if playing or in debug mode
        if (gameState.currentState === GAME_STATES.PLAYING || CONFIG.DEBUG.ENABLED) {
            // Only log once to avoid spam
            if (!this._renderLoggedOnce) {
                console.log(`🎨 Rendering ${gameState.beads.length} beads, debug enabled: ${CONFIG.DEBUG.ENABLED}`);
                // Log first bead details for debugging
                if (gameState.beads.length > 0) {
                    const firstBead = gameState.beads[0];
                    const pos = this.getBeadPosition(firstBead);
                    console.log(`🔵 First bead: type=${firstBead.type}, pos=(${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}), angle=${firstBead.angle}`);
                }
                this._renderLoggedOnce = true;
            }
            
            // Render beads (only render TARGET beads for now)
            gameState.beads.forEach((bead, index) => {
                // Skip rendering point beads
                if (bead.type !== BEAD_TYPES.TARGET) {
                    return;
                }
                
                const beadGraphics = this.createBeadGraphics(bead);
                this.beadContainer.addChild(beadGraphics);
                
                // Show debug info if enabled
                if (CONFIG.DEBUG.SHOW_ANGLES) {
                    const pos = this.getBeadPosition(bead);
                    const debugText = new PIXI.Text(
                        `${index + 1}\n${(bead.angle * 180 / Math.PI).toFixed(1)}°`,
                        {
                            fontFamily: 'Arial',
                            fontSize: 12,
                            fill: 0xffff00
                        }
                    );
                    debugText.x = pos.x + 25;
                    debugText.y = pos.y - 10;
                    this.beadContainer.addChild(debugText);
                }
            });
            
            // Render pulse effects
            gameState.pulseEffects.forEach(pulse => {
                const pulseGraphics = this.createPulseGraphics(pulse);
                this.effectContainer.addChild(pulseGraphics);
            });
            
            // Render miss flash effects
            gameState.missFlashes.forEach(flash => {
                const flashGraphics = this.createMissFlashGraphics(flash);
                this.effectContainer.addChild(flashGraphics);
            });
            
            // Render particle effects
            gameState.particles.forEach(particle => {
                const particleGraphics = this.createParticleGraphics(particle);
                this.effectContainer.addChild(particleGraphics);
            });
        }
        
        // Render debug mode text overlay
        if (CONFIG.DEBUG.ENABLED) {
            this.renderDebugOverlay(gameState);
        }
    }
    
    triggerMissFlash() {
        this.missFlashProgress = 1.0; // Start at full intensity
    }
    
    updateMissFlash(gameState) {
        // Check for new misses in the game state
        if (gameState.missFlashes.length > 0 && this.missFlashProgress === 0) {
            this.triggerMissFlash();
        }
        
        if (this.missFlashProgress > 0) {
            // Update flash overlay
            this.flashOverlay.clear();
            
            // Draw semi-transparent red overlay
            const alpha = this.missFlashProgress * 0.3; // Max 30% opacity
            this.flashOverlay
                .rect(0, 0, CONFIG.WINDOW.WIDTH, CONFIG.WINDOW.HEIGHT)
                .fill({ color: CONFIG.COLORS.TARGET_BEAD, alpha: alpha });
            
            // Update track border with white flash
            this.trackGraphics.clear();
            const trackAlpha = this.missFlashProgress;
            const trackColor = 0xffffff; // White during flash
            
            // Blend between white and normal track color
            const r1 = (trackColor >> 16) & 0xFF;
            const g1 = (trackColor >> 8) & 0xFF;
            const b1 = trackColor & 0xFF;
            
            const r2 = (CONFIG.COLORS.TRACK >> 16) & 0xFF;
            const g2 = (CONFIG.COLORS.TRACK >> 8) & 0xFF;
            const b2 = CONFIG.COLORS.TRACK & 0xFF;
            
            const r = Math.floor(r1 * trackAlpha + r2 * (1 - trackAlpha));
            const g = Math.floor(g1 * trackAlpha + g2 * (1 - trackAlpha));
            const b = Math.floor(b1 * trackAlpha + b2 * (1 - trackAlpha));
            
            const blendedColor = (r << 16) | (g << 8) | b;
            
            this.trackGraphics
                .circle(this.getCenterX(), this.getCenterY(), this.getTrackRadius())
                .stroke({ width: this.getTrackLineWidth(), color: blendedColor });
            
            // Decay the flash effect
            this.missFlashProgress = Math.max(0, this.missFlashProgress - 0.04); // ~25 frames to fade
        } else if (this.trackGraphics.alpha < 1) {
            // Ensure track is back to normal after flash
            this.trackGraphics.clear();
            this.trackGraphics
                .circle(this.getCenterX(), this.getCenterY(), this.getTrackRadius())
                .stroke({ width: this.getTrackLineWidth(), color: CONFIG.COLORS.TRACK });
        }
    }
    
    renderDebugOverlay(gameState) {
        // Create debug text container if it doesn't exist
        if (!this.debugTextContainer) {
            this.debugTextContainer = new PIXI.Container();
            this.uiContainer.addChild(this.debugTextContainer);
        }
        
        // Clear previous debug texts
        this.debugTextContainer.removeChildren();
        
        const debugTexts = [
            "DEBUG MODE - Chain Test",
            `Beads: ${gameState.beads.length} | Spacing: ${(CONFIG.MOVEMENT.BEAD_SPACING * 180 / Math.PI).toFixed(1)}°`,
            "Press 'R' to reset chain",
            "Press 'D' to toggle debug mode"
        ];
        
        debugTexts.forEach((text, index) => {
            const textSprite = new PIXI.Text(text, {
                fontFamily: 'Arial',
                fontSize: 18,
                fill: CONFIG.COLORS.UI_TEXT
            });
            textSprite.x = 50;
            textSprite.y = 50 + index * 40;
            this.debugTextContainer.addChild(textSprite);
        });
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.GameRenderer = GameRenderer;
}

console.log('🎨 GameRenderer class loaded');