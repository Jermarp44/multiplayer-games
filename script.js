const games = [
  { id: 'chopchop', name: 'ChopChop.io', icon: '🪓', summary: 'Forest battle arena', accent: '#67e8f9', init: initChopChop },
  { id: 'blob', name: 'Blob Magnet', icon: '🧲', summary: 'Magnetic chaos arena', accent: '#a78bfa', init: initBlobMagnet },
  { id: 'neon', name: 'Neon Line Racer', icon: '🚦', summary: 'Glow-path survival', accent: '#f472b6', init: initNeonRacer },
  { id: 'sync', name: 'SyncDefenders', icon: '🎵', summary: 'Rhythm tower defense', accent: '#60a5fa', init: initSyncDefenders },
  { id: 'escape', name: 'Escape the Code', icon: '💻', summary: 'Co-op clue puzzle', accent: '#4ade80', init: initEscapeTheCode },
  { id: 'heist', name: 'Pixel Art Heist', icon: '🕵️', summary: 'Security feed deduction', accent: '#fbbf24', init: initPixelHeist },
  { id: 'grid', name: 'GridCommand', icon: '⚙️', summary: '10-second tactics', accent: '#f87171', init: initGridCommand },
  { id: 'deck', name: 'DeckBuilder Arena', icon: '🃏', summary: 'Shared-pool card duel', accent: '#c084fc', init: initDeckArena },
];

const gameList = document.getElementById('gameList');
const stage = document.getElementById('stage');
const stageTitle = document.getElementById('stageTitle');
const resetButton = document.getElementById('resetButton');
const roundStatus = document.getElementById('roundStatus');
const muteButton = document.getElementById('muteButton');

let activeGameId = null;
let activeReset = null;
let activeRafId = null;
let activeIntervalId = null;
const runtimeCleanup = [];

const gameState = {
  soundEnabled: true,
  round: 1,
  wins: 0,
  losses: 0,
  resultVisible: false,
};

