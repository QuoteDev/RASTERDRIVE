# RASTERDRIVE

A Tetris-inspired roguelike score-chaser with massive synergies, pixel-perfect visuals, and excellent moment-to-moment feel.

## Visual Identity

RASTERDRIVE fuses two distinct aesthetics:
- **Animal Well's** dark, luminous, raster-based atmosphere with slow parallax silhouettes
- **Balatro's** high-clarity, objective-first, synergy-driven UI with readable numbers

The result: a 1990s pixel-workstation vibe with crisp pixels, solid inks (≥85%), and strategic depth.

## Tech Stack

- **Vite + TypeScript** (strict mode)
- **PixiJS 7** for pixel-perfect rendering  
- **Howler.js** for audio (planned)
- **Vitest** for testing (planned)

### Rendering
- Internal resolution: **384×216** pixels
- Integer scaling with NEAREST sampling
- Pixel-snapped coordinates
- Letterbox bars maintain aspect ratio

## Controls

| Action | Key |
|--------|-----|
| Move Left/Right | Arrow Keys ←/→ |
| Soft Drop | Arrow Down ↓ |
| Hard Drop | Space |
| Rotate CW | Arrow Up ↑ |
| Rotate CCW | Z |
| Rotate 180° | A |
| Hold Piece | C |
| Pause | Escape |

*All keys rebindable (in progress)*

## Development

### Setup
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```
Open http://localhost:3000

### Build
```bash
npm run build
```

## Current Status

### ✅ Implemented
- Pixel-perfect rendering (384×216, integer scaling)
- Input system with DAS/ARR
- SRS rotation with wall kicks
- 10×20 Well with collision detection
- Queue (5 pieces) and Hold
- Gravity and lock delay
- Line clearing
- Base scoring + Rev multiplier
- Weighted piece generator with anti-famine
- HUD (Stage Total, Target, Rev, Credits)

### 🚧 Next Up
- Modules system (30 day-one modules)
- Badges (Echo, Cache, Seal)
- Junk deck with forecast UI
- Showcases (10 boss variants)
- Visual effects (glow, CRT, particles)

See full design spec in the repository for complete feature roadmap.

---

**Generated with Claude Code** • Early development build
