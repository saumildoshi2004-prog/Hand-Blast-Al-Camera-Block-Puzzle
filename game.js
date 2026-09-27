/**
 * HAND BLAST — CYBER ARCADE EDITION
 * Pure AI Camera Hand Tracking, Procedural Chill Ambient Music, Stardust Trails, Super Bombs & Holographic HUD
 */

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================
const SIZE = 8;
const COLORS = [
  { name: "cyan", hex: "#00e5ff", glow: "rgba(0, 229, 255, 0.45)" },
  { name: "purple", hex: "#9b51e0", glow: "rgba(155, 81, 224, 0.45)" },
  { name: "pink", hex: "#ff2d92", glow: "rgba(255, 45, 146, 0.45)" },
  { name: "gold", hex: "#ffd000", glow: "rgba(255, 208, 0, 0.45)" },
  { name: "green", hex: "#00f076", glow: "rgba(0, 240, 118, 0.45)" },
  { name: "blue", hex: "#2f6fff", glow: "rgba(47, 111, 255, 0.45)" },
  { name: "orange", hex: "#ff8c00", glow: "rgba(255, 140, 0, 0.45)" },
  { name: "crimson", hex: "#ff3b56", glow: "rgba(255, 59, 86, 0.45)" }
];

// 21 Classic Block Shapes
const SHAPES = [
  // 1x1, 2x1, 3x1, 4x1, 5x1
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1, 1, 1]],
  [[1], [1], [1], [1], [1]],
  // Squares
  [[1, 1], [1, 1]],
  [[1, 1, 1], [1, 1, 1], [1, 1, 1]],
  // L Shapes
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  // T Shapes
  [[1, 1, 1], [0, 1, 0]],
  [[0, 1, 0], [1, 1, 1]],
  [[1, 0], [1, 1], [1, 0]],
  [[0, 1], [1, 1], [0, 1]],
  // Small corners & Z shapes
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]]
];

const FINGERTIPS = [4, 8, 12, 16, 20];
const PIECE_Y_OFFSET = -35;

// ============================================================================
// 2. PROCEDURAL SOUND SYNTHESIZER & CHILL AMBIENT MUSIC (WEB AUDIO API)
// ============================================================================

class SoundManager {
  constructor() {
    this.ctx = null;
    this.sfxMuted = false;
    this.musicMuted = false;
    this.musicNodes = [];
    this.musicTimer = null;
    this.bellTimer = null;
    this.musicGain = null;
    this.chordStep = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleSFX() {
    this.sfxMuted = !this.sfxMuted;
    return !this.sfxMuted;
  }

  toggleMusic() {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return !this.musicMuted;
  }

  // --- PROCEDURAL SFX ---
  playTone(freq, type = "sine", duration = 0.15, gainVal = 0.25) {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playPick() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(340, t);
      osc.frequency.exponentialRampToValueAtTime(720, t + 0.08);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(t + 0.12);
    } catch (e) {}
  }

  playDrop() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.exponentialRampToValueAtTime(65, t + 0.15);
      gain.gain.setValueAtTime(0.36, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(t + 0.18);
    } catch (e) {}
  }

  playBombExplode() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.4);
      gain.gain.setValueAtTime(0.6, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(t + 0.45);
    } catch (e) {}
  }

  playLineClear(count = 1) {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    const baseFreqs = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    const numNotes = Math.min(count + 2, baseFreqs.length);

    baseFreqs.slice(0, numNotes).forEach((freq, idx) => {
      setTimeout(() => {
        try {
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.26, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start();
          osc.stop(t + 0.35);
        } catch (e) {}
      }, idx * 55);
    });
  }

  playComboFanfare() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    [659.25, 783.99, 1046.5, 1318.51, 1567.98].forEach((f, i) => {
      setTimeout(() => this.playTone(f, "triangle", 0.25, 0.3), i * 65);
    });
  }

  playLevelUp() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.playTone(f, "sine", 0.3, 0.35), i * 80);
    });
  }

  playInvalid() {
    this.playTone(140, "sawtooth", 0.1, 0.15);
  }

  playGameOver() {
    if (this.sfxMuted) return;
    this.init();
    if (!this.ctx) return;
    [392, 349.23, 311.13, 261.63].forEach((f, i) => {
      setTimeout(() => this.playTone(f, "sawtooth", 0.35, 0.22), i * 140);
    });
  }

  // --- PROCEDURAL SLOW & SOFT CHILL AMBIENT MUSIC ---
  startMusic() {
    if (this.musicMuted) return;
    this.init();
    if (!this.ctx) return;

    this.stopMusic();

    // Master music gain for soothing, soft volume
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.musicGain.gain.linearRampToValueAtTime(0.11, this.ctx.currentTime + 2.5);
    this.musicGain.connect(this.ctx.destination);

    // Warm, lush 4-chord dreamy lo-fi progression
    // Cmaj9 -> Am9 -> Fmaj7#11 -> Em7
    const chords = [
      [130.81, 196.00, 246.94, 293.66, 329.63], // Cmaj9
      [110.00, 164.81, 196.00, 261.63, 493.88], // Am9
      [87.31, 130.81, 164.81, 220.00, 246.94],  // Fmaj7#11
      [82.41, 123.47, 146.83, 196.00, 293.66]   // Em7
    ];

    const playNextPad = () => {
      if (this.musicMuted || !this.ctx) return;
      const notes = chords[this.chordStep % chords.length];
      this.chordStep++;

      const now = this.ctx.currentTime;
      const chordDuration = 5.2;

      // Warm low-pass filter to keep sound soft and meditative
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(580, now);
      filter.frequency.linearRampToValueAtTime(750, now + 2.5);
      filter.frequency.linearRampToValueAtTime(580, now + chordDuration);
      filter.connect(this.musicGain);

      notes.forEach((freq) => {
        try {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now);

          // Gentle 1.8s fade in, soft sustain, 2.0s fade out
          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.06, now + 1.8);
          g.gain.linearRampToValueAtTime(0.04, now + 3.4);
          g.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

          osc.connect(g);
          g.connect(filter);

          osc.start(now);
          osc.stop(now + chordDuration);
        } catch (e) {}
      });
    };

    // Soft celestial kalimba / bell plucks drifting in the clouds
    const pentatonic = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
    const playSoftBell = () => {
      if (this.musicMuted || !this.ctx) return;
      const freq = pentatonic[Math.floor(Math.random() * pentatonic.length)];
      const now = this.ctx.currentTime;

      try {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now);

        g.gain.setValueAtTime(0.001, now);
        g.gain.linearRampToValueAtTime(0.035, now + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(g);
        g.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + 1.8);
      } catch (e) {}
    };

    playNextPad();
    this.musicTimer = setInterval(playNextPad, 4800);
    this.bellTimer = setInterval(playSoftBell, 2200);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.bellTimer) {
      clearInterval(this.bellTimer);
      this.bellTimer = null;
    }
    if (this.musicGain && this.ctx) {
      try {
        this.musicGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);
      } catch (e) {}
    }
  }
}