const audioManager = (() => {
  let context = null;

  const ensureContext = () => {
    if (!context) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return null;
      context = new AudioCtor();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  };

  const tone = (frequency, duration = 0.12, type = 'sine', volume = 0.05, slide = 0) => {
    if (!gameState.soundEnabled) return;
    const ctx = ensureContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (slide) osc.frequency.linearRampToValueAtTime(frequency + slide, now + duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  };

  return {
    play(name) {
      if (!gameState.soundEnabled) return;
      const sounds = {
        start: () => tone(220, 0.12, 'triangle', 0.04, 100),
        win: () => {
          tone(440, 0.12, 'triangle', 0.06, 80);
          setTimeout(() => tone(660, 0.18, 'triangle', 0.06, 120), 70);
        },
        lose: () => {
          tone(220, 0.18, 'sawtooth', 0.05, -80);
          setTimeout(() => tone(160, 0.2, 'square', 0.04, -60), 100);
        },
        click: () => tone(660, 0.06, 'square', 0.03, 40),
        hit: () => tone(185, 0.08, 'square', 0.04, -40),
        power: () => tone(720, 0.16, 'triangle', 0.05, 100),
        alert: () => tone(300, 0.2, 'sawtooth', 0.04, 30),
      };
      if (sounds[name]) sounds[name]();
    },
    toggle() {
      gameState.soundEnabled = !gameState.soundEnabled;
      setMuteButton();
      if (gameState.soundEnabled) audioManager.play('start');
    },
  };
})();

function clearRuntime() {
  if (activeRafId) cancelAnimationFrame(activeRafId);
  if (activeIntervalId) clearInterval(activeIntervalId);
  activeRafId = null;
  activeIntervalId = null;
  while (runtimeCleanup.length) {
    const fn = runtimeCleanup.pop();
    if (typeof fn === 'function') fn();
  }
}

function bindKeys(options) {
  const down = (event) => options.onKeyDown(event);
  const up = options.onKeyUp ? (event) => options.onKeyUp(event) : null;
  window.addEventListener('keydown', down);
  if (up) window.addEventListener('keyup', up);
  runtimeCleanup.push(() => {
    window.removeEventListener('keydown', down);
    if (up) window.removeEventListener('keyup', up);
  });
}

function makeShell(title, metrics, extra = '') {
  return `
    <div class="game-shell">
      <div class="game-meta">
        <strong>${title}</strong>
        <div class="metrics">
          ${metrics.map((item) => `<span class="metric">${item}</span>`).join('')}
        </div>
      </div>
      <div class="canvas-holder">
        <canvas id="gameCanvas" width="980" height="520"></canvas>
      </div>
      ${extra}
    </div>
  `;
}

function setMuteButton() {
  if (muteButton) {
    muteButton.textContent = gameState.soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
  }
}

function updateRoundStatus() {
  if (roundStatus) {
    roundStatus.textContent = `Round ${gameState.round} • Wins ${gameState.wins} • Losses ${gameState.losses}`;
  }
}

function showResultScreen({ title, outcome, score, detail }) {
  const shell = stage.querySelector('.game-shell');
  if (!shell) return;

  const existing = shell.querySelector('.result-overlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.className = `result-overlay ${outcome === 'Victory' ? 'win' : 'loss'}`;
  overlay.innerHTML = `
    <div class="result-card">
      <span class="result-tag">${title}</span>
      <h3>${outcome}</h3>
      <p class="result-score">Score: ${score}</p>
      <p>${detail}</p>
      <div class="result-actions">
        <button type="button" class="result-button">Play Next Round</button>
      </div>
    </div>
  `;

  shell.appendChild(overlay);

  const button = overlay.querySelector('.result-button');
  if (button) {
    button.addEventListener('click', () => {
      overlay.remove();
      gameState.resultVisible = false;
      if (activeReset) activeReset();
    });
  }
}

function resolveRound({ title, outcome, score, detail }) {
  if (gameState.resultVisible) return;
  gameState.resultVisible = true;

  if (outcome === 'Victory') {
    gameState.wins += 1;
    audioManager.play('win');
  } else {
    gameState.losses += 1;
    audioManager.play('lose');
  }

  gameState.round += 1;
  updateRoundStatus();
  showResultScreen({ title, outcome, score, detail });
}

function renderGameList() {
  gameList.innerHTML = games
    .map(
      (game) => `
        <button class="game-item${game.id === activeGameId ? ' active' : ''}" data-id="${game.id}" type="button">
          <span class="game-icon">${game.icon}</span>
          <span class="game-copy">
            <h3>${game.name}</h3>
            <p>${game.summary}</p>
          </span>
        </button>
      `
    )
    .join('');

  gameList.querySelectorAll('.game-item').forEach((button) => {
    button.addEventListener('click', () => {
      selectGame(button.dataset.id);
    });
  });
}

function selectGame(gameId) {
  const game = games.find((entry) => entry.id === gameId);
  if (!game) return;

  activeGameId = gameId;
  stageTitle.textContent = game.name;
  renderGameList();
  clearRuntime();
  gameState.resultVisible = false;
  activeReset = game.init;
  audioManager.play('start');
  game.init();
}

function setEmptyState() {
  stage.className = 'stage empty-state';
  stage.innerHTML = `
    <div class="empty-copy">
      <div class="orb"></div>
      <h3>Pick a game to begin</h3>
      <p>Each prototype includes its own visual identity, mechanics, and quick loop.</p>
    </div>
  `;
}

resetButton.addEventListener('click', () => {
  if (activeReset) {
    clearRuntime();
    gameState.resultVisible = false;
    activeReset();
  }
});

muteButton.addEventListener('click', () => {
  audioManager.toggle();
});

function initChopChop() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('ChopChop.io', ['Wood: 0', 'Level: 1', 'HP: 100']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const keys = { w: false, s: false, a: false, d: false, space: false };

  const state = {
    player: { x: 180, y: 260, radius: 22, wood: 0, level: 1, hp: 100, cooldown: 0 },
    enemies: [
      { x: 760, y: 170, radius: 18, speed: 1.3, ai: 0 },
      { x: 810, y: 360, radius: 16, speed: 1.5, ai: 1 },
      { x: 620, y: 290, radius: 20, speed: 1.1, ai: 2 },
    ],
    trees: [
      { x: 300, y: 160, size: 34, hp: 100 },
      { x: 500, y: 330, size: 38, hp: 120 },
      { x: 700, y: 190, size: 30, hp: 90 },
      { x: 850, y: 350, size: 40, hp: 150 },
      { x: 620, y: 100, size: 28, hp: 80 },
    ],
  };

  bindKeys({
    onKeyDown(event) {
      const key = event.key.toLowerCase();
      if (key === 'w') keys.w = true;
      if (key === 's') keys.s = true;
      if (key === 'a') keys.a = true;
      if (key === 'd') keys.d = true;
      if (event.code === 'Space') keys.space = true;
    },
    onKeyUp(event) {
      const key = event.key.toLowerCase();
      if (key === 'w') keys.w = false;
      if (key === 's') keys.s = false;
      if (key === 'a') keys.a = false;
      if (key === 'd') keys.d = false;
      if (event.code === 'Space') keys.space = false;
    },
  });

  const updateMetrics = () => {
    const metrics = stage.querySelectorAll('.metric');
    metrics[0].textContent = `Wood: ${state.player.wood}`;
    metrics[1].textContent = `Level: ${state.player.level}`;
    metrics[2].textContent = `HP: ${Math.max(0, Math.ceil(state.player.hp))}`;
  };

  const drawScene = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#112b1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    state.trees.forEach((tree) => {
      ctx.fillStyle = '#4caf50';
      ctx.beginPath();
      ctx.arc(tree.x, tree.y, tree.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7a4a25';
      ctx.fillRect(tree.x - 5, tree.y + tree.size, 10, 26);
      ctx.fillStyle = '#eff6ff';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${Math.ceil(tree.hp)}`, tree.x - 8, tree.y - tree.size - 10);
    });

    state.enemies.forEach((enemy) => {
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      const dist = Math.hypot(dx, dy) || 1;
      enemy.x += (dx / dist) * enemy.speed;
      enemy.y += (dy / dist) * enemy.speed;

      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(state.player.x, state.player.y, state.player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('YOU', state.player.x - 14, state.player.y - 28);

    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fillRect(30, 26, 200, 12);
    ctx.fillStyle = '#62f0b6';
    ctx.fillRect(30, 26, Math.max(0, state.player.hp) * 2, 12);
  };

  const tick = () => {
    if (gameState.resultVisible) return;

    const speed = 3.2 + state.player.level * 0.35;
    if (keys.w) state.player.y -= speed;
    if (keys.s) state.player.y += speed;
    if (keys.a) state.player.x -= speed;
    if (keys.d) state.player.x += speed;

    state.player.x = Math.max(28, Math.min(canvas.width - 28, state.player.x));
    state.player.y = Math.max(28, Math.min(canvas.height - 28, state.player.y));

    if (keys.space && state.player.cooldown <= 0) {
      const target = state.trees.find((tree) => Math.hypot(tree.x - state.player.x, tree.y - state.player.y) < 90);
      if (target) {
        target.hp -= 28 + state.player.level * 8;
        state.player.wood += 12;
        state.player.cooldown = 0.4;
        audioManager.play('hit');
        if (target.hp <= 0) {
          const newX = 70 + Math.random() * (canvas.width - 140);
          const newY = 70 + Math.random() * (canvas.height - 140);
          target.x = newX;
          target.y = newY;
          target.hp = 80 + Math.random() * 50;
          state.player.level += 1;
          audioManager.play('power');
        }
      }
    }
    state.player.cooldown = Math.max(0, state.player.cooldown - 0.03);

    state.enemies.forEach((enemy) => {
      const dist = Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y);
      if (dist < enemy.radius + state.player.radius + 2) {
        state.player.hp -= 0.7;
      }
    });

    if (state.player.wood >= 180 || state.player.level >= 8) {
      resolveRound({
        title: 'ChopChop.io',
        outcome: 'Victory',
        score: state.player.wood + state.player.level * 30,
        detail: 'You outlasted the rival lumber crew and secured the forest crown.',
      });
      return;
    }

    if (state.player.hp <= 0) {
      resolveRound({
        title: 'ChopChop.io',
        outcome: 'Defeat',
        score: state.player.wood,
        detail: 'The raiders overwhelmed the camp before the forest was secured.',
      });
      return;
    }

    updateMetrics();
    drawScene();
    activeRafId = requestAnimationFrame(tick);
  };

  drawScene();
  updateMetrics();
  activeRafId = requestAnimationFrame(tick);
}

function initBlobMagnet() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('Blob Magnet', ['Score: 0', 'Polarity: +', 'Lives: 5']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const blob = { x: 260, y: 220, radius: 34, charge: 1, score: 0, lives: 5 };
  const debris = Array.from({ length: 10 }, () => ({
    x: 60 + Math.random() * (canvas.width - 120),
    y: 60 + Math.random() * (canvas.height - 120),
    r: 8 + Math.random() * 10,
    vx: (Math.random() - 0.5) * 2.5,
    vy: (Math.random() - 0.5) * 2.5,
  }));
  const drones = Array.from({ length: 3 }, (_, index) => ({
    x: 720 + index * 70,
    y: 120 + index * 110,
    r: 15,
    vx: 0,
    vy: 0,
  }));
  const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

  bindKeys({
    onKeyDown(event) {
      if (event.key in keys) keys[event.key] = true;
      if (event.key.toLowerCase() === 'e') blob.charge = 1;
      if (event.key.toLowerCase() === 'q') blob.charge = -1;
    },
    onKeyUp(event) {
      if (event.key in keys) keys[event.key] = false;
    },
  });

  const updateMetrics = () => {
    const metrics = stage.querySelectorAll('.metric');
    metrics[0].textContent = `Score: ${blob.score}`;
    metrics[1].textContent = `Polarity: ${blob.charge === 1 ? '+' : '-'}`;
    metrics[2].textContent = `Lives: ${blob.lives}`;
  };

  const drawField = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0a1320';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for (let i = 0; i < 14; i++) {
      const x = (i / 14) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    debris.forEach((item) => {
      ctx.fillStyle = blob.charge === 1 ? '#ffce54' : '#7dd3fc';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
      ctx.fill();
    });

    drones.forEach((drone) => {
      ctx.fillStyle = '#fca5a5';
      ctx.beginPath();
      ctx.arc(drone.x, drone.y, drone.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = blob.charge === 1 ? '#67e8f9' : '#f472b6';
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const tick = () => {
    if (gameState.resultVisible) return;

    const speed = 4.5;
    if (keys.ArrowUp) blob.y -= speed;
    if (keys.ArrowDown) blob.y += speed;
    if (keys.ArrowLeft) blob.x -= speed;
    if (keys.ArrowRight) blob.x += speed;

    blob.x = Math.max(blob.radius, Math.min(canvas.width - blob.radius, blob.x));
    blob.y = Math.max(blob.radius, Math.min(canvas.height - blob.radius, blob.y));

    debris.forEach((item) => {
      const dx = blob.x - item.x;
      const dy = blob.y - item.y;
      const dist = Math.hypot(dx, dy) || 1;
      const pull = 0.17 * blob.charge / Math.max(18, dist);
      item.vx += (dx / dist) * pull * 120;
      item.vy += (dy / dist) * pull * 120;
      item.x += item.vx;
      item.y += item.vy;
      item.vx *= 0.96;
      item.vy *= 0.96;

      if (Math.hypot(item.x - blob.x, item.y - blob.y) < item.r + blob.radius) {
        blob.score += 5;
        audioManager.play('click');
        item.x = 20 + Math.random() * (canvas.width - 40);
        item.y = 20 + Math.random() * (canvas.height - 40);
        item.vx = (Math.random() - 0.5) * 4;
        item.vy = (Math.random() - 0.5) * 4;
      }
    });

    drones.forEach((drone) => {
      const dx = blob.x - drone.x;
      const dy = blob.y - drone.y;
      const dist = Math.hypot(dx, dy) || 1;
      drone.x += (dx / dist) * 1.3;
      drone.y += (dy / dist) * 1.3;
      if (dist < drone.r + blob.radius + 8) {
        blob.lives -= 1;
        audioManager.play('alert');
        blob.x = 150 + Math.random() * 200;
        blob.y = 130 + Math.random() * 200;
      }
    });

    if (blob.score >= 180) {
      resolveRound({
        title: 'Blob Magnet',
        outcome: 'Victory',
        score: blob.score,
        detail: 'You magnetized the arena and left the rival drones spinning in reverse.',
      });
      return;
    }

    if (blob.lives <= 0) {
      resolveRound({
        title: 'Blob Magnet',
        outcome: 'Defeat',
        score: blob.score,
        detail: 'The drones intercepted your charge before the arena flipped.',
      });
      return;
    }

    drawField();
    updateMetrics();
    activeRafId = requestAnimationFrame(tick);
  };

  drawField();
  updateMetrics();
  activeRafId = requestAnimationFrame(tick);
}

function initNeonRacer() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('Neon Line Racer', ['Speed: 0', 'Score: 0', 'Health: 3']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const state = {
    player: { x: canvas.width / 2, y: canvas.height - 70, w: 22, h: 22, speed: 5 },
    ai: { x: canvas.width / 2, y: 60, w: 22, h: 22, speed: 3 },
    obstacles: [],
    score: 0,
    health: 3,
  };

  const spawnObstacle = () => {
    const lane = Math.floor(Math.random() * 5);
    const x = 120 + lane * 160 + Math.random() * 80;
    state.obstacles.push({ x, y: -30, w: 70, h: 24, speed: 3.2 + Math.random() * 1.6 });
  };

  bindKeys({
    onKeyDown(event) {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
      if (event.key === 'ArrowLeft') state.player.x -= state.player.speed * 1.8;
      if (event.key === 'ArrowRight') state.player.x += state.player.speed * 1.8;
      if (event.key === 'ArrowUp') state.player.y -= state.player.speed * 1.4;
      if (event.key === 'ArrowDown') state.player.y += state.player.speed * 1.4;
      state.player.x = Math.max(70, Math.min(canvas.width - 70, state.player.x));
      state.player.y = Math.max(60, Math.min(canvas.height - 60, state.player.y));
    },
  });

  const updateMetrics = () => {
    const metrics = stage.querySelectorAll('.metric');
    metrics[0].textContent = `Speed: ${Math.round(4 + state.score / 20)}`;
    metrics[1].textContent = `Score: ${state.score}`;
    metrics[2].textContent = `Health: ${state.health}`;
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#070d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 5; i++) {
      const laneX = 100 + i * 160;
      ctx.beginPath();
      ctx.moveTo(laneX, 0);
      ctx.lineTo(laneX, canvas.height);
      ctx.stroke();
    }

    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(80, canvas.height - 18);
    ctx.lineTo(900, canvas.height - 18);
    ctx.stroke();

    state.obstacles.forEach((ob) => {
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(ob.x, ob.y, ob.w, ob.h);
      ob.y += ob.speed;
    });

    state.obstacles = state.obstacles.filter((ob) => ob.y < canvas.height + 40);
    if (Math.random() < 0.03) spawnObstacle();

    const aiTargetX = state.player.x > state.ai.x ? 1 : -1;
    state.ai.x += aiTargetX * state.ai.speed;
    state.ai.x = Math.max(70, Math.min(canvas.width - 70, state.ai.x));

    if (state.obstacles.some((ob) => {
      const hitX = state.player.x + state.player.w > ob.x && state.player.x < ob.x + ob.w;
      const hitY = state.player.y + state.player.h > ob.y && state.player.y < ob.y + ob.h;
      return hitX && hitY;
    })) {
      state.health -= 1;
      state.obstacles = [];
      state.player.x = canvas.width / 2;
      state.player.y = canvas.height - 70;
      audioManager.play('alert');
    }

    if (state.ai.x > state.player.x - 10 && state.ai.x < state.player.x + 10 && Math.abs(state.ai.y - state.player.y) < 60) {
      state.health -= 1;
      state.ai.x = canvas.width / 2;
      audioManager.play('alert');
    }

    if (state.health <= 0) {
      resolveRound({
        title: 'Neon Line Racer',
        outcome: 'Defeat',
        score: state.score,
        detail: 'The AI racer boxed you in and the lane collapsed under pressure.',
      });
      return;
    }

    state.score += 2;
    if (state.score >= 1200) {
      resolveRound({
        title: 'Neon Line Racer',
        outcome: 'Victory',
        score: state.score,
        detail: 'You outran the AI rival and controlled the entire neon lane.',
      });
      return;
    }

    ctx.fillStyle = '#f5f7ff';
    ctx.fillRect(state.player.x, state.player.y, state.player.w, state.player.h);
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(state.ai.x, state.ai.y, state.ai.w, state.ai.h);

    if (state.score % 500 === 0) {
      state.player.speed += 0.2;
    }

    updateMetrics();
  };

  const tick = () => {
    if (gameState.resultVisible) return;
    draw();
    activeRafId = requestAnimationFrame(tick);
  };

  activeRafId = requestAnimationFrame(tick);
}

function initSyncDefenders() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('SyncDefenders', ['Beat: 64 BPM', 'Towers: 3', 'Sync: 87%']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const state = {
    towers: [
      { x: 180, y: 290, radius: 26 },
      { x: 470, y: 245, radius: 30 },
      { x: 760, y: 320, radius: 27 },
    ],
    enemies: [
      { x: 100, y: 180, r: 12, hp: 100, speed: 1 },
      { x: 120, y: 400, r: 12, hp: 100, speed: 1.3 },
      { x: 90, y: 260, r: 12, hp: 100, speed: 1.2 },
    ],
    baseHp: 9,
  };

  const updateMetrics = (pulse, beat, sync) => {
    const metrics = stage.querySelectorAll('.metric');
    metrics[0].textContent = `Beat: ${beat} BPM`;
    metrics[1].textContent = `Towers: ${state.towers.length}`;
    metrics[2].textContent = `Sync: ${sync}%`;
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pulse = (Math.sin(Date.now() / 260) + 1) * 0.5;
    const beat = 64 + Math.round(pulse * 18);
    const sync = 82 + Math.round((Math.sin(Date.now() / 480) + 1) * 12);
    updateMetrics(pulse, beat, sync);

    ctx.fillStyle = '#182b3c';
    ctx.fillRect(75, 420, 830, 24);

    state.towers.forEach((tower, index) => {
      const glow = 18 + pulse * 24;
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(tower.x, tower.y + Math.sin(Date.now() / 280 + index) * 18, tower.radius + glow * 0.2, 0, Math.PI * 2);
      ctx.fill();
    });

    state.enemies.forEach((enemy, index) => {
      enemy.x += enemy.speed * 0.9;
      enemy.y += Math.sin((Date.now() / 300) + index) * 0.4;
      if (enemy.x > canvas.width + 30) {
        state.baseHp -= 1;
        enemy.x = -30;
      }

      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, enemy.r, 0, Math.PI * 2);
      ctx.fill();
    });

    const active = beat % 12 < 4;
    if (active) {
      state.towers.forEach((tower, index) => {
        const target = state.enemies[index % state.enemies.length];
        if (target) {
          target.hp -= 12;
          if (target.hp <= 0) {
            state.enemies = state.enemies.filter((e) => e !== target);
            audioManager.play('click');
          }
          ctx.strokeStyle = '#fbbf24';
          ctx.beginPath();
          ctx.moveTo(tower.x, tower.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });
    }

    if (state.baseHp <= 0) {
      resolveRound({
        title: 'SyncDefenders',
        outcome: 'Defeat',
        score: state.towers.length * 25,
        detail: 'The rhythm line was broken and the AI swarm reached your base.',
      });
      return;
    }

    if (state.enemies.length === 0) {
      resolveRound({
        title: 'SyncDefenders',
        outcome: 'Victory',
        score: 100 + state.towers.length * 35,
        detail: 'Your rhythm tower chain synchronized perfectly and held the lane.',
      });
      return;
    }
  };

  const tick = () => {
    if (gameState.resultVisible) return;
    draw();
    activeRafId = requestAnimationFrame(tick);
  };

  activeRafId = requestAnimationFrame(tick);
}

function initEscapeTheCode() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('Escape the Code', ['Timer: 90s', 'Doors: 2', 'Co-op: live'], '<div class="controls-box">Find the matching clue path: the right combination opens the final door.</div>');

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const puzzle = {
    code: [2, 4, 1, 3],
    selection: [],
    solution: [2, 4, 1, 3],
    timeLeft: 90,
    aiHint: 'Ava: Follow the clue order from the oldest code path.',
  };

  const pick = (value) => {
    if (puzzle.selection.length < 4) puzzle.selection.push(value);
    if (puzzle.selection.length === 4) {
      const solved = puzzle.selection.every((item, idx) => item === puzzle.solution[idx]);
      if (solved) {
        puzzle.code = [1, 2, 3, 4];
        audioManager.play('power');
        resolveRound({
          title: 'Escape the Code',
          outcome: 'Victory',
          score: Math.max(0, Math.ceil(puzzle.timeLeft) * 10),
          detail: 'The final door unlocked and your co-op squad escaped the server core.',
        });
      } else {
        puzzle.selection = [];
        puzzle.aiHint = 'Owen: Wrong sequence. Reset and match the clue chain.';
      }
    }
  };

  const buttons = [
    { x: 150, y: 260, w: 60, h: 60, label: 'A', value: 1 },
    { x: 250, y: 260, w: 60, h: 60, label: 'B', value: 2 },
    { x: 350, y: 260, w: 60, h: 60, label: 'C', value: 3 },
    { x: 450, y: 260, w: 60, h: 60, label: 'D', value: 4 },
  ];

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1726';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#a5f3fc';
    ctx.font = '20px monospace';
    const code = [
      'const unlock = () => {',
      '  if (mazeDoor === 0) {',
      '    return "fail";',
      '  }',
      '  return "open";',
      '};',
    ];
    code.forEach((line, index) => {
      ctx.fillText(line, 60, 90 + index * 28);
    });

    ctx.fillStyle = '#fcd34d';
    const clues = ['A2: door', 'B3: lever', 'C4: key', 'D5: exit'];
    clues.forEach((line, index) => {
      ctx.fillText(line, 560, 120 + index * 34);
    });

    ctx.strokeStyle = '#67e8f9';
    ctx.strokeRect(520, 240, 300, 180);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(580, 295, 180, 90);

    buttons.forEach((button) => {
      const active = puzzle.selection.includes(button.value);
      ctx.fillStyle = active ? '#fbbf24' : '#233640';
      ctx.fillRect(button.x, button.y, button.w, button.h);
      ctx.fillStyle = '#eff6ff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(button.label, button.x + 22, button.y + 36);
    });

    ctx.fillStyle = '#eff6ff';
    ctx.font = 'bold 24px sans-serif';
    const status = puzzle.selection.length === 4 && puzzle.selection.every((item, idx) => item === puzzle.solution[idx]) ? 'Door unlocked' : 'Match the clue order';
    ctx.fillText(status, 200, 470);

    ctx.fillStyle = '#7dd3fc';
    ctx.font = '16px sans-serif';
    ctx.fillText(puzzle.aiHint, 120, 510);

    const metrics = stage.querySelectorAll('.metric');
    metrics[0].textContent = `Timer: ${Math.max(0, Math.ceil(puzzle.timeLeft))}s`;
    metrics[1].textContent = `Doors: ${puzzle.selection.length >= 4 ? 2 : 1}`;
    metrics[2].textContent = 'Co-op: live';
  };

  const tick = () => {
    if (gameState.resultVisible) return;
    puzzle.timeLeft = Math.max(0, puzzle.timeLeft - 0.05);
    render();

    if (puzzle.timeLeft <= 0) {
      resolveRound({
        title: 'Escape the Code',
        outcome: 'Defeat',
        score: 0,
        detail: 'The AI teammates reached the end of the clock before the correct path was matched.',
      });
      return;
    }

    activeRafId = requestAnimationFrame(tick);
  };

  buttons.forEach((button) => {
    const onClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
      if (x >= button.x && x <= button.x + button.w && y >= button.y && y <= button.y + button.h) {
        pick(button.value);
      }
    };
    canvas.addEventListener('click', onClick);
    runtimeCleanup.push(() => canvas.removeEventListener('click', onClick));
  });

  activeRafId = requestAnimationFrame(tick);
}

function initPixelHeist() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('Pixel Art Heist', ['Security: 3', 'Target: 1', 'Feed: 3s'], '<div class="controls-box">Click the camera that shows the thief. The feed rotates every three seconds.</div>');

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let frame = 0;
  const cameras = [
    { x: 85, y: 110, w: 150, h: 120, color: '#3b82f6', thief: false },
    { x: 260, y: 120, w: 150, h: 120, color: '#fbbf24', thief: true },
    { x: 440, y: 110, w: 150, h: 120, color: '#34d399', thief: false },
  ];
  let activeCamera = 1;
  let score = 0;
  let security = 3;

  const updateMetrics = () => {
    const metrics = stage.querySelectorAll('.metric');
    metrics[0].textContent = `Security: ${security}`;
    metrics[1].textContent = `Target: ${activeCamera + 1}`;
    metrics[2].textContent = `Feed: ${Math.max(0, 3 - (frame % 3))}s`;
  };

  const render = () => {
    frame += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    activeCamera = Math.floor((frame / 50) % cameras.length);
    cameras.forEach((cam, index) => {
      const lit = index === activeCamera;
      ctx.fillStyle = lit ? cam.color : '#1d2b3a';
      ctx.fillRect(cam.x, cam.y, cam.w, cam.h);
      if (lit && cam.thief) {
        ctx.fillStyle = '#111827';
        ctx.fillRect(cam.x + 40, cam.y + 42, 70, 32);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText('THIEF', cam.x + 48, cam.y + 64);
      }
    });

    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(700, 150, 130, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText('Painting', 725, 208);

    ctx.fillStyle = '#8be9fd';
    ctx.fillRect(160 + ((frame / 10) % 4) * 70, 330, 80, 100);
    ctx.fillStyle = '#a3e635';
    ctx.fillRect(700, 330, 110, 100);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('Click the highlighted camera to tag the thief', 260, 470);
    updateMetrics();
  };

  const onClick = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

    let hit = false;
    cameras.forEach((cam, index) => {
      const inside = x >= cam.x && x <= cam.x + cam.w && y >= cam.y && y <= cam.y + cam.h;
      if (inside && index === activeCamera && cam.thief) {
        score += 1;
        cam.thief = false;
        hit = true;
        audioManager.play('power');
      }
    });

    if (!hit) {
      security = Math.max(0, security - 1);
      audioManager.play('alert');
    }

    if (score >= 3) {
      resolveRound({
        title: 'Pixel Art Heist',
        outcome: 'Victory',
        score: 100 + score * 30,
        detail: 'The thief was tagged before the security cycle finished.',
      });
      return;
    }

    if (security <= 0) {
      resolveRound({
        title: 'Pixel Art Heist',
        outcome: 'Defeat',
        score: score * 20,
        detail: 'The guard loop caught the team too late and the AI thief escaped.',
      });
      return;
    }
  };

  canvas.addEventListener('click', onClick);
  runtimeCleanup.push(() => canvas.removeEventListener('click', onClick));

  const tick = () => {
    if (gameState.resultVisible) return;
    render();
    activeRafId = requestAnimationFrame(tick);
  };

  activeRafId = requestAnimationFrame(tick);
}

function initGridCommand() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('GridCommand', ['Timer: 10.0s', 'Units: 3', 'Resolve: on']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const board = [];
  let timeLeft = 10;

  for (let row = 0; row < 8; row += 1) {
    board[row] = [];
    for (let col = 0; col < 8; col += 1) {
      board[row][col] = { row, col, type: 'empty' };
    }
  }

  const state = {
    selected: null,
    units: [
      { x: 1, y: 1, hp: 3, color: '#f9a8d4' },
      { x: 2, y: 5, hp: 3, color: '#67e8f9' },
      { x: 5, y: 2, hp: 3, color: '#fbbf24' },
    ],
    enemies: [
      { x: 6, y: 6, hp: 3, color: '#f87171' },
      { x: 6, y: 1, hp: 3, color: '#fca5a5' },
    ],
  };

  const updateMetrics = () => {
    const metrics = stage.querySelectorAll('.metric');
    metrics[0].textContent = `Timer: ${timeLeft.toFixed(1)}s`;
    metrics[1].textContent = `Units: ${state.units.length}`;
    metrics[2].textContent = 'Resolve: on';
  };

  const render = () => {
    timeLeft = Math.max(0, timeLeft - 0.05);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        const x = 170 + col * 76;
        const y = 70 + row * 62;
        ctx.strokeStyle = '#2e3d58';
        ctx.strokeRect(x, y, 76, 62);
      }
    }

    state.units.forEach((unit) => {
      const px = 170 + unit.x * 76 + 22;
      const py = 70 + unit.y * 62 + 18;
      ctx.fillStyle = unit.color;
      ctx.fillRect(px, py, 30, 30);
    });

    state.enemies.forEach((enemy) => {
      const px = 170 + enemy.x * 76 + 22;
      const py = 70 + enemy.y * 62 + 18;
      ctx.fillStyle = enemy.color;
      ctx.fillRect(px, py, 30, 30);
    });

    if (state.selected) {
      const px = 170 + state.selected.x * 76 + 10;
      const py = 70 + state.selected.y * 62 + 10;
      ctx.strokeStyle = '#fef08a';
      ctx.strokeRect(px, py, 50, 50);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Click a unit, then a highlighted tile to move', 220, 470);
    updateMetrics();
  };

  const onClick = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
    const col = Math.floor((x - 170) / 76);
    const row = Math.floor((y - 70) / 62);
    if (row < 0 || col < 0 || row >= 8 || col >= 8) return;

    const selectedUnit = state.units.find((unit) => unit.x === col && unit.y === row);
    if (selectedUnit) {
      state.selected = selectedUnit;
      return;
    }

    if (!state.selected) return;
    const d = Math.abs(state.selected.x - col) + Math.abs(state.selected.y - row);
    if (d <= 2) {
      state.selected.x = col;
      state.selected.y = row;
      audioManager.play('click');
    }

    state.enemies.forEach((enemy) => {
      const enemyDist = Math.abs(enemy.x - state.selected.x) + Math.abs(enemy.y - state.selected.y);
      if (enemyDist <= 1) {
        enemy.hp -= 1;
        if (enemy.hp <= 0) {
          state.enemies = state.enemies.filter((entry) => entry !== enemy);
        }
      }
    });
  };

  canvas.addEventListener('click', onClick);
  runtimeCleanup.push(() => canvas.removeEventListener('click', onClick));

  const tick = () => {
    if (gameState.resultVisible) return;
    render();

    if (timeLeft <= 0) {
      resolveRound({
        title: 'GridCommand',
        outcome: 'Defeat',
        score: state.units.length * 25,
        detail: 'The clock expired before your command squad could finish the enemy line.',
      });
      return;
    }

    if (state.enemies.length === 0) {
      resolveRound({
        title: 'GridCommand',
        outcome: 'Victory',
        score: 100 + state.units.length * 40,
        detail: 'Your tactics resolved cleanly and the enemy line collapsed under pressure.',
      });
      return;
    }

    state.enemies.forEach((enemy) => {
      const nearest = state.units.reduce((best, unit) => {
        const distance = Math.abs(unit.x - enemy.x) + Math.abs(unit.y - enemy.y);
        if (!best || distance < best.distance) return { unit, distance };
        return best;
      }, null);

      if (!nearest) return;
      if (nearest.distance > 0) {
        if (Math.abs(nearest.unit.x - enemy.x) > 0) {
          enemy.x += nearest.unit.x > enemy.x ? 1 : -1;
        }
        if (Math.abs(nearest.unit.y - enemy.y) > 0) {
          enemy.y += nearest.unit.y > enemy.y ? 1 : -1;
        }
      }
    });

    activeRafId = requestAnimationFrame(tick);
  };

  activeRafId = requestAnimationFrame(tick);
}

function initDeckArena() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('DeckBuilder Arena', ['Draw: 3', 'HP: 18', 'Enemy: 12'], '<div class="controls-box">Play cards to attack the enemy. Each turn, the enemy strikes back.</div>');

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const state = {
    playerHp: 18,
    enemyHp: 12,
    hand: [
      { color: '#60a5fa', name: 'Strike', damage: 3 },
      { color: '#fbbf24', name: 'Guard', damage: 1 },
      { color: '#a78bfa', name: 'Burst', damage: 5 },
    ],
  };

  const updateMetrics = () => {
    const metrics = stage.querySelectorAll('.metric');
    metrics[0].textContent = `Draw: ${state.hand.length}`;
    metrics[1].textContent = `HP: ${state.playerHp}`;
    metrics[2].textContent = `Enemy: ${state.enemyHp}`;
  };

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(120, 120, 200, 120);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(650, 120, 200, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('YOU', 185, 185);
    ctx.fillText('ENEMY', 710, 185);

    state.hand.forEach((card, index) => {
      const x = 100 + index * 175;
      const y = 350;
      ctx.fillStyle = card.color;
      ctx.fillRect(x, y, 130, 90);
      ctx.fillStyle = '#0b1220';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(card.name.toUpperCase(), x + 18, y + 45);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`DMG ${card.damage}`, x + 24, y + 68);
    });

    ctx.fillStyle = '#dbeafe';
    ctx.font = '18px sans-serif';
    ctx.fillText('Click a card to resolve combat', 300, 470);

    updateMetrics();
  };

  const playCard = (index) => {
    const card = state.hand[index];
    if (!card) return;
    state.enemyHp = Math.max(0, state.enemyHp - card.damage);
    state.hand.splice(index, 1);
    audioManager.play('hit');

    if (state.enemyHp <= 0) {
      resolveRound({
        title: 'DeckBuilder Arena',
        outcome: 'Victory',
        score: 120 + state.playerHp * 5,
        detail: 'Your deck outplayed the AI champion and won the arena duel.',
      });
      return;
    }

    if (state.hand.length === 0) {
      state.hand = [
        { color: '#60a5fa', name: 'Strike', damage: 3 },
        { color: '#fbbf24', name: 'Guard', damage: 1 },
        { color: '#a78bfa', name: 'Burst', damage: 5 },
      ];
    }

    state.playerHp = Math.max(0, state.playerHp - 2);
    if (state.playerHp <= 0) {
      resolveRound({
        title: 'DeckBuilder Arena',
        outcome: 'Defeat',
        score: state.enemyHp,
        detail: 'The AI deck punished your line before you could stabilize the round.',
      });
      return;
    }

    render();
  };

  state.hand.forEach((card, index) => {
    const onClick = (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      const y = ((event.clientY - rect.top) / rect.height) * canvas.height;
      const cardX = 100 + index * 175;
      const cardY = 350;
      if (x >= cardX && x <= cardX + 130 && y >= cardY && y <= cardY + 90) {
        playCard(index);
      }
    };
    canvas.addEventListener('click', onClick);
    runtimeCleanup.push(() => canvas.removeEventListener('click', onClick));
  });

  render();
}

renderGameList();
setEmptyState();
setMuteButton();
updateRoundStatus();

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setEmptyState();
    activeGameId = null;
    activeReset = null;
    clearRuntime();
    renderGameList();
    gameState.resultVisible = false;
  }
});

selectGame('chopchop');
