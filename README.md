const gameCatalog = [
  {
    id: 'chopchop',
    title: 'ChopChop.io',
    icon: '🪓',
    description: 'Grid-based lumberjack battle with shrinking forest and crafting upgrades.',
    tag: 'Battle Arena',
  },
  {
    id: 'blob',
    title: 'Blob Magnet',
    icon: '🧲',
    description: 'Magnetic blobs attract and repel debris to dominate the arena.',
    tag: 'Physics Arena',
  },
  {
    id: 'neon',
    title: 'Neon Line Racer',
    icon: '🚦',
    description: 'Turbo 360° arena racer with glowing trails and wall traps.',
    tag: 'Snake / Tron',
  },
  {
    id: 'sync',
    title: 'SyncDefenders',
    icon: '🎵',
    description: 'Co-op rhythm defense where towers activate with perfect timing.',
    tag: 'Co-op Defense',
  },
  {
    id: 'escape',
    title: 'Escape the Code',
    icon: '💻',
    description: 'Asynchronous puzzle duo: fix broken code and map the maze together.',
    tag: 'Co-op Puzzle',
  },
  {
    id: 'heist',
    title: 'Pixel Art Heist',
    icon: '🕵️',
    description: 'Security camera social deduction with rotating feeds and a quick heist.',
    tag: 'Social Deduction',
  },
  {
    id: 'grid',
    title: 'GridCommand',
    icon: '⚙️',
    description: '10-second tactical grid combat where all moves resolve at once.',
    tag: 'Strategy',
  },
  {
    id: 'deck',
    title: 'DeckBuilder Arena',
    icon: '🃏',
    description: 'Real-time card duels with shared-pool action cards and sprite effects.',
    tag: 'Card Arena',
  },
];

const gridEl = document.getElementById('gamesGrid');
const stageTitle = document.getElementById('stageTitle');
const gameStage = document.getElementById('gameStage');
const resetBtn = document.getElementById('resetGameBtn');

let activeGame = null;
let activeReset = null;

function renderCards() {
  gridEl.innerHTML = gameCatalog
    .map(
      (game) => `
        <article class="game-card">
          <div class="icon">${game.icon}</div>
          <h3>${game.title}</h3>
          <p>${game.description}</p>
          <button data-game="${game.id}">${game.tag}</button>
        </article>
      `
    )
    .join('');

  gridEl.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.game;
      startGame(target);
    });
  });
}

function setStageContent(title, content) {
  stageTitle.textContent = title;
  gameStage.classList.remove('empty-state');
  gameStage.innerHTML = content;
}

function setEmptyState() {
  stageTitle.textContent = 'Select a game';
  gameStage.classList.add('empty-state');
  gameStage.innerHTML = `
    <div class="empty-copy">
      <h3>Choose a game prototype</h3>
      <p>Explore a collection of eight multiplayer-inspired browser games built as lightweight playable demos.</p>
    </div>
  `;
}

function startGame(id) {
  const game = gameCatalog.find((entry) => entry.id === id);
  if (!game) return;

  activeGame = id;
  stageTitle.textContent = game.title;

  switch (id) {
    case 'chopchop':
      activeReset = startChopChop;
      startChopChop();
      break;
    case 'blob':
      activeReset = startBlobMagnet;
      startBlobMagnet();
      break;
    case 'neon':
      activeReset = startNeonRacer;
      startNeonRacer();
      break;
    case 'sync':
      activeReset = startSyncDefenders;
      startSyncDefenders();
      break;
    case 'escape':
      activeReset = startEscapeCode;
      startEscapeCode();
      break;
    case 'heist':
      activeReset = startHeist;
      startHeist();
      break;
    case 'grid':
      activeReset = startGridCommand;
      startGridCommand();
      break;
    case 'deck':
      activeReset = startDeckArena;
      startDeckArena();
      break;
    default:
      setEmptyState();
  }
}

resetBtn.addEventListener('click', () => {
  if (activeReset) activeReset();
});

renderCards();

function makeCanvasShell(title, metrics) {
  return `
    <div class="game-shell">
      <div class="game-titlebar">
        <strong>${title}</strong>
        <div class="game-metrics">
          ${metrics.map((item) => `<span class="metric-pill">${item}</span>`).join('')}
        </div>
      </div>
      <div class="canvas-wrap">
        <canvas id="arenaCanvas" width="920" height="500"></canvas>
      </div>
    </div>
  `;
}

