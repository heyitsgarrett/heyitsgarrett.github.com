// LoopTrain Input Handler - Mouse, Keyboard, and Touch Input
// Handles all user input including timing-sensitive taps

class InputHandler {
    constructor(game) {
        this.game = game;
        this.canvas = game.app.canvas;
        this.touchHitbox = document.getElementById('touchHitbox');
        
        this.setupEventListeners();
        console.log('🎯 InputHandler initialized');
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch events (for mobile)
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Touch hitbox events for mobile firing
        this.touchHitbox.addEventListener('touchstart', (e) => this.handleHitboxTouch(e));
        this.touchHitbox.addEventListener('mousedown', (e) => this.handleHitboxMouse(e));
        
        // Keyboard events
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Prevent touch scrolling on the canvas
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        this.touchHitbox.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
        
        console.log('🎯 Event listeners set up for mouse, touch, and keyboard');
    }
    
    handleMouseDown(event) {
        if (event.button === 0) { // Left mouse button
            console.log('🖱️ Mouse click detected');
            this.handleTap(event.clientX, event.clientY);
        }
    }
    
    handleMouseUp(event) {
        // Currently not used, but could be useful for hold/release mechanics
    }
    
    handleTouchStart(event) {
        event.preventDefault(); // Prevent mouse events from firing
        
        if (event.touches.length === 1) { // Single finger touch
            const touch = event.touches[0];
            console.log('👆 Touch detected');
            this.handleTap(touch.clientX, touch.clientY);
        }
    }
    
    handleTouchEnd(event) {
        event.preventDefault();
        // Currently not used, but could be useful for hold/release mechanics
    }
    
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        console.log(`⌨️ Key pressed: ${key}`);
        
        switch (key) {
            case ' ': // Spacebar
            case 'spacebar':
                event.preventDefault();
                this.handleSpacebar();
                break;
                
            case 'r':
                if (CONFIG.DEBUG.ENABLED) {
                    console.log('🔄 Debug: Resetting chain');
                    this.game.createDebugChain();
                }
                break;
                
            case 'd':
                console.log('🐛 Toggling debug mode');
                this.toggleDebugMode();
                break;
                
            case 'escape':
                console.log('🚪 Escape pressed - could add pause menu here');
                // Could add pause functionality here
                break;
                
            default:
                // Ignore other keys
                break;
        }
    }
    
    handleTap(clientX, clientY) {
        // Get canvas bounds to convert screen coordinates to canvas coordinates
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;
        
        // Scale coordinates if canvas is scaled
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const gameX = canvasX * scaleX;
        const gameY = canvasY * scaleY;
        
        console.log(`🎯 Tap at canvas coords (${gameX.toFixed(1)}, ${gameY.toFixed(1)})`);
        
        // Handle tap based on current game state
        if (this.game.gameState.currentState === GAME_STATES.START) {
            // Start screen - check if tapping in start area
            this.handleStartScreenTap();
        } else if (this.game.gameState.currentState === GAME_STATES.PLAYING) {
            // Playing - handle target bead hitting
            this.game.handleTap();
        } else if (this.game.gameState.currentState === GAME_STATES.GAME_OVER) {
            // Game over screen - check if tapping in restart area
            this.handleGameOverScreenTap();
        }
    }
    
    handleHitboxTouch(event) {
        event.preventDefault();
        if (this.game.gameState.currentState === GAME_STATES.PLAYING) {
            console.log('📱 Touch on hitbox - firing!');
            this.game.handleTap();
        }
    }
    
    handleHitboxMouse(event) {
        if (event.button === 0 && this.game.gameState.currentState === GAME_STATES.PLAYING) {
            console.log('🖱️ Mouse click on hitbox - firing!');
            this.game.handleTap();
        }
    }
    
    handleSpacebar() {
        if (this.game.gameState.currentState === GAME_STATES.START) {
            console.log('🎮 Spacebar: Starting game');
            this.game.startGame();
        } else if (this.game.gameState.currentState === GAME_STATES.PLAYING) {
            console.log('🎯 Spacebar: Attempting to hit target');
            this.game.handleTap();
        } else if (this.game.gameState.currentState === GAME_STATES.GAME_OVER) {
            console.log('🔄 Spacebar: Restarting game');
            this.game.restartGame();
        }
    }
    
    handleStartScreenTap() {
        // For touch/mouse, we'll just start the game on any tap
        // The HTML buttons handle the specific button clicks
        console.log('📱 Start screen tap - starting game');
        this.game.startGame();
    }
    
    handleGameOverScreenTap() {
        // For touch/mouse, we'll just restart the game on any tap
        // The HTML buttons handle the specific button clicks
        console.log('🔄 Game over screen tap - restarting game');
        this.game.restartGame();
    }
    
    toggleDebugMode() {
        CONFIG.DEBUG.ENABLED = !CONFIG.DEBUG.ENABLED;
        console.log(`🐛 Debug mode: ${CONFIG.DEBUG.ENABLED ? 'ON' : 'OFF'}`);
        
        if (CONFIG.DEBUG.ENABLED) {
            this.game.createDebugChain();
            // Show debug info
            document.getElementById('debugInfo').style.display = 'block';
        } else {
            // Hide debug info
            document.getElementById('debugInfo').style.display = 'none';
            // Reset to start screen
            this.game.resetGame();
            this.game.gameState.currentState = GAME_STATES.START;
            this.game.showStartScreen();
        }
    }
    
    // Utility method to check if a point is within a circular area
    isPointInCircle(pointX, pointY, circleX, circleY, radius) {
        const dx = pointX - circleX;
        const dy = pointY - circleY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= radius;
    }
    
    // Utility method to check if a point is within a rectangular area
    isPointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
        return pointX >= rectX && pointX <= rectX + rectWidth &&
               pointY >= rectY && pointY <= rectY + rectHeight;
    }
    
    // Method to get the current pointer position (mouse or touch)
    getCurrentPointerPosition(event) {
        let clientX, clientY;
        
        if (event.touches && event.touches.length > 0) {
            // Touch event
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            // Mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        }
        
        // Convert to canvas coordinates
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = clientX - rect.left;
        const canvasY = clientY - rect.top;
        
        // Scale coordinates if canvas is scaled
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: canvasX * scaleX,
            y: canvasY * scaleY
        };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.InputHandler = InputHandler;
}

console.log('🎯 InputHandler class loaded');