# LoopTrain

A rhythm-based timing game built with Love2D where players tap when beads pass through the target zone to build chains and score points.

## How to Play
- Press START or spacebar to begin
- Click or press spacebar when the pink target bead enters the orange target zone (top of the circle)
- Successfully timed hits create white point beads that follow in a chain
- Chain beads automatically combine:
  - 10 white dots → 1 triangle (10 points)
  - 5 triangles → 1 diamond (50 points)
  - 2 diamonds → 1 star (100 points)
- Game ends if you:
  - Let a target bead pass through the zone without hitting it
  - Click/tap but miss the target bead
- Try to build the longest chain possible!

## Running the Game
1. Install [Love2D](https://love2d.org/) (version 11.4 or higher)
2. Run from the project directory:
   ```bash
   love .
   ```

## Controls
- **Mouse Click** or **Spacebar**: Activate target bead when in target zone

## Project Structure
- `main.lua` - Main game logic and systems
- `conf.lua` - Love2D configuration
- `PROJECT.md` - Technical documentation
- `CLAUDE.md` - Development guidelines