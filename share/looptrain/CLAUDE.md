# LoopTrain Development Guidelines

## Documentation Standards
- Keep all markdown files up to date with implementation changes
- Document all major design decisions in PROJECT.md
- Maintain concise, organized documentation
- Update system architecture when adding new features

## Code Organization
- Think in systems - separate concerns into logical modules
- Keep game state management clean and predictable
- Use clear, descriptive variable and function names
- Comment complex algorithms but avoid over-commenting

## Development Priorities
1. Core gameplay loop first
2. Visual polish and effects second
3. Audio and additional features last

## File Structure
- `main.lua` - Main game loop and entry point
- `conf.lua` - Love2d configuration
- `systems/` - Game systems (if modularized)
- `PROJECT.md` - Project documentation and decisions
- `README.md` - User-facing documentation