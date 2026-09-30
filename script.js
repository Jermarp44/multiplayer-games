:root {
  --bg-1: #050b14;
  --bg-2: #0d1a2a;
  --bg-3: #111f33;
  --panel: rgba(12, 18, 29, 0.82);
  --panel-soft: rgba(16, 25, 39, 0.72);
  --border: rgba(148, 171, 255, 0.18);
  --text: #edf6ff;
  --muted: #a9bfd8;
  --cyan: #67e8f9;
  --blue: #60a5fa;
  --purple: #a78bfa;
  --pink: #f472b6;
  --green: #4ade80;
  --gold: #fbbf24;
  --red: #f87171;
  --shadow: rgba(2, 6, 23, 0.68);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(103, 232, 249, 0.12), transparent 22%),
    radial-gradient(circle at bottom right, rgba(167, 139, 250, 0.12), transparent 20%),
    linear-gradient(140deg, var(--bg-1), var(--bg-2) 38%, var(--bg-3));
}

button {
  font: inherit;
}

.page-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 36px 36px;
  mask-image: radial-gradient(circle at center, black 30%, transparent 92%);
}

.container {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  margin: 0 auto;
  padding: 38px 22px 48px;
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 28px;
  margin-bottom: 28px;
}

.eyebrow {
  display: inline-block;
  margin: 0 0 12px;
  letter-spacing: 0.18em;
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--cyan);
}

.hero h1 {
  margin: 0;
  font-size: clamp(2.8rem, 5vw, 5rem);
  line-height: 0.95;
  letter-spacing: -0.06em;
}

.hero-copy p {
  max-width: 680px;
  margin: 18px 0 0;
  color: var(--muted);
  font-size: 1.04rem;
  line-height: 1.7;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(120px, 1fr));
  gap: 16px;
  min-width: min(480px, 100%);
}

.stat-box {
  background: rgba(10, 19, 31, 0.72);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  backdrop-filter: blur(10px);
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.12);
}

.stat-box strong {
  font-size: clamp(1.4rem, 2vw, 2rem);
  color: var(--text);
}

.stat-box span {
  color: var(--muted);
  font-size: 0.82rem;
}

.layout {
  display: grid;
  grid-template-columns: minmax(260px, 350px) 1fr;
  gap: 22px;
}

.sidebar,
.stage-panel {
  background: rgba(10, 15, 24, 0.72);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(10px);
}

.sidebar {
  padding: 18px 16px 16px;
}

.sidebar-header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding: 6px 4px 10px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.2rem;
}

.sidebar-header span {
  color: var(--muted);
  font-size: 0.76rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.game-list {
  display: grid;
  gap: 10px;
}

.game-item {
  width: 100%;
  border: 1px solid rgba(255,255,255,0.04);
  background: linear-gradient(180deg, rgba(16, 25, 39, 0.96), rgba(7, 12, 19, 0.9));
  color: var(--text);
  border-radius: 16px;
  padding: 14px 14px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.game-item:hover,
.game-item.active {
  transform: translateY(-1px);
  border-color: rgba(103, 232, 249, 0.4);
  box-shadow: 0 12px 22px rgba(96, 165, 250, 0.12);
}

.game-icon {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(103, 232, 249, 0.22), rgba(167, 139, 250, 0.22));
  font-size: 1.5rem;
}

.game-copy {
  flex: 1;
  min-width: 0;
}

.game-copy h3 {
  margin: 0;
  font-size: 1rem;
}

.game-copy p {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 0.76rem;
  line-height: 1.5;
}

.stage-panel {
  padding: 18px;
}

.stage-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.panel-tag {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cyan);
}

.stage-topbar h2 {
  margin: 0;
  font-size: clamp(1.6rem, 2vw, 2.3rem);
  letter-spacing: -0.04em;
}

.ghost-button {
  appearance: none;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  color: var(--text);
  border-radius: 12px;
  padding: 10px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ghost-button:hover {
  border-color: rgba(103, 232, 249, 0.45);
  background: rgba(103, 232, 249, 0.08);
}

.stage {
  min-height: 620px;
  border: 1px solid var(--border);
  border-radius: 22px;
  background: linear-gradient(180deg, rgba(12, 18, 29, 0.78), rgba(6, 10, 18, 0.92));
  overflow: hidden;
  position: relative;
}

.empty-state {
  display: grid;
  place-items: center;
}

.empty-copy {
  text-align: center;
  max-width: 420px;
  padding: 32px 20px;
  color: var(--muted);
}

.orb {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  margin: 0 auto 20px;
  background: radial-gradient(circle at 30% 30%, #dffaff, #60a5fa 24%, #a78bfa 50%, rgba(103,232,249,0.1) 100%);
  box-shadow: 0 0 25px rgba(103, 232, 249, 0.3);
}

.empty-copy h3 {
  margin: 0 0 10px;
  font-size: clamp(2rem, 3vw, 2.7rem);
  color: var(--text);
}

.empty-copy p {
  margin: 0;
  line-height: 1.7;
}

.game-shell {
  width: 100%;
  height: 100%;
  padding: 18px;
}

.game-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 2px 4px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  margin-bottom: 18px;
}

.game-meta strong {
  font-size: 1.1rem;
}

.metrics {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.metric {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  color: var(--muted);
  font-size: 0.76rem;
  letter-spacing: 0.02em;
}

.canvas-holder {
  width: 100%;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 10px;
}

canvas {
  display: block;
  width: min(100%, 980px);
  height: auto;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  background: #0b1320;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.02);
}

@media (max-width: 980px) {
  .hero,
  .stage-topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .layout {
    grid-template-columns: 1fr;
  }

  .hero-stats {
    width: 100%;
    min-width: 0;
  }
}

@media (max-width: 560px) {
  .container {
    padding-left: 14px;
    padding-right: 14px;
  }

  .hero-stats {
    grid-template-columns: 1fr;
  }

  .game-item {
    padding: 12px;
  }

  .game-shell {
    padding: 12px;
  }
}
