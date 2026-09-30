const games = [
  {
    id: 'chopchop',
    name: 'ChopChop.io',
    icon: '🪓',
    summary: 'Forest battle arena',
    accent: '#67e8f9',
    init: initChopChop,
  },
  {
    id: 'blob',
    name: 'Blob Magnet',
    icon: '🧲',
    summary: 'Magnetic chaos arena',
    accent: '#a78bfa',
    init: initBlobMagnet,
  },
  {
    id: 'neon',
    name: 'Neon Line Racer',
    icon: '🚦',
    summary: 'Glow-path survival',
    accent: '#f472b6',
    init: initNeonRacer,
  },
  {
    id: 'sync',
    name: 'SyncDefenders',
    icon: '🎵',
    summary: 'Rhythm tower defense',
    accent: '#60a5fa',
    init: initSyncDefenders,
  },
  {
    id: 'escape',
    name: 'Escape the Code',
    icon: '💻',
    summary: 'Co-op clue puzzle',
    accent: '#4ade80',
    init: initEscapeTheCode,
  },
  {
    id: 'heist',
    name: 'Pixel Art Heist',
    icon: '🕵️',
    summary: 'Security feed deduction',
    accent: '#fbbf24',
    init: initPixelHeist,
  },
  {
    id: 'grid',
    name: 'GridCommand',
    icon: '⚙️',
    summary: '10-second tactics',
    accent: '#f87171',
    init: initGridCommand,
  },
  {
    id: 'deck',
    name: 'DeckBuilder Arena',
    icon: '🃏',
    summary: 'Shared-pool card duel',
    accent: '#c084fc',
    init: initDeckArena,
  },
];

const gameList = document.getElementById('gameList');
const stage = document.getElementById('stage');
const stageTitle = document.getElementById('stageTitle');
const resetButton = document.getElementById('resetButton');

let activeGameId = null;
let activeReset = null;

