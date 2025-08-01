# LoopTrain Project Documentation

## Overview
LoopTrain is a rhythm-based timing game where players tap/click when target beads pass through a target zone on a circular track. Successful hits build chains that combine into higher-value beads.

## Architecture Decisions

### Game State Management
- Single game state object containing all dynamic game data
- Three distinct game states: START, PLAYING, GAME_OVER
- Clear separation between update logic and rendering
- Frame-rate independent movement using delta time
- Game ends when player misses a target bead in the target zone

### Coordinate System
- Window: 1200x1200 pixels (square aspect ratio)
- Track center: (600, 600)
- Track radius: 480 pixels (40% of window height)
- All angles in radians, 0 = top of circle, clockwise rotation

### Bead System Architecture
```
BeadTypes:
- TARGET: Pink/magenta bead that spawns regularly
- POINT_1: White dot created from successful hits
- POINT_10: Triangle created from 10x POINT_1
- POINT_50: Diamond created from 5x POINT_10  
- POINT_100: Star created from 2x POINT_50
```

### Chain Building Logic
- Beads stored in ordered array maintaining chain sequence
- Automatic combination checks after each frame
- Visual interpolation for smooth transitions

### Timing System
- Target zone collision uses angular distance
- Timing window: ~15 degrees (adjustable)
- Input accepted via mouse click or spacebar
- Two fail conditions:
  1. Target bead leaves zone without being hit
  2. Player taps when target is in zone but misses

## Technical Implementation

### Core Systems
1. **Movement System**: Handles circular motion of all beads
2. **Input System**: Processes player timing inputs
3. **Collision System**: Detects bead-target zone overlap
4. **Chain System**: Manages bead combinations and scoring
5. **Render System**: Draws all visual elements

### Performance Considerations
- Minimal object creation during gameplay
- Efficient collision detection using angular math
- Batch rendering where possible

## Visual Design
- Dark navy background (#1a2332)
- Orange/coral track (#ff6b47)
- Clean, minimalist aesthetic
- High contrast for gameplay clarity

## Future Expansion Points
- Difficulty progression system
- Multiple simultaneous target beads
- Power-up system
- Persistent high scores
- Audio/music synchronization