const sounds = new SoundManager();

// ============================================================================
// 3. GAME STATE & DOM ELEMENTS
// ============================================================================
const $ = (id) => document.getElementById(id);

const boardCanvas = $("board");
const ctx = boardCanvas.getContext("2d");
const dragCanvas = $("dragCanvas");
const dragCtx = dragCanvas.getContext("2d");
const dragGhost = $("dragGhost");
const virtualCursor = $("virtualCursor");
const cursorState = $("cursorState");
const boardOuter = $("boardOuter");

const cursorFxCanvas = $("cursorFx");
const fxCtx = cursorFxCanvas.getContext("2d");

const video = $("video");
const handCanvas = $("handCanvas");
const hctx = handCanvas.getContext("2d");

const scoreEl = $("score");
const bestEl = $("best");
const comboBadge = $("comboBadge");
const comboText = $("comboText");
const guidanceBar = $("guidanceBar");
const guidanceText = $("guidanceText");
const guidanceIcon = $("guidanceIcon");
const flashEl = $("flash");
const floatingScores = $("floatingScores");
const crownIcon = $("crownIcon");

const levelBadge = $("levelBadge");
const levelFill = $("levelFill");
const announcerBanner = $("announcerBanner");
const announcerText = $("announcerText");
const announcerSub = $("announcerSub");
const musicToggleBtn = $("musicToggle");
const musicLabel = $("musicLabel");
const musicIcon = $("musicIcon");

const pinchFill = $("pinchFill");
const pinchPct = $("pinchPct");
const hudStatus = $("hudStatus");
const statusPip = $("statusPip");
const scanAlert = $("scanAlert");

let grid = [];
let pieces = [null, null, null];
let score = 0;
let bestScore = +localStorage.getItem("handBlastBest") || 0;
let totalLinesCleared = 0;
let comboStreak = 0;
let maxCombo = 0;
let currentLevel = 1;
let isGameOver = false;

// Dragging & Accurate Drop State
let isDragging = false;
let draggedPieceIndex = -1;
let draggedPiece = null;
let currentHoverCell = null;
let hoveredSlotIndex = -1;

// Latch to prevent drop jumping during unpinch gesture
let lastValidHoverCell = null;
let lastValidHoverTimestamp = 0;

// Hand Tracking State
let handsModel = null;
let cameraStream = null;
let handPresent = false;
let isPinching = false;
let lastPinchState = false;
let missedHandFrames = 0;

// Cursor Coordinates (Screen Space)
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let targetCursorX = cursorX;
let targetCursorY = cursorY;

// Particle & Stardust Engines
let particles = [];
let stardustParticles = [];
let ambientMotes = [];
let gameTime = 0;

// ============================================================================
// 4. BOARD, PIECES & RENDERING
// ============================================================================

function initGrid() {
  grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function initAmbientMotes() {
  ambientMotes = [];
  for (let i = 0; i < 28; i++) {
    ambientMotes.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: -0.3 - Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      size: 1.2 + Math.random() * 2.2,
      alpha: 0.15 + Math.random() * 0.35,
      color: Math.random() > 0.5 ? "#00e5ff" : "#9b51e0"
    });
  }
}

function randPiece() {
  // 15% chance to spawn special Golden Super Bomb on combos or random
  const isBomb = (comboStreak >= 2 && Math.random() < 0.35) || Math.random() < 0.08;
  if (isBomb) {
    return {
      shape: [[1]],
      color: { name: "bomb", hex: "#ffd000", glow: "rgba(255, 208, 0, 0.7)" },
      isBomb: true
    };
  }

  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { shape, color, isBomb: false };
}

function replenishPieces() {
  pieces = [randPiece(), randPiece(), randPiece()];
  drawPieceSlots();
}

function getBoardMetrics() {
  const w = boardCanvas.clientWidth;
  const gap = Math.max(3, Math.floor(w * 0.015));
  const cellSize = Math.floor((w - gap * (SIZE + 1)) / SIZE);
  return { w, gap, cellSize };
}

function shadeColor(hex, amt) {
  let col = hex.replace("#", "");
  let num = parseInt(col, 16);
  let r = Math.max(0, Math.min(255, (num >> 16) + amt));
  let g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  let b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `rgb(${r},${g},${b})`;
}

function drawRoundedRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function drawBlock(c, x, y, size, colorObj, alpha = 1, isGhost = false, isValid = true, isBomb = false) {
  c.save();
  c.globalAlpha = alpha;
  const radius = Math.max(4, size * 0.2);

  if (isGhost) {
    const strokeColor = isValid ? colorObj.hex : "#ff3b56";
    drawRoundedRect(c, x + 2, y + 2, size - 4, size - 4, radius);
    c.fillStyle = isValid ? "rgba(0, 229, 255, 0.4)" : "rgba(255, 59, 86, 0.3)";
    c.fill();
    c.lineWidth = 2.5;
    c.strokeStyle = strokeColor;
    c.shadowColor = strokeColor;
    c.shadowBlur = 12;
    c.stroke();
    c.restore();
    return;
  }

  // 3D Beveled Jewel Block
  c.shadowColor = colorObj.glow || colorObj.hex;
  c.shadowBlur = size * 0.25;

  const grad = c.createLinearGradient(x, y, x + size, y + size);
  grad.addColorStop(0, shadeColor(colorObj.hex, 30));
  grad.addColorStop(0.5, colorObj.hex);
  grad.addColorStop(1, shadeColor(colorObj.hex, -40));

  drawRoundedRect(c, x, y, size, size, radius);
  c.fillStyle = grad;
  c.fill();

  // Glossy facet highlight
  c.shadowBlur = 0;
  c.fillStyle = "rgba(255, 255, 255, 0.45)";
  drawRoundedRect(c, x + size * 0.12, y + size * 0.08, size * 0.76, size * 0.18, radius * 0.5);
  c.fill();

  // Sparkling diamond glint
  c.fillStyle = "#fff";
  c.beginPath();
  c.arc(x + size * 0.24, y + size * 0.22, Math.max(1.5, size * 0.06), 0, Math.PI * 2);
  c.fill();

  // Subtle border outline
  c.strokeStyle = "rgba(255, 255, 255, 0.28)";
  c.lineWidth = 1;
  drawRoundedRect(c, x, y, size, size, radius);
  c.stroke();

  // Super Bomb Icon badge
  if (isBomb) {
    c.font = `${Math.round(size * 0.52)}px sans-serif`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText("💣", x + size / 2, y + size / 2 + 1);
  }

  c.restore();
}

function getNearClearLines() {
  const nearRows = [];
  const nearCols = [];

  for (let r = 0; r < SIZE; r++) {
    const filled = grid[r].filter(Boolean).length;
    if (filled === SIZE - 1) nearRows.push(r);
  }

  for (let col = 0; col < SIZE; col++) {
    let filled = 0;
    for (let r = 0; r < SIZE; r++) {
      if (grid[r][col]) filled++;
    }
    if (filled === SIZE - 1) nearCols.push(col);
  }

  return { nearRows, nearCols };
}