function renderGameList() {
  gameList.innerHTML = games
    .map(
      (game) => `
        <button class="game-item${game.id === activeGameId ? ' active' : ''}" data-id="${game.id}">
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
      const gameId = button.dataset.id;
      selectGame(gameId);
    });
  });
}

function selectGame(gameId) {
  const game = games.find((entry) => entry.id === gameId);
  if (!game) return;

  activeGameId = gameId;
  stageTitle.textContent = game.name;
  renderGameList();
  activeReset = game.init;
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

function makeShell(title, metrics) {
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
    </div>
  `;
}

resetButton.addEventListener('click', () => {
  if (activeReset) activeReset();
});

function initChopChop() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('ChopChop.io', ['Wood: 0', 'Level: 1', 'Players: 4']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const keys = { w: false, s: false, a: false, d: false, space: false };

  const player = { x: 180, y: 260, radius: 22, wood: 0, level: 1, cooldown: 0 };
  const trees = [
    { x: 300, y: 180, size: 34, hp: 100 },
    { x: 480, y: 290, size: 38, hp: 120 },
    { x: 690, y: 200, size: 30, hp: 90 },
    { x: 820, y: 340, size: 42, hp: 150 },
  ];

  const handleKey = (event, pressed) => {
    const key = event.key.toLowerCase();
    if (key === 'w') keys.w = pressed;
    if (key === 's') keys.s = pressed;
    if (key === 'a') keys.a = pressed;
    if (key === 'd') keys.d = pressed;
    if (event.code === 'Space') keys.space = pressed;
  };

  window.addEventListener('keydown', (event) => handleKey(event, true));
  window.addEventListener('keyup', (event) => handleKey(event, false));

  const tick = () => {
    const speed = 3.4 + player.level * 0.28;
    if (keys.w) player.y -= speed;
    if (keys.s) player.y += speed;
    if (keys.a) player.x -= speed;
    if (keys.d) player.x += speed;

    player.x = Math.max(28, Math.min(canvas.width - 28, player.x));
    player.y = Math.max(28, Math.min(canvas.height - 28, player.y));

    if (keys.space && player.cooldown <= 0) {
      const target = trees.find((tree) => Math.hypot(tree.x - player.x, tree.y - player.y) < 90);
      if (target) {
        target.hp -= 30 + player.level * 6;
        player.wood += 12;
        player.cooldown = 0.38;
        if (target.hp <= 0) {
          target.hp = 60 + Math.random() * 30;
          target.x = 70 + Math.random() * (canvas.width - 140);
          target.y = 70 + Math.random() * (canvas.height - 140);
          player.level += 1;
        }
      }
    }
    player.cooldown = Math.max(0, player.cooldown - 0.03);

    const metricEls = stage.querySelectorAll('.metric');
    metricEls[0].textContent = `Wood: ${player.wood}`;
    metricEls[1].textContent = `Level: ${player.level}`;
    metricEls[2].textContent = 'Players: 4';

    drawForestScene();
    requestAnimationFrame(tick);
  };

  const drawForestScene = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#113426';
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

    trees.forEach((tree) => {
      ctx.fillStyle = '#4caf50';
      ctx.beginPath();
      ctx.arc(tree.x, tree.y, tree.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7a4a25';
      ctx.fillRect(tree.x - 5, tree.y + tree.size, 10, 24);
      ctx.fillStyle = '#eff6ff';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${Math.ceil(tree.hp)}`, tree.x - 8, tree.y - tree.size - 10);
    });

    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('YOU', player.x - 14, player.y - 28);
  };

  drawForestScene();
  requestAnimationFrame(tick);
}

function initBlobMagnet() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('Blob Magnet', ['Score: 0', 'Polarity: +', 'Debris: 8']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const blob = { x: 220, y: 220, radius: 32, charge: 1 };
  const debris = Array.from({ length: 8 }, () => ({
    x: 60 + Math.random() * (canvas.width - 120),
    y: 60 + Math.random() * (canvas.height - 120),
    r: 10 + Math.random() * 8,
    vx: (Math.random() - 0.5) * 2.5,
    vy: (Math.random() - 0.5) * 2.5,
  }));
  const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

  window.addEventListener('keydown', (event) => {
    if (event.key in keys) keys[event.key] = true;
    if (event.key.toLowerCase() === 'e') blob.charge = 1;
    if (event.key.toLowerCase() === 'q') blob.charge = -1;
  });
  window.addEventListener('keyup', (event) => {
    if (event.key in keys) keys[event.key] = false;
  });

  const tick = () => {
    const speed = 4.2;
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
      const force = 0.18 * blob.charge / Math.max(20, dist);
      item.vx += (dx / dist) * force * 90;
      item.vy += (dy / dist) * force * 90;
      item.x += item.vx;
      item.y += item.vy;
      item.vx *= 0.97;
      item.vy *= 0.97;
    });

    const metricEls = stage.querySelectorAll('.metric');
    metricEls[0].textContent = `Score: ${Math.round(blob.x + blob.y * 0.5)}`;
    metricEls[1].textContent = `Polarity: ${blob.charge === 1 ? '+' : '-'}`;
    metricEls[2].textContent = `Debris: ${debris.length}`;

    drawField();
    requestAnimationFrame(tick);
  };

  const drawField = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 18; i++) {
      const x = (i / 18) * canvas.width;
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
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

    ctx.fillStyle = blob.charge === 1 ? '#67e8f9' : '#f472b6';
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
    ctx.fill();
  };

  drawField();
  requestAnimationFrame(tick);
}

function initNeonRacer() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('Neon Line Racer', ['Speed: 4', 'Trail: 12', 'Arena: 1']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const snake = {
    x: 200,
    y: 220,
    vx: 4,
    vy: 0,
    trail: [{ x: 200, y: 220 }],
    alive: true,
  };

  const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

  window.addEventListener('keydown', (event) => {
    if (event.key in keys) keys[event.key] = true;
  });
  window.addEventListener('keyup', (event) => {
    if (event.key in keys) keys[event.key] = false;
  });

  const tick = () => {
    if (!snake.alive) {
      draw();
      return;
    }

    if (keys.ArrowUp || keys.ArrowDown || keys.ArrowLeft || keys.ArrowRight) {
      if (keys.ArrowUp && snake.vy !== 4) { snake.vx = 0; snake.vy = -4; }
      if (keys.ArrowDown && snake.vy !== -4) { snake.vx = 0; snake.vy = 4; }
      if (keys.ArrowLeft && snake.vx !== 4) { snake.vx = -4; snake.vy = 0; }
      if (keys.ArrowRight && snake.vx !== -4) { snake.vx = 4; snake.vy = 0; }
    }

    snake.x += snake.vx;
    snake.y += snake.vy;
    snake.trail.push({ x: snake.x, y: snake.y });
    if (snake.trail.length > 20) snake.trail.shift();

    if (snake.x < 0 || snake.x > canvas.width || snake.y < 0 || snake.y > canvas.height) {
      snake.alive = false;
    }

    const metricEls = stage.querySelectorAll('.metric');
    metricEls[0].textContent = `Speed: ${Math.hypot(snake.vx, snake.vy) * 2}`;
    metricEls[1].textContent = `Trail: ${snake.trail.length}`;
    metricEls[2].textContent = 'Arena: 1';

    draw();
    requestAnimationFrame(tick);
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#090d18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 7;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    snake.trail.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    ctx.fillStyle = '#f472b6';
    ctx.fillRect(snake.x - 10, snake.y - 10, 20, 20);

    if (!snake.alive) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText('Crash! Press reset', 320, 250);
    }
  };

  draw();
  requestAnimationFrame(tick);
}

function initSyncDefenders() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('SyncDefenders', ['Beat: 64 BPM', 'Towers: 3', 'Sync: 87%']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pulse = (Math.sin(Date.now() / 250) + 1) * 0.5;
    const beat = 64 + Math.round(pulse * 13);
    const sync = 82 + Math.round((Math.sin(Date.now() / 500) + 1) * 12);

    const metricEls = stage.querySelectorAll('.metric');
    metricEls[0].textContent = `Beat: ${beat} BPM`;
    metricEls[1].textContent = 'Towers: 3';
    metricEls[2].textContent = `Sync: ${sync}%`;

    ctx.fillStyle = '#7dd3fc';
    for (let i = 0; i < 3; i++) {
      const x = 180 + i * 240;
      const y = 260 + Math.sin(Date.now() / 300 + i) * 24;
      const radius = 34 + pulse * 16;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#4ade80';
    ctx.fillRect(110, 360, 760, 18);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(110 + pulse * 660, 340, 30, 58);

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initEscapeTheCode() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('Escape the Code', ['Timer: 90s', 'Doors: 2', 'Co-op: live']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const draw = () => {
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
      ctx.fillText(line, 60, 90 + index * 30);
    });

    ctx.fillStyle = '#fcd34d';
    const clues = ['A2: door', 'B3: lever', 'C4: key', 'D5: exit'];
    clues.forEach((line, index) => {
      ctx.fillText(line, 560, 120 + index * 34);
    });

    ctx.strokeStyle = '#67e8f9';
    ctx.strokeRect(500, 220, 300, 180);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(575, 270, 150, 90);

    ctx.fillStyle = '#eff6ff';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('Both clues must match to open the door', 180, 465);
  };

  draw();
  setInterval(draw, 1000);
}

function initPixelHeist() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('Pixel Art Heist', ['Security: 3', 'Heist: live', 'Feed: 3s']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  let frame = 0;
  const render = () => {
    frame += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1b2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cameras = [
      { x: 90, y: 110, w: 140, h: 120 },
      { x: 250, y: 120, w: 150, h: 110 },
      { x: 430, y: 110, w: 175, h: 130 },
    ];

    cameras.forEach((cam, index) => {
      ctx.fillStyle = index % 2 === 0 ? '#3b82f6' : '#fbbf24';
      ctx.fillRect(cam.x, cam.y, cam.w, cam.h);
    });

    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(700, 150, 120, 100);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText('Painting', 720, 208);

    ctx.fillStyle = '#8be9fd';
    ctx.fillRect(100 + (frame % 5) * 70, 330, 80, 100);
    ctx.fillStyle = '#a3e635';
    ctx.fillRect(700, 330, 110, 100);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('Camera feed rotates every 3 seconds', 280, 470);
  };

  render();
  setInterval(render, 300);
}

function initGridCommand() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('GridCommand', ['Timer: 10.0s', 'Tanks: 3', 'Resolve: now']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let timeLeft = 10;

  const tick = () => {
    timeLeft = Math.max(0, timeLeft - 0.05);
    const metricEls = stage.querySelectorAll('.metric');
    metricEls[0].textContent = `Timer: ${timeLeft.toFixed(1)}s`;
    metricEls[1].textContent = 'Tanks: 3';
    metricEls[2].textContent = 'Resolve: now';

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 160 + col * 80;
        const y = 70 + row * 64;
        ctx.strokeStyle = '#2e3d58';
        ctx.strokeRect(x, y, 80, 64);
      }
    }

    const tanks = [
      { x: 190, y: 100, color: '#f9a8d4' },
      { x: 420, y: 280, color: '#67e8f9' },
      { x: 620, y: 170, color: '#fbbf24' },
    ];

    tanks.forEach((tank) => {
      ctx.fillStyle = tank.color;
      ctx.fillRect(tank.x, tank.y, 24, 24);
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('All tanks move at the same instant', 245, 470);

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function initDeckArena() {
  stage.className = 'stage';
  stage.innerHTML = makeShell('DeckBuilder Arena', ['Draw: 3', 'HP: 18', 'Enemy: 12']);

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const cards = [
    { x: 95, y: 350, w: 130, h: 90, color: '#60a5fa' },
    { x: 255, y: 350, w: 130, h: 90, color: '#fbbf24' },
    { x: 415, y: 350, w: 130, h: 90, color: '#a78bfa' },
  ];

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(120, 100, 200, 120);
    ctx.fillStyle = '#f87171';
    ctx.fillRect(650, 100, 200, 120);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('YOU', 190, 165);
    ctx.fillText('ENEMY', 710, 165);

    cards.forEach((card) => {
      ctx.fillStyle = card.color;
      ctx.fillRect(card.x, card.y, card.w, card.h);
      ctx.fillStyle = '#0b1220';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('CARD', card.x + 30, card.y + 52);
    });

    ctx.fillStyle = '#dbeafe';
    ctx.font = '18px sans-serif';
    ctx.fillText('Shared draw pool • live action animations', 270, 470);
  };

  render();
  setInterval(render, 220);
}

renderGameList();
setEmptyState();