function startChopChop() {
  const metrics = ['Wood: 0', 'Level: 1', 'Players: 4'];
  setStageContent('ChopChop.io', makeCanvasShell('ChopChop.io', metrics));
  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');

  const player = { x: 150, y: 220, radius: 20, wood: 0, level: 1, cooldown: 0 };
  const trees = [
    { x: 280, y: 120, size: 30, hp: 80 },
    { x: 420, y: 260, size: 34, hp: 100 },
    { x: 620, y: 170, size: 26, hp: 70 },
    { x: 770, y: 330, size: 36, hp: 120 },
  ];

  const keys = { up: false, down: false, left: false, right: false, space: false };
  const onKey = (event, flag) => {
    const key = event.key.toLowerCase();
    if (key === 'w') keys.up = flag;
    if (key === 's') keys.down = flag;
    if (key === 'a') keys.left = flag;
    if (key === 'd') keys.right = flag;
    if (key === ' ') keys.space = flag;
  };
  window.addEventListener('keydown', (e) => onKey(e, true));
  window.addEventListener('keyup', (e) => onKey(e, false));

  function update() {
    const speed = 3 + player.level * 0.2;
    if (keys.up) player.y -= speed;
    if (keys.down) player.y += speed;
    if (keys.left) player.x -= speed;
    if (keys.right) player.x += speed;

    player.x = Math.max(20, Math.min(canvas.width - 20, player.x));
    player.y = Math.max(20, Math.min(canvas.height - 20, player.y));

    if (keys.space && player.cooldown <= 0) {
      const target = trees.find((tree) => Math.hypot(tree.x - player.x, tree.y - player.y) < 65);
      if (target) {
        target.hp -= 22 + player.level * 4;
        player.wood += 8;
        player.cooldown = 0.4;
        if (target.hp <= 0) {
          target.hp = 60 + Math.random() * 25;
          target.x = 40 + Math.random() * (canvas.width - 80);
          target.y = 40 + Math.random() * (canvas.height - 80);
          player.level += 1;
        }
      }
    }

    player.cooldown = Math.max(0, player.cooldown - 0.016);
    const metricNodes = document.querySelectorAll('.metric-pill');
    metricNodes[0].textContent = `Wood: ${player.wood}`;
    metricNodes[1].textContent = `Level: ${player.level}`;
    metricNodes[2].textContent = `Players: 4`;

    render();
    requestAnimationFrame(update);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#183b2c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
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
      ctx.fillStyle = '#4d9f6c';
      ctx.beginPath();
      ctx.arc(tree.x, tree.y, tree.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6b3d1c';
      ctx.fillRect(tree.x - 4, tree.y + tree.size, 8, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('HP', tree.x - 10, tree.y - tree.size - 10);
      ctx.fillText(`${Math.floor(tree.hp)}`, tree.x - 10, tree.y - tree.size - 2);
    });

    ctx.fillStyle = '#ffc857';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.fillText('You', player.x - 12, player.y - 28);
  }

  render();
  requestAnimationFrame(update);
}

function startBlobMagnet() {
  const metrics = ['Score: 0', 'Polarity: +', 'Debris: 8'];
  setStageContent('Blob Magnet', makeCanvasShell('Blob Magnet', metrics));
  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');

  const blob = { x: 200, y: 220, radius: 30, vx: 0, vy: 0, charge: 1 };
  const debris = Array.from({ length: 8 }, () => ({
    x: Math.random() * (canvas.width - 40) + 20,
    y: Math.random() * (canvas.height - 40) + 20,
    r: 10 + Math.random() * 8,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
  }));

  window.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'e') blob.charge = 1;
    if (event.key.toLowerCase() === 'q') blob.charge = -1;
  });

  function update() {
    const speed = 3.6;
    if (keysHeld['ArrowUp']) blob.y -= speed;
    if (keysHeld['ArrowDown']) blob.y += speed;
    if (keysHeld['ArrowLeft']) blob.x -= speed;
    if (keysHeld['ArrowRight']) blob.x += speed;

    blob.x = Math.max(30, Math.min(canvas.width - 30, blob.x));
    blob.y = Math.max(30, Math.min(canvas.height - 30, blob.y));

    debris.forEach((item) => {
      const dx = blob.x - item.x;
      const dy = blob.y - item.y;
      const dist = Math.hypot(dx, dy) || 1;
      const pull = 0.12 * blob.charge / Math.max(25, dist);
      item.vx += (dx / dist) * pull * 80;
      item.vy += (dy / dist) * pull * 80;
      item.x += item.vx;
      item.y += item.vy;
      item.vx *= 0.98;
      item.vy *= 0.98;
    });

    const metricsEls = document.querySelectorAll('.metric-pill');
    metricsEls[0].textContent = `Score: ${Math.round(blob.x + blob.y / 3)}`;
    metricsEls[1].textContent = `Polarity: ${blob.charge === 1 ? '+' : '-'}`;
    metricsEls[2].textContent = `Debris: ${debris.length}`;

    render();
    requestAnimationFrame(update);
  }

  const keysHeld = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
  window.addEventListener('keydown', (event) => {
    if (event.key in keysHeld) keysHeld[event.key] = true;
  });
  window.addEventListener('keyup', (event) => {
    if (event.key in keysHeld) keysHeld[event.key] = false;
  });

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#141728';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    debris.forEach((item) => {
      ctx.fillStyle = blob.charge === 1 ? '#ffbf47' : '#61dafb';
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = blob.charge === 1 ? '#7ef7d6' : '#ff7b9c';
    ctx.beginPath();
    ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  render();
  requestAnimationFrame(update);
}

