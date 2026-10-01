# Gameverse Arena

A polished browser-based arcade showcase featuring 8 multiplayer-inspired game concepts built with HTML, CSS, and vanilla JavaScript.

## Overview

This project presents original concepts with distinct mechanics, AI opponents, round-based progression, and sound effects:

- **ChopChop.io** — Lumberjack battle in a shrinking forest. Harvest wood faster than rival crews while evading AI enemies.
- **Blob Magnet** — Magnetic arena chaos with attract/repel physics. Switch polarity to dodge AI drones while collecting debris.
- **Neon Line Racer** — Neon trail survival arena. Outrun an AI rival and navigate randomized obstacles in a high-speed lane.
- **SyncDefenders** — Rhythm-based co-op tower defense. Sync your towers to the beat and hold off an AI swarm.
- **Escape the Code** — Cooperative puzzle and code-based escape. Solve the clue sequence before time runs out with AI hints.
- **Pixel Art Heist** — Social deduction with rotating camera feeds. Catch the thief on the right feed before security fails.
- **GridCommand** — Fast 10-second tactical grid combat. Command units to eliminate enemies on a grid before the timer ends.
- **DeckBuilder Arena** — Shared-pool card battlefield. Play cards to defeat the AI champion in a resource-based duel.

## Features

✅ **Sound Effects** — Toggle audio and hear distinct sound cues for hits, wins, losses, and gameplay events  
✅ **Round System** — Track wins, losses, and progression across multiple rounds  
✅ **Result Screens** — Victory and defeat overlays with scores and narrative flavor  
✅ **AI Opponents** — Stateful AI rivals that react to player behavior  
✅ **Polished Gameplay** — Each game has distinct difficulty curves, win/loss conditions, and progression mechanics  

## Live Demo

Open `index.html` directly in a browser, or run a local web server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Project Structure

```text
multiplayer-games/
├── index.html      (UI layout with round tracker and sound toggle)
├── style.css       (Dark theme, result overlays, responsive design)
├── script.js       (Game engine, AI logic, round state machine)
├── README.md       (This file)
```

## Game Controls

### ChopChop.io
- **W, A, S, D** — Move your lumberjack
- **Space** — Chop nearby trees
- **Win Condition** — Harvest 180+ wood or reach level 8
- **Lose Condition** — Health reaches 0 from enemy contact

### Blob Magnet
- **Arrow Keys** — Move your blob
- **Q** — Switch to negative polarity
- **E** — Switch to positive polarity
- **Win Condition** — Collect 180+ debris
- **Lose Condition** — Lives reach 0 from drone contact

### Neon Line Racer
- **Arrow Keys** — Steer your racer
- **Win Condition** — Score 1200+ points without hitting obstacles
- **Lose Condition** — Health reaches 0 or AI racer boxes you in

### SyncDefenders
- **Visual Only** — Rhythm towers auto-fire on the beat
- **Win Condition** — Eliminate all AI enemies before base health depletes
- **Lose Condition** — Base health reaches 0

### Escape the Code
- **Mouse Click** — Select buttons A–D to match the clue sequence
- **Win Condition** — Solve the 4-button puzzle before time expires
- **Lose Condition** — 90 seconds elapse without solving

### Pixel Art Heist
- **Mouse Click** — Click the highlighted camera feed to tag the thief
- **Win Condition** — Tag the thief 3 times
- **Lose Condition** — Security level reaches 0

### GridCommand
- **Mouse Click** — Click a unit to select, then click an adjacent tile to move
- **Engage** — Move units adjacent to enemies to deal damage
- **Win Condition** — Eliminate all enemies in 10 seconds
- **Lose Condition** — Timer expires

### DeckBuilder Arena
- **Mouse Click** — Click a card to play it and damage the enemy
- **Win Condition** — Reduce enemy HP to 0
- **Lose Condition** — Your HP reaches 0

## Design Philosophy

Each game shares a common round framework but with unique mechanics:

1. **Audio System** — Sound toggle persists across all games. Each game has distinct audio cues.
2. **Win/Loss Flow** — All games feed into a unified result screen with score calculation.
3. **AI Behavior** — AI rivals scale in difficulty across rounds. Some are aggressive, others tactical.
4. **Progression** — Winning raises the round counter and difficulty. Losing adds narrative to the next attempt.
5. **Replayability** — Random spawn positions and procedural challenges keep each playthrough fresh.

## Technical Stack

- **HTML5** — Canvas-based rendering for performance
- **CSS3** — Glassmorphism UI, animations, and responsive layout
- **Vanilla JavaScript** — Pure ES6 with no dependencies
- **Web Audio API** — Procedurally generated sound effects

## Polishing & Balance

Each game has been tuned for:

- **Difficulty Curve** — Early rounds feel achievable; later rounds scale intelligently.
- **Feedback** — Sound effects, visual cues, and metrics make every action feel responsive.
- **Narrative** — Result screens tell a story for each game and AI opponent.
- **Replayability** — Randomization and AI variability ensure fresh matches.

## Future Enhancements

- Leaderboard and persistent stats with localStorage
- Difficulty settings (Easy, Normal, Hard, Nightmare)
- Tournament mode with best-of-three matches
- Cosmetic unlockables and themes
- Multiplayer local co-op support

## License

This project is for educational and prototype use.