function drawBoard() {
  const { w, gap, cellSize } = getBoardMetrics();
  ctx.clearRect(0, 0, w, w);

  // 1. Draw 8x8 Empty Inset Wells
  for (let r = 0; r < SIZE; r++) {
    for (let col = 0; col < SIZE; col++) {
      const x = gap + col * (cellSize + gap);
      const y = gap + r * (cellSize + gap);

      drawRoundedRect(ctx, x, y, cellSize, cellSize, Math.max(4, cellSize * 0.2));
      ctx.fillStyle = "rgba(18, 26, 44, 0.85)";
      ctx.fill();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.stroke();

      if (grid[r][col]) {
        drawBlock(ctx, x, y, cellSize, grid[r][col]);
      }
    }
  }

  // 2. Near-Clear Electric Anticipation Shimmer
  const { nearRows, nearCols } = getNearClearLines();
  const shimmerAlpha = 0.35 + Math.sin(gameTime * 0.08) * 0.2;

  nearRows.forEach((r) => {
    const y = gap + r * (cellSize + gap);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 208, 0, ${shimmerAlpha})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#ffd000";
    ctx.shadowBlur = 10;
    drawRoundedRect(ctx, gap - 2, y - 2, w - 2 * gap + 4, cellSize + 4, 8);
    ctx.stroke();
    ctx.restore();
  });

  nearCols.forEach((col) => {
    const x = gap + col * (cellSize + gap);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 208, 0, ${shimmerAlpha})`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = "#ffd000";
    ctx.shadowBlur = 10;
    drawRoundedRect(ctx, x - 2, gap - 2, cellSize + 4, w - 2 * gap + 4, 8);
    ctx.stroke();
    ctx.restore();
  });

  // 3. Sci-Fi CAD Alignment Laser Guides when Dragging over Board
  if (isDragging && currentHoverCell && currentHoverCell.valid) {
    const { r: startR, c: startC } = currentHoverCell;
    const targetY = gap + startR * (cellSize + gap) + cellSize / 2;
    const targetX = gap + startC * (cellSize + gap) + cellSize / 2;

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(0, 229, 255, 0.25)";
    ctx.lineWidth = 1.5;

    // Horizontal laser
    ctx.beginPath();
    ctx.moveTo(gap, targetY);
    ctx.lineTo(w - gap, targetY);
    ctx.stroke();

    // Vertical laser
    ctx.beginPath();
    ctx.moveTo(targetX, gap);
    ctx.lineTo(targetX, w - gap);
    ctx.stroke();
    ctx.restore();
  }

  // 4. Draw Live Ghost Placement Preview
  if (isDragging && draggedPiece && currentHoverCell) {
    const { r: startR, c: startC, valid } = currentHoverCell;
    const shape = draggedPiece.shape;

    if (draggedPiece.isBomb && valid) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const br = startR + dr;
          const bc = startC + dc;
          if (br >= 0 && br < SIZE && bc >= 0 && bc < SIZE) {
            const bx = gap + bc * (cellSize + gap);
            const by = gap + br * (cellSize + gap);
            ctx.save();
            ctx.fillStyle = "rgba(255, 208, 0, 0.28)";
            ctx.strokeStyle = "#ffd000";
            ctx.lineWidth = 2;
            drawRoundedRect(ctx, bx + 1, by + 1, cellSize - 2, cellSize - 2, 6);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }
      }
    } else {
      for (let r = 0; r < shape.length; r++) {
        for (let c = 0; c < shape[r].length; c++) {
          if (shape[r][c]) {
            const targetR = startR + r;
            const targetC = startC + c;
            if (targetR >= 0 && targetR < SIZE && targetC >= 0 && targetC < SIZE) {
              const x = gap + targetC * (cellSize + gap);
              const y = gap + targetR * (cellSize + gap);
              drawBlock(ctx, x, y, cellSize, draggedPiece.color, 0.85, true, valid, draggedPiece.isBomb);
            }
          }
        }
      }
    }
  }

  // 5. Draw Line Clear Particle Explosions
  drawParticles();
}

function drawPieceSlots() {
  pieces.forEach((p, i) => {
    const slot = document.querySelector(`.piece-slot[data-i="${i}"]`);
    if (!slot) return;
    const canvas = slot.querySelector("canvas");
    const bombTag = slot.querySelector(".bomb-tag");
    if (!canvas) return;

    const r = canvas.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = r.width * d;
    canvas.height = r.height * d;

    const q = canvas.getContext("2d");
    q.setTransform(d, 0, 0, d, 0, 0);
    q.clearRect(0, 0, r.width, r.height);

    if (!p) {
      slot.classList.remove("active-pick", "hover-ready", "is-bomb");
      if (bombTag) bombTag.classList.add("hidden");
      return;
    }

    if (p.isBomb) {
      slot.classList.add("is-bomb");
      if (bombTag) bombTag.classList.remove("hidden");
    } else {
      slot.classList.remove("is-bomb");
      if (bombTag) bombTag.classList.add("hidden");
    }

    if (draggedPieceIndex === i && isDragging) {
      slot.classList.add("active-pick");
    } else {
      slot.classList.remove("active-pick");
    }

    const rows = p.shape.length;
    const cols = p.shape[0].length;
    const s = Math.min(26, (r.width - 24) / cols, (r.height - 24) / rows);
    const ox = (r.width - cols * s) / 2;
    const oy = (r.height - rows * s) / 2;

    p.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          drawBlock(q, ox + x * s, oy + y * s, s - 3, p.color, 1, false, true, p.isBomb);
        }
      });
    });
  });
}

function renderDraggedPiece(p) {
  if (!p) {
    dragGhost.classList.add("hidden");
    return;
  }
  dragGhost.classList.remove("hidden");

  const rows = p.shape.length;
  const cols = p.shape[0].length;
  const cellSize = 38;
  const w = cols * cellSize + 8;
  const h = rows * cellSize + 8;

  const d = Math.min(window.devicePixelRatio || 1, 2);
  dragCanvas.width = w * d;
  dragCanvas.height = h * d;
  dragCanvas.style.width = `${w}px`;
  dragCanvas.style.height = `${h}px`;

  dragCtx.setTransform(d, 0, 0, d, 0, 0);
  dragCtx.clearRect(0, 0, w, h);

  p.shape.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val) {
        drawBlock(dragCtx, 4 + x * cellSize, 4 + y * cellSize, cellSize - 4, p.color, 1, false, true, p.isBomb);
      }
    });
  });
}

function updateDragGhostPosition(x, y) {
  if (!isDragging) return;
  dragGhost.style.left = `${x}px`;
  dragGhost.style.top = `${y + PIECE_Y_OFFSET}px`;
}

// ============================================================================
// 5. GAME RULES: PLACEMENT, COMBOS, BOMBS & ANNOUNCERS
// ============================================================================

function canPlace(p, startR, startC) {
  if (!p) return false;
  for (let r = 0; r < p.shape.length; r++) {
    for (let c = 0; c < p.shape[r].length; c++) {
      if (p.shape[r][c]) {
        const y = startR + r;
        const x = startC + c;
        if (y < 0 || y >= SIZE || x < 0 || x >= SIZE) return false;
        if (grid[y][x]) return false;
      }
    }
  }
  return true;
}

function placePiece(p, startR, startC) {
  if (!canPlace(p, startR, startC)) return false;

  // Super Bomb Detonation
  if (p.isBomb) {
    let clearedBlocks = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const br = startR + dr;
        const bc = startC + dc;
        if (br >= 0 && br < SIZE && bc >= 0 && bc < SIZE) {
          if (grid[br][bc]) {
            spawnParticlesForCell(br, bc, grid[br][bc]);
            grid[br][bc] = null;
            clearedBlocks++;
          }
        }
      }
    }

    triggerScreenShake("lg");
    sounds.playBombExplode();
    const earned = 250 + clearedBlocks * 25;
    addScore(earned);
    triggerAnnouncer("SUPER BOMB! 💣", `+${earned} BLAST POINTS`);
    return true;
  }

  // Standard Placement
  let blockCount = 0;
  p.shape.forEach((row, r) => {
    row.forEach((val, c) => {
      if (val) {
        grid[startR + r][startC + c] = p.color;
        blockCount++;
      }
    });
  });

  addScore(blockCount * 5);
  sounds.playDrop();

  const linesCleared = clearLines();

  if (linesCleared > 0) {
    comboStreak++;
    if (comboStreak > maxCombo) maxCombo = comboStreak;

    const titles = {
      1: "NICE CLEAR! ⚡",
      2: "DOUBLE BLAST! 💥",
      3: "TRIPLE COMBO! 🔥",
      4: "MEGA BLAST! 👑"
    };
    const title = titles[linesCleared] || `${linesCleared}X SUPER BLAST! ⚡`;
    const sub = comboStreak > 1 ? `COMBO x${comboStreak} MULTIPLIER!` : `GREAT SHOT!`;
    triggerAnnouncer(title, sub);

    triggerScreenShake(linesCleared > 1 ? "lg" : "sm");

    if (comboStreak > 1) {
      sounds.playComboFanfare();
      showComboBadge(comboStreak);
    }
  } else {
    comboStreak = 0;
    hideComboBadge();
  }

  document.body.classList.toggle("combo-hot", comboStreak >= 2);
  return true;
}

function clearLines() {
  const fullRows = [];
  const fullCols = [];

  for (let r = 0; r < SIZE; r++) {
    if (grid[r].every(Boolean)) fullRows.push(r);
  }

  for (let c = 0; c < SIZE; c++) {
    let ok = true;
    for (let r = 0; r < SIZE; r++) {
      if (!grid[r][c]) { ok = false; break; }
    }
    if (ok) fullCols.push(c);
  }

  const totalLines = fullRows.length + fullCols.length;
  if (totalLines === 0) return 0;

  totalLinesCleared += totalLines;

  fullRows.forEach((r) => {
    for (let c = 0; c < SIZE; c++) {
      spawnParticlesForCell(r, c, grid[r][c]);
    }
  });

  fullCols.forEach((c) => {
    for (let r = 0; r < SIZE; r++) {
      spawnParticlesForCell(r, c, grid[r][c]);
    }
  });

  fullRows.forEach((r) => grid[r].fill(null));
  fullCols.forEach((c) => {
    for (let r = 0; r < SIZE; r++) grid[r][c] = null;
  });

  const linePointsMap = { 1: 100, 2: 250, 3: 450, 4: 700 };
  const basePoints = linePointsMap[totalLines] || (totalLines * 200);
  const multiplier = Math.max(1, comboStreak + 1);
  const totalEarned = basePoints * multiplier;

  addScore(totalEarned);
  sounds.playLineClear(totalLines);

  flashEl.classList.remove("boom");
  void flashEl.offsetWidth;
  flashEl.classList.add("boom");

  const label = totalLines > 1 ? `+${totalEarned} (${totalLines} LINES!)` : `+${totalEarned}`;
  spawnScorePopup(label);

  return totalLines;
}

function addScore(n) {
  score += n;
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("handBlastBest", bestScore);
    crownIcon.classList.remove("hidden");
  }
  scoreEl.textContent = score;
  bestEl.textContent = bestScore;

  const newLevel = Math.floor(score / 400) + 1;
  if (newLevel > currentLevel) {
    currentLevel = newLevel;
    sounds.playLevelUp();
    triggerAnnouncer(`LEVEL ${currentLevel}! 🚀`, "BOARD MASTERY UPGRADE");
  }
  levelBadge.textContent = `LVL ${currentLevel}`;
  const pct = Math.min(100, Math.round(((score % 400) / 400) * 100));
  levelFill.style.width = `${pct}%`;
}

function showComboBadge(streak) {
  comboBadge.classList.remove("hidden");
  comboText.textContent = `COMBO x${streak}`;
}

function hideComboBadge() {
  comboBadge.classList.add("hidden");
}

function triggerAnnouncer(title, sub) {
  announcerText.textContent = title;
  announcerSub.textContent = sub;
  announcerBanner.classList.remove("hidden");
  void announcerBanner.offsetWidth;
  announcerBanner.classList.remove("hidden");

  clearTimeout(triggerAnnouncer._timer);
  triggerAnnouncer._timer = setTimeout(() => {
    announcerBanner.classList.add("hidden");
  }, 1200);
}

function triggerScreenShake(type = "sm") {
  boardOuter.classList.remove("shake-sm", "shake-lg");
  void boardOuter.offsetWidth;
  boardOuter.classList.add(type === "lg" ? "shake-lg" : "shake-sm");
  setTimeout(() => {
    boardOuter.classList.remove("shake-sm", "shake-lg");
  }, 450);
}

function spawnScorePopup(text) {
  const el = document.createElement("div");
  el.className = "score-popup";
  el.textContent = text;
  el.style.left = "50%";
  el.style.top = "50%";
  floatingScores.appendChild(el);

  setTimeout(() => {
    if (el.parentNode) el.parentNode.removeChild(el);
  }, 950);
}

function spawnParticlesForCell(r, c, colorObj) {
  if (!colorObj) return;
  const { gap, cellSize } = getBoardMetrics();
  const cx = gap + c * (cellSize + gap) + cellSize / 2;
  const cy = gap + r * (cellSize + gap) + cellSize / 2;

  const count = 10;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2.5 + Math.random() * 6.5;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 3.5 + Math.random() * 4,
      life: 1.0,
      decay: 0.025 + Math.random() * 0.03,
      color: colorObj.hex
    });
  }
}

function drawParticles() {
  if (!particles.length) return;
  particles.forEach((p) => {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.12;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ============================================================================
// 6. STARDUST MAGIC TRAILS & FULLSCREEN AMBIENT FX
// ============================================================================

function emitStardust(x, y) {
  const palette = ["#00e5ff", "#ffd000", "#ff2d92", "#ffffff"];
  for (let i = 0; i < 2; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = 0.5 + Math.random() * 2.2;
    stardustParticles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd + 0.3,
      size: 1.8 + Math.random() * 2.5,
      life: 1.0,
      decay: 0.03 + Math.random() * 0.035,
      color: palette[Math.floor(Math.random() * palette.length)]
    });
  }
}

function renderFullscreenFx() {
  fxCtx.clearRect(0, 0, cursorFxCanvas.width, cursorFxCanvas.height);

  // 1. Draw drifting ambient cosmic dust motes
  ambientMotes.forEach((m) => {
    m.y += m.vy;
    m.x += m.vx;
    if (m.y < -10) m.y = window.innerHeight + 10;
    if (m.x < -10) m.x = window.innerWidth + 10;
    if (m.x > window.innerWidth + 10) m.x = -10;

    fxCtx.save();
    fxCtx.globalAlpha = m.alpha;
    fxCtx.fillStyle = m.color;
    fxCtx.beginPath();
    fxCtx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    fxCtx.fill();
    fxCtx.restore();
  });

  // 2. Draw glowing stardust following fingertip
  for (let i = stardustParticles.length - 1; i >= 0; i--) {
    const p = stardustParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= p.decay;

    if (p.life <= 0) {
      stardustParticles.splice(i, 1);
      continue;
    }

    fxCtx.save();
    fxCtx.globalAlpha = p.life;
    fxCtx.fillStyle = p.color;
    fxCtx.shadowColor = p.color;
    fxCtx.shadowBlur = 8;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    fxCtx.fill();
    fxCtx.restore();
  }
}

function hasAnyLegalMoves() {
  const activePieces = pieces.filter(Boolean);
  if (!activePieces.length) return true;

  return activePieces.some((p) => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (canPlace(p, r, c)) return true;
      }
    }
    return false;
  });
}

function checkGameOver() {
  if (!hasAnyLegalMoves()) {
    isGameOver = true;
    sounds.playGameOver();
    $("finalScore").textContent = score;
    $("finalBest").textContent = bestScore;
    $("finalLines").textContent = totalLinesCleared;
    $("finalMaxCombo").textContent = `${maxCombo}x`;
    $("gameOver").classList.remove("hidden");
  }
}

// ============================================================================
// 7. PRECISE ZERO-OFFSET TARGETING & DROP LOGIC
// ============================================================================

function getBoardCellFromScreen(screenX, screenY, piece) {
  const rect = boardCanvas.getBoundingClientRect();
  
  if (
    screenX < rect.left - 50 ||
    screenX > rect.right + 50 ||
    screenY < rect.top - 50 ||
    screenY > rect.bottom + 50
  ) {
    return null;
  }

  const { gap, cellSize } = getBoardMetrics();
  const relX = screenX - rect.left;
  const relY = screenY - rect.top;

  const rows = piece ? piece.shape.length : 1;
  const cols = piece ? piece.shape[0].length : 1;

  const colFraction = (relX - gap - cellSize / 2) / (cellSize + gap);
  const rowFraction = (relY - gap - cellSize / 2) / (cellSize + gap);

  const startC = Math.round(colFraction - (cols - 1) / 2);
  const startR = Math.round(rowFraction - (rows - 1) / 2);

  const valid = piece ? canPlace(piece, startR, startC) : false;
  return { r: startR, c: startC, valid };
}

function getPieceSlotFromScreen(screenX, screenY) {
  const boardRect = boardCanvas.getBoundingClientRect();

  for (let i = 0; i < 3; i++) {
    if (!pieces[i]) continue;
    const slot = document.querySelector(`.piece-slot[data-i="${i}"]`);
    if (!slot) continue;
    const r = slot.getBoundingClientRect();
    if (
      screenX >= r.left - 40 &&
      screenX <= r.right + 40 &&
      screenY >= r.top - 30 &&
      screenY <= r.bottom + 30
    ) {
      return i;
    }
  }

  if (screenX < boardRect.left - 10) {
    let closestIdx = -1;
    let minDist = Infinity;
    for (let i = 0; i < 3; i++) {
      if (!pieces[i]) continue;
      const slot = document.querySelector(`.piece-slot[data-i="${i}"]`);
      if (!slot) continue;
      const r = slot.getBoundingClientRect();
      const centerY = (r.top + r.bottom) / 2;
      const d = Math.abs(screenY - centerY);
      if (d < minDist && d < 130) {
        minDist = d;
        closestIdx = i;
      }
    }
    if (closestIdx >= 0) return closestIdx;
  }

  return -1;
}

function startDraggingPiece(index, x, y) {
  if (!pieces[index]) return;
  isDragging = true;
  draggedPieceIndex = index;
  draggedPiece = pieces[index];
  lastValidHoverCell = null;

  sounds.playPick();
  renderDraggedPiece(draggedPiece);
  updateDragGhostPosition(x, y);
  drawPieceSlots();

  setGuidance("🎯 Move over board • Release pinch to place", "🎯");
}

function updateDragging(x, y) {
  updateDragGhostPosition(x, y);

  if (isDragging && draggedPiece) {
    currentHoverCell = getBoardCellFromScreen(x, y + PIECE_Y_OFFSET, draggedPiece);

    if (currentHoverCell && currentHoverCell.valid) {
      lastValidHoverCell = { r: currentHoverCell.r, c: currentHoverCell.c };
      lastValidHoverTimestamp = Date.now();
      setGuidance("🎯 Release pinch to drop block right here!", "✨");
    } else if (currentHoverCell && !currentHoverCell.valid) {
      setGuidance("⚠️ Block doesn't fit in these cells", "⚠️");
    } else {
      setGuidance("✊ Drag block over the board", "🎯");
    }
  }
}

function stopDraggingPiece(x, y) {
  if (!isDragging) return;

  let target = currentHoverCell;

  if ((!target || !target.valid) && lastValidHoverCell) {
    const timeSinceValid = Date.now() - lastValidHoverTimestamp;
    if (timeSinceValid < 400 && canPlace(draggedPiece, lastValidHoverCell.r, lastValidHoverCell.c)) {
      target = { r: lastValidHoverCell.r, c: lastValidHoverCell.c, valid: true };
    }
  }

  let placed = false;
  if (target && target.valid) {
    placed = placePiece(draggedPiece, target.r, target.c);
  }

  if (placed) {
    pieces[draggedPieceIndex] = null;
    drawPieceSlots();

    if (pieces.every((p) => p === null)) {
      replenishPieces();
    }

    checkGameOver();
    setGuidance("☝ Great move! Pinch another block on the left", "✨");
  } else {
    sounds.playInvalid();
    setGuidance("❌ Cannot place there! Piece returned to dock", "⚠️");
  }

  isDragging = false;
  draggedPieceIndex = -1;
  draggedPiece = null;
  currentHoverCell = null;
  lastValidHoverCell = null;
  renderDraggedPiece(null);
  drawPieceSlots();
}

// ============================================================================
// 8. SCI-FI HUD & FINGERTIP TRACKING (ROTATING RETICLE)
// ============================================================================

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function drawFingertipDots(lm, pinched) {
  const w = handCanvas.clientWidth;
  const h = handCanvas.clientHeight;
  hctx.clearRect(0, 0, w, h);

  hctx.save();
  const pt = (i) => ({ x: lm[i].x * w, y: lm[i].y * h });

  // 1. Draw glowing dots on all 5 fingertips
  FINGERTIPS.forEach((i) => {
    const p = pt(i);
    const isIndex = i === 8;
    const isThumb = i === 4;

    hctx.save();
    hctx.beginPath();
    hctx.arc(p.x, p.y, isIndex ? 7 : isThumb ? 6 : 4.5, 0, Math.PI * 2);
    hctx.fillStyle = isIndex ? (pinched ? "#fff" : "#ffd000") : (isThumb && pinched ? "#fff" : "#00e5ff");
    hctx.shadowColor = isIndex ? (pinched ? "#ffd000" : "#ffd000") : "#00e5ff";
    hctx.shadowBlur = 10;
    hctx.fill();
    hctx.restore();
  });

  // 2. Futuristic Rotating Reticle around Index Fingertip
  const indexPt = pt(8);
  const angle = gameTime * 0.05;

  hctx.save();
  hctx.translate(indexPt.x, indexPt.y);
  hctx.rotate(angle);

  // Outer segmented bracket ring
  hctx.beginPath();
  hctx.arc(0, 0, 16, 0, Math.PI * 0.6);
  hctx.arc(0, 0, 16, Math.PI, Math.PI * 1.6);
  hctx.lineWidth = 2;
  hctx.strokeStyle = pinched ? "#ffd000" : "#00e5ff";
  hctx.shadowColor = pinched ? "#ffd000" : "#00e5ff";
  hctx.shadowBlur = 8;
  hctx.stroke();

  // Crosshair ticks
  hctx.beginPath();
  hctx.moveTo(0, -20); hctx.lineTo(0, -14);
  hctx.moveTo(0, 14); hctx.lineTo(0, 20);
  hctx.moveTo(-20, 0); hctx.lineTo(-14, 0);
  hctx.moveTo(14, 0); hctx.lineTo(20, 0);
  hctx.stroke();

  hctx.restore();

  // 3. Glowing energy beam when pinching
  if (pinched) {
    const thumbPt = pt(4);
    hctx.save();
    hctx.beginPath();
    hctx.moveTo(indexPt.x, indexPt.y);
    hctx.lineTo(thumbPt.x, thumbPt.y);
    hctx.lineWidth = 3;
    hctx.strokeStyle = "#ffd000";
    hctx.shadowColor = "#ffd000";
    hctx.shadowBlur = 12;
    hctx.stroke();
    hctx.restore();
  }

  hctx.restore();
}

function processHandLandmarks(lm) {
  const indexTip = lm[8];
  const thumbTip = lm[4];
  const wrist = lm[0];
  const middleMcp = lm[9];

  // 1. Adaptive scale-normalized pinch distance
  const handScale = Math.max(0.04, dist(wrist, middleMcp));
  const rawDist = dist(indexTip, thumbTip);
  const pinchRatio = rawDist / handScale;

  let pinched = isPinching;
  if (!isPinching && pinchRatio < 0.50) {
    pinched = true;
  } else if (isPinching && pinchRatio > 0.62) {
    pinched = false;
  }

  const meterVal = Math.max(0, Math.min(100, Math.round((1 - (pinchRatio - 0.22) / 0.45) * 100)));
  pinchPct.textContent = `${meterVal}%`;
  pinchFill.style.width = `${meterVal}%`;
  pinchFill.classList.toggle("pinched", pinched);

  // 2. NATURAL PHYSICAL COORDINATE REMAPPING (Right = Right, Left = Left)
  const normX = 1 - indexTip.x;
  const normY = indexTip.y;

  const marginX = 0.16;
  const marginY = 0.14;
  const mappedX = (normX - marginX) / (1 - 2 * marginX);
  const mappedY = (normY - marginY) / (1 - 2 * marginY);

  const clampedX = Math.max(0.02, Math.min(0.98, mappedX));
  const clampedY = Math.max(0.02, Math.min(0.98, mappedY));

  targetCursorX = clampedX * window.innerWidth;
  targetCursorY = clampedY * window.innerHeight;

  drawFingertipDots(lm, pinched);

  // Emit stardust trail behind fingertip pointer
  emitStardust(targetCursorX, targetCursorY);

  // 3. Hover detection for Left Block Slots
  const slotIdx = getPieceSlotFromScreen(cursorX, cursorY);
  if (slotIdx !== hoveredSlotIndex) {
    if (hoveredSlotIndex >= 0) {
      const prev = document.querySelector(`.piece-slot[data-i="${hoveredSlotIndex}"]`);
      if (prev) prev.classList.remove("hover-ready");
    }
    if (slotIdx >= 0) {
      const curr = document.querySelector(`.piece-slot[data-i="${slotIdx}"]`);
      if (curr) curr.classList.add("hover-ready");
    }
    hoveredSlotIndex = slotIdx;
  }

  // 4. Gesture State Machine
  if (pinched && !lastPinchState && !isDragging) {
    if (slotIdx >= 0) {
      startDraggingPiece(slotIdx, cursorX, cursorY);
    }
  }

  if (isDragging) {
    updateDragging(cursorX, cursorY);
  }

  if (!pinched && lastPinchState && isDragging) {
    stopDraggingPiece(cursorX, cursorY);
  }

  isPinching = pinched;
  lastPinchState = pinched;

  virtualCursor.classList.toggle("pinching", isPinching);
  cursorState.textContent = isDragging ? "DRAGGING" : isPinching ? "PINCH" : slotIdx >= 0 ? "GRAB" : "AIM";
}

async function startReliableHandTracking() {
  if (typeof Hands === "undefined") {
    throw new Error("MediaPipe Hands library is not loaded from CDN.");
  }

  hudStatus.textContent = "INITIALIZING AI VISION…";
  scanAlert.textContent = "LOADING HAND MODEL…";

  handsModel = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
  });

  handsModel.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.35,
    minTrackingConfidence: 0.35
  });

  handsModel.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      missedHandFrames = 0;
      if (!handPresent) {
        handPresent = true;
        statusPip.className = "status-pip";
        scanAlert.textContent = "● HAND DETECTED";
        hudStatus.textContent = "● TRACKING ACTIVE";
        virtualCursor.classList.remove("hidden");
      }
      processHandLandmarks(results.multiHandLandmarks[0]);
    } else {
      missedHandFrames++;
      if (missedHandFrames > 8) {
        handPresent = false;
        statusPip.className = "status-pip searching";
        scanAlert.textContent = "SHOW HAND TO CAMERA";
        hudStatus.textContent = "SEARCHING FOR HAND…";
        hctx.clearRect(0, 0, handCanvas.clientWidth, handCanvas.clientHeight);
      }
    }
  });

  let isProcessing = false;
  async function videoLoop() {
    if (video && video.readyState >= 2 && handsModel && !isProcessing) {
      isProcessing = true;
      try {
        await handsModel.send({ image: video });
      } catch (err) {}
      isProcessing = false;
    }

    if ("requestVideoFrameCallback" in video) {
      video.requestVideoFrameCallback(videoLoop);
    } else {
      requestAnimationFrame(videoLoop);
    }
  }

  if ("requestVideoFrameCallback" in video) {
    video.requestVideoFrameCallback(videoLoop);
  } else {
    requestAnimationFrame(videoLoop);
  }
}

async function startCamera() {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("CAMERA_UNSUPPORTED");
    }

    statusPip.className = "status-pip searching";
    hudStatus.textContent = "REQUESTING CAMERA…";

    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
      },
      audio: false
    });

    video.srcObject = cameraStream;
    await video.play();

    hudStatus.textContent = "CAMERA READY • LOADING MODEL…";
    scanAlert.textContent = "AI INITIALIZING…";
    statusPip.className = "status-pip searching";

    await startReliableHandTracking();
  } catch (err) {
    console.error("Camera startup failed:", err);
    statusPip.className = "status-pip error";
    hudStatus.textContent = "CAMERA ERROR / BLOCKED";
    scanAlert.textContent = "CAMERA ACCESS DENIED";
    alert("Camera access is required for Hand Blast. Please allow camera permissions in your browser bar.");
  }
}

// ============================================================================
// 9. GAME LIFECYCLE & CONTROLS
// ============================================================================

function setGuidance(text, icon = "☝") {
  guidanceText.textContent = text;
  guidanceIcon.textContent = icon;
}

function toggleSound() {
  const unmuted = sounds.toggleSFX();
  $("soundIcon").textContent = unmuted ? "🔊" : "🔇";
}

function toggleMusic() {
  const playing = sounds.toggleMusic();
  musicToggleBtn.classList.toggle("active", playing);
  musicLabel.textContent = playing ? "MUSIC" : "OFF";
  musicIcon.textContent = playing ? "🎵" : "🔇";
}

function restartGame() {
  sounds.init();
  sounds.playPick();

  score = 0;
  totalLinesCleared = 0;
  comboStreak = 0;
  currentLevel = 1;
  isGameOver = false;

  scoreEl.textContent = "0";
  levelBadge.textContent = "LVL 1";
  levelFill.style.width = "0%";
  crownIcon.classList.add("hidden");
  hideComboBadge();
  $("gameOver").classList.add("hidden");

  initGrid();
  replenishPieces();
  setGuidance("✨ New game started! Pinch a block on the left", "🚀");
}

function initGameWithCamera() {
  sounds.init();
  sounds.startMusic(); // Start relaxing ambient music on user interaction
  $("cameraGate").classList.add("hidden");
  $("app").classList.remove("hidden");

  handleResize();
  startCamera();
}

function handleResize() {
  const d = Math.min(window.devicePixelRatio || 1, 2);

  cursorFxCanvas.width = window.innerWidth;
  cursorFxCanvas.height = window.innerHeight;

  const bRect = boardCanvas.getBoundingClientRect();
  boardCanvas.width = bRect.width * d;
  boardCanvas.height = bRect.height * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);

  const hRect = handCanvas.getBoundingClientRect();
  handCanvas.width = hRect.width * d;
  handCanvas.height = hRect.height * d;
  hctx.setTransform(d, 0, 0, d, 0, 0);

  drawBoard();
  drawPieceSlots();
}

// ============================================================================
// 10. MAIN 60FPS GAME LOOP
// ============================================================================

function mainLoop() {
  gameTime++;

  // Snappy 0.65 EMA cursor smoothing
  cursorX += (targetCursorX - cursorX) * 0.65;
  cursorY += (targetCursorY - cursorY) * 0.65;

  virtualCursor.style.left = `${cursorX}px`;
  virtualCursor.style.top = `${cursorY}px`;

  updateParticles();
  drawBoard();
  renderFullscreenFx();

  requestAnimationFrame(mainLoop);
}

// ============================================================================
// 11. BOOTSTRAP
// ============================================================================
window.addEventListener("DOMContentLoaded", () => {
  initGrid();
  initAmbientMotes();
  replenishPieces();
  scoreEl.textContent = score;
  bestEl.textContent = bestScore;
  handleResize();
  requestAnimationFrame(mainLoop);
});

window.addEventListener("resize", handleResize);

// Expose globals for HTML onclick
window.initGameWithCamera = initGameWithCamera;
window.toggleSound = toggleSound;
window.toggleMusic = toggleMusic;
window.restartGame = restartGame;