function startNeonRacer() {
  const metrics = ['Speed: 4', 'Trail: 12', 'Arena: 1'];
  setStageContent('Neon Line Racer', makeCanvasShell('Neon Line Racer', metrics));
  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');

  const snake = {
    x: 220,
    y: 220,
    vx: 4,
    vy: 0,
    trail: [{ x: 220, y: 220 }],
    alive: true,
  };

  const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };

  window.addEventListener('keydown', (event) => {
    if (event.key in keys) keys[event.key] = true;
  });
  window.addEventListener('keyup', (event) => {
    if (event.key in keys) keys[event.key] = false;
  });

  function update() {
    if (!snake.alive) return;

    const nextX = snake.x + snake.vx;
    const nextY = snake.y + snake.vy;
    snake.x = nextX;
    snake.y = nextY;
    snake.trail.push({ x: snake.x, y: snake.y });
    if (snake.trail.length > 18) snake.trail.shift();

    if (snake.x < 0 || snake.x > canvas.width || snake.y < 0 || snake.y > canvas.height) {
      snake.alive = false;
    }

    if (keys.ArrowUp && snake.vy === 0) {
      snake.vx = 0;
      snake.vy = -4;
    }
    if (keys.ArrowDown && snake.vy === 0) {
      snake.vx = 0;
      snake.vy = 4;
    }
    if (keys.ArrowLeft && snake.vx === 0) {
      snake.vx = -4;
      snake.vy = 0;
    }
    if (keys.ArrowRight && snake.vx === 0) {
      snake.vx = 4;
      snake.vy = 0;
    }

    document.querySelectorAll('.metric-pill')[0].textContent = `Speed: ${Math.round(Math.hypot(snake.vx, snake.vy) * 2)}`;
    render();
    requestAnimationFrame(update);
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#120b1b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#46f1ff';
    ctx.lineWidth = 6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    snake.trail.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();

    ctx.fillStyle = '#ff52b6';
    ctx.fillRect(snake.x - 8, snake.y - 8, 16, 16);

    if (!snake.alive) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText('Crash! Press reset', 330, 250);
    }
  }

  render();
  requestAnimationFrame(update);
}

function startSyncDefenders() {
  const metrics = ['Beat: 64 BPM', 'Towers: 3', 'Sync: 87%'];
  setStageContent('SyncDefenders', makeCanvasShell('SyncDefenders', metrics));
  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');

  let beat = 0;
  let pulse = 0;
  setInterval(() => {
    beat = (beat + 1) % 4;
    pulse = 1;
  }, 250);

  function update() {
    pulse *= 0.85;
    const rhythm = (beat + 1) * 25 + pulse * 40;
    const syncMeter = 87 + Math.sin(Date.now() / 300) * 10;
    document.querySelectorAll('.metric-pill')[0].textContent = `Beat: ${64} BPM`;
    document.querySelectorAll('.metric-pill')[1].textContent = `Towers: ${3}`;
    document.querySelectorAll('.metric-pill')[2].textContent = `Sync: ${Math.round(syncMeter)}%`;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0b1420';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2c53ff';
    for (let i = 0; i < 3; i++) {
      const x = 180 + i * 210;
      const y = 270 + Math.sin((Date.now() / 300) + i) * 18;
      ctx.beginPath();
      ctx.arc(x, y, 26 + rhythm / 20, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#66f0b8';
    ctx.fillRect(110, 340, 700, 18);
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(110 + (beat / 4) * 670, 330, 28, 40);

    window.requestAnimationFrame(update);
  }

  update();
}

function startEscapeCode() {
  const metrics = ['Timer: 90s', 'Doors: 2', 'Co-op: live'];
  setStageContent('Escape the Code', makeCanvasShell('Escape the Code', metrics));
  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');

  const terminal = [
    'const unlock = () => {',
    '  if (mazeDoor === 0) {',
    '    return "nope";',
    '  }',
    '  return "open";',
    '};'
  ];
  const blueprint = ['A2: door', 'B3: lever', 'C4: key', 'D5: exit'];

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d141d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#a8e6ff';
    ctx.font = '20px monospace';
    terminal.forEach((line, index) => {
      ctx.fillText(line, 60, 90 + index * 28);
    });

    ctx.fillStyle = '#ffd166';
    blueprint.forEach((line, index) => {
      ctx.fillText(line, 520, 110 + index * 32);
    });

    ctx.strokeStyle = '#63d5ff';
    ctx.strokeRect(490, 210, 280, 180);
    ctx.fillStyle = '#7ef7d6';
    ctx.fillRect(560, 280, 120, 70);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('Doors open when both clues align', 220, 440);
  }

  draw();
  setInterval(draw, 1000);
}

function startHeist() {
  const metrics = ['Security: 3', 'Heist: live', 'Feed: 3s'];
  setStageContent('Pixel Art Heist', makeCanvasShell('Pixel Art Heist', metrics));
  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');

  let frame = 0;
  function draw() {
    frame += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f1d2d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const feedA = [
      { x: 120, y: 150, w: 130, h: 120 },
      { x: 260, y: 130, w: 120, h: 90 },
      { x: 430, y: 150, w: 140, h: 120 },
    ];

    feedA.forEach((box, index) => {
      ctx.fillStyle = index % 2 === 0 ? '#3aa0ff' : '#ffb703';
      ctx.fillRect(box.x, box.y, box.w, box.h);
    });

    ctx.fillStyle = '#ffdd7a';
    ctx.fillRect(640, 160, 120, 90);
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px sans-serif';
    ctx.fillText('Painting', 660, 220);

    ctx.fillStyle = '#8ef1f4';
    ctx.fillRect(80 + (frame % 5) * 60, 330, 80, 90);
    ctx.fillStyle = '#d9f99d';
    ctx.fillRect(700, 330, 90, 90);

    ctx.fillStyle = '#ffffff';
    ctx.fillText('Camera feed updates every 3 seconds', 250, 470);
  }

  draw();
  setInterval(draw, 300);
}

function startGridCommand() {
  const metrics = ['Timer: 10.0s', 'Tanks: 3', 'Phase: resolve'];
  setStageContent('GridCommand', makeCanvasShell('GridCommand', metrics));
  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');

  const grid = 8;
  const cells = 80;
  let timeLeft = 10;
  setInterval(() => {
    timeLeft = Math.max(0, timeLeft - 0.08);
    document.querySelectorAll('.metric-pill')[0].textContent = `Timer: ${timeLeft.toFixed(1)}s`;
  }, 80);

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#101922';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row < grid; row++) {
      for (let col = 0; col < grid; col++) {
        const x = 180 + col * cells;
        const y = 60 + row * cells;
        ctx.strokeStyle = '#2b3e59';
        ctx.strokeRect(x, y, cells, cells);
      }
    }

    const tanks = [
      { x: 220, y: 120, size: 18, color: '#ffafcc' },
      { x: 450, y: 260, size: 18, color: '#7ef7d6' },
      { x: 620, y: 160, size: 18, color: '#ffd166' },
    ];

    tanks.forEach((tank) => {
      ctx.fillStyle = tank.color;
      ctx.fillRect(tank.x, tank.y, tank.size, tank.size);
    });

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Resolve moves simultaneously', 300, 470);
  }

  draw();
  setInterval(draw, 100);
}

function startDeckArena() {
  const metrics = ['Draw: 3', 'HP: 18', 'Enemy: 12'];
  setStageContent('DeckBuilder Arena', makeCanvasShell('DeckBuilder Arena', metrics));
  const canvas = document.getElementById('arenaCanvas');
  const ctx = canvas.getContext('2d');

  const cards = [
    { x: 110, y: 360, w: 110, h: 90, c: '#49c6e5' },
    { x: 250, y: 360, w: 110, h: 90, c: '#ffbf69' },
    { x: 390, y: 360, w: 110, h: 90, c: '#c77dff' },
  ];

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0e1a2b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#7ef7d6';
    ctx.fillRect(110, 120, 180, 100);
    ctx.fillStyle = '#ff758f';
    ctx.fillRect(610, 120, 180, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = '22px sans-serif';
    ctx.fillText('You', 170, 165);
    ctx.fillText('Enemy', 660, 165);

    cards.forEach((card) => {
      ctx.fillStyle = card.c;
      ctx.fillRect(card.x, card.y, card.w, card.h);
      ctx.fillStyle = '#102230';
      ctx.fillText('CARD', card.x + 24, card.y + 48);
    });

    ctx.fillStyle = '#dfe7ff';
    ctx.fillText('Shared central pool • live sprite animations', 210, 470);
  }

  draw();
  setInterval(draw, 200);
}

const allListeners = new Set();
function addPressListener(type, handler) {
  window.addEventListener(type, handler);
  allListeners.add({ type, handler });
}

window.addEventListener('beforeunload', () => {
  allListeners.forEach(({ type, handler }) => window.removeEventListener(type, handler));
});

setEmptyState();
