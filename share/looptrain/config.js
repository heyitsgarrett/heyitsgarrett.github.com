// LoopTrain Configuration
// All game constants and settings converted from Love2D version

const CONFIG = {
    // Window Settings (will be dynamically calculated)
    WINDOW: {
        get WIDTH() {
            const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
            return Math.max(400, size); // Minimum 400px
        },
        get HEIGHT() {
            const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
            return Math.max(400, size); // Minimum 400px
        },
        TITLE: "LoopTrain"
    },

    // Game World
    WORLD: {
        get CENTER_X() { return CONFIG.WINDOW.WIDTH / 2; },
        get CENTER_Y() { return CONFIG.WINDOW.HEIGHT / 2; },
        get TRACK_RADIUS() { return CONFIG.WINDOW.HEIGHT * 0.35; } // 35% of window height
    },

    // Movement & Timing
    MOVEMENT: {
        REVOLUTION_TIME: 2.0,                           // Time for one full revolution in seconds
        get BEAD_SPEED() { return (2 * Math.PI) / 2.0; }, // Calculated from revolution time
        BEAD_SPACING: 0.5,                              // Angular spacing between beads in radians (~29 degrees)
        SPAWN_DELAY: 0.3,                               // Delay after activation before spawning new target
        SPEED_INCREASE_RATE: 0.02                      // Speed multiplier increase per second (2% per second)
    },

    // Debug Settings
    DEBUG: {
        ENABLED: false,          // Enable debug mode (disabled for normal gameplay)
        CHAIN_LENGTH: 7,         // Number of beads in debug chain
        SHOW_ANGLES: true,       // Show bead angles as text
        SHOW_TIMING: true,       // Show real-time timing debug info
        SHOW_HIT_INFO: true      // Show hit precision and results
    },

    // Timing & Animation
    TIMING: {
        PERFECT_HIT_THRESHOLD: 0.05,  // Radians for "perfect" hit (flash white)
        BEAD_GROW_START: 0.3,         // When to start growing (radians before target)
        FLASH_DURATION: 0.4         // How long the white flash lasts
    },

    // Target Zones - multiple zones the target bead must pass through
    TARGET: {
        ZONES: [
            {
                ANGLE: 0,                // Top of circle (12 o'clock)
                SIZE: Math.PI / 12,      // ~15 degrees
                RADIUS: 35               // Visual radius of target zone circle
            }
            // Add more zones here for multiple target areas:
            // { ANGLE: Math.PI, SIZE: Math.PI / 12, RADIUS: 35 }  // Bottom
            // { ANGLE: Math.PI / 2, SIZE: Math.PI / 12, RADIUS: 35 }  // Right
        ],
        // For backwards compatibility
        get ANGLE() { return this.ZONES[0].ANGLE; },
        get SIZE() { return this.ZONES[0].SIZE; },
        get RADIUS() { return this.ZONES[0].RADIUS; }
    },

    // Visual Settings
    VISUAL: {
        TRACK_LINE_WIDTH: 3,
        TARGET_LINE_WIDTH: 4,
        BEAD_SIZES: {
            TARGET: 20,
            POINT_1: 10,
            POINT_10: 15,
            POINT_50: 20,
            POINT_100: 25
        }
    },

    // Colors (converted from Love2D 0-1 range to hex)
    COLORS: {
        BACKGROUND: 0x1a2332,      // { 26/255, 35/255, 50/255 }
        TRACK: 0xff6b47,           // { 1, 107/255, 71/255 }
        TARGET_BEAD: 0xff1493,     // { 1, 20/255, 147/255 } - Deep Pink
        POINT_1: 0xffffff,         // { 1, 1, 1 } - White
        SCORE_TEXT: 0xffffff,      // { 1, 1, 1 } - White
        UI_TEXT: 0xe5e5e5,         // { 0.9, 0.9, 0.9 }
        UI_BUTTON: 0x4d4d66,       // { 0.3, 0.3, 0.4 }
        UI_BUTTON_HOVER: 0x666680  // { 0.4, 0.4, 0.5 }
    },

    // Scoring & Combinations
    SCORING: {
        POINT_1_VALUE: 1,
        POINT_10_VALUE: 10,
        POINT_50_VALUE: 50,
        POINT_100_VALUE: 100,
        COMBINATIONS: {
            POINT_1_TO_10: 10,  // 10 POINT_1 → 1 POINT_10
            POINT_10_TO_50: 5,  // 5 POINT_10 → 1 POINT_50
            POINT_50_TO_100: 2  // 2 POINT_50 → 1 POINT_100
        }
    },

    // Font Sizes (converted to web-appropriate sizes)
    FONTS: {
        TITLE: '72px Arial, sans-serif',
        LARGE: '48px Arial, sans-serif',
        MEDIUM: '32px Arial, sans-serif',
        NORMAL: '24px Arial, sans-serif',
        SMALL: '16px Arial, sans-serif'
    },

    // UI Layout
    UI: {
        START_BUTTON: {
            width: 200,
            height: 60,
            y_offset: 100 // Offset from center
        },
        RESTART_BUTTON: {
            width: 200,
            height: 60,
            y_offset: 150 // Offset from center
        }
    }
};

// Bead Types
const BEAD_TYPES = {
    TARGET: "TARGET",
    POINT_1: "POINT_1",
    POINT_10: "POINT_10",
    POINT_50: "POINT_50",
    POINT_100: "POINT_100"
};

// Game States
const GAME_STATES = {
    START: "START",
    PLAYING: "PLAYING",
    GAME_OVER: "GAME_OVER"
};

// Export for browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.BEAD_TYPES = BEAD_TYPES;
    window.GAME_STATES = GAME_STATES;
}

console.log('⚙️ Config loaded - Window size:', CONFIG.WINDOW.WIDTH, 'x', CONFIG.WINDOW.HEIGHT);
console.log('⚙️ Track radius:', CONFIG.WORLD.TRACK_RADIUS, 'px');
console.log('⚙️ Bead speed:', CONFIG.MOVEMENT.BEAD_SPEED, 'rad/s');
console.log('⚙️ Bead spacing:', CONFIG.MOVEMENT.BEAD_SPACING, 'rad');
console.log('⚙️ Revolution time:', CONFIG.MOVEMENT.REVOLUTION_TIME, 's');