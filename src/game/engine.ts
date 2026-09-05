import type { SkinDef, UpgradeId } from "./meta";
import { BOT_NAMES } from "./meta";
import { sfx } from "./audio";

/* ============================== мир ============================== */

export const WORLD = 5200;
const CHUNK = 260;
const GRID = Math.ceil(WORLD / CHUNK);
const TAU = Math.PI * 2;

export type BiomeId =
  | "wheat"
  | "ripe"
  | "rye"
  | "poppy"
  | "dry"
  | "swamp"
  | "snow"
  | "desert"
  | "magma";

interface BiomeDef {
  name: string;
  ground: string;
  groundAlt: string;
  blades: string[];
  density: number;
  hMin: number;
  hMax: number;
  xp: number;
  slow: number;
  flower: number;
  flowerColors: string[];
  cactus: number;
  ember: boolean;
  speckle: string;
}

const BIOMES: Record<BiomeId, BiomeDef> = {
  wheat: {
    name: "Пшеничное поле", ground: "#8a6134", groundAlt: "#815a2f",
    blades: ["#d9a83f", "#c99a38", "#e6b74f"], density: 40, hMin: 22, hMax: 38,
    xp: 2, slow: 1, flower: 0.015, flowerColors: ["#fff2d0"],
    cactus: 0, ember: false, speckle: "#6b4a24",
  },
  ripe: {
    name: "Спелое поле", ground: "#9a7038", groundAlt: "#916934",
    blades: ["#eab94f", "#dcab42", "#f4c862"], density: 44, hMin: 20, hMax: 34,
    xp: 1, slow: 1, flower: 0.02, flowerColors: ["#fff2d0"],
    cactus: 0, ember: false, speckle: "#77552a",
  },
  rye: {
    name: "Высокая рожь", ground: "#6e4c22", groundAlt: "#66461f",
    blades: ["#b98c33", "#a87e2c", "#c99a3f"], density: 50, hMin: 34, hMax: 54,
    xp: 3, slow: 0.94, flower: 0, flowerColors: [],
    cactus: 0, ember: false, speckle: "#503718",
  },
  poppy: {
    name: "Маковое поле", ground: "#96652f", groundAlt: "#8d5e2b",
    blades: ["#cfa044", "#c1923c", "#dcab4f"], density: 36, hMin: 18, hMax: 30,
    xp: 3, slow: 1, flower: 0.3, flowerColors: ["#ff5040", "#ff7a3d", "#ff5040"],
    cactus: 0, ember: false, speckle: "#6e4a20",
  },
  dry: {
    name: "Сухое поле", ground: "#7a5527", groundAlt: "#724f24",
    blades: ["#b08a3a", "#9c7a30", "#c49a44"], density: 30, hMin: 14, hMax: 24,
    xp: 4, slow: 1, flower: 0, flowerColors: [],
    cactus: 0.35, ember: false, speckle: "#59401d",
  },
  swamp: {
    name: "Гнилые топи", ground: "#47663a", groundAlt: "#405f35",
    blades: ["#5e8a4a", "#6f9a52", "#527d42"], density: 20, hMin: 14, hMax: 26,
    xp: 2, slow: 0.72, flower: 0.02, flowerColors: ["#c58cff"],
    cactus: 0, ember: false, speckle: "#31502a",
  },
  snow: {
    name: "Мерзлота", ground: "#dcebf0", groundAlt: "#cfe2e8",
    blades: ["#a8d4e0", "#bfe0e8", "#93c6d4"], density: 16, hMin: 8, hMax: 18,
    xp: 4, slow: 0.85, flower: 0, flowerColors: [],
    cactus: 0, ember: false, speckle: "#b7d4de",
  },
  desert: {
    name: "Сухие пески", ground: "#d3ac5c", groundAlt: "#c9a252",
    blades: ["#c9a54a", "#b8933f", "#d9b862"], density: 12, hMin: 8, hMax: 16,
    xp: 4, slow: 1, flower: 0, flowerColors: [],
    cactus: 0.55, ember: false, speckle: "#b28d43",
  },
  magma: {
    name: "Пепелища", ground: "#3b2b26", groundAlt: "#332420",
    blades: ["#ff8c3d", "#ffb03d", "#e05a2a"], density: 18, hMin: 10, hMax: 24,
    xp: 6, slow: 1, flower: 0, flowerColors: [],
    cactus: 0, ember: true, speckle: "#ff6a2a",
  },
};

export interface ZoneShape {
  biome: BiomeId;
  kind: "circle" | "rect";
  x: number;
  y: number;
  r: number;
  w: number;
  h: number;
}

export const ZONES: ZoneShape[] = [
  { biome: "snow", kind: "circle", x: 640, y: 640, r: 780, w: 0, h: 0 },
  { biome: "desert", kind: "circle", x: 4560, y: 640, r: 780, w: 0, h: 0 },
  { biome: "magma", kind: "circle", x: 4560, y: 4560, r: 820, w: 0, h: 0 },
  { biome: "swamp", kind: "rect", x: 220, y: 1740, r: 0, w: 1100, h: 1560 },
  { biome: "rye", kind: "rect", x: 1840, y: 240, r: 0, w: 1600, h: 960 },
  { biome: "poppy", kind: "rect", x: 3540, y: 1800, r: 0, w: 1360, h: 1460 },
  { biome: "dry", kind: "rect", x: 1720, y: 3740, r: 0, w: 1720, h: 1080 },
  { biome: "ripe", kind: "circle", x: 2600, y: 2600, r: 1140, w: 0, h: 0 },
];

export function biomeAt(x: number, y: number): BiomeId {
  for (const z of ZONES) {
    if (z.kind === "circle") {
      const dx = x - z.x, dy = y - z.y;
      if (dx * dx + dy * dy < z.r * z.r) return z.biome;
    } else if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return z.biome;
  }
  const dx = x - WORLD / 2, dy = y - WORLD / 2;
  return dx * dx + dy * dy < 1560 * 1560 ? "ripe" : "wheat";
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ============================== сущности ============================== */

interface Blade {
  x: number; y: number; h: number; w: number; lean: number;
  phase: number; sway: number; tint: number; cut: number; flower: number;
}

interface Cactus { x: number; y: number; r: number; h: number; arm: number; }
interface Speckle { x: number; y: number; r: number; a: number; }

interface Chunk {
  cx: number; cy: number; biome: BiomeId;
  blades: Blade[]; cacti: Cactus[]; speckles: Speckle[];
  groundTint: number;
}

interface Particle {
  kind: "shred" | "spark" | "ring" | "orb" | "ember";
  x: number; y: number; vx: number; vy: number;
  life: number; max: number; size: number; color: string; rot: number; vr: number;
}

interface FloatText { x: number; y: number; life: number; text: string; color: string; size: number; }

export interface EntSkin {
  body: string; rim: string; blade: string; bladeRim: string; trail: string;
  ink: string; pattern: string;
}

export type PotionKind = "power" | "speed" | "heal" | "growth";

export interface Potion {
  id: number;
  x: number;
  y: number;
  kind: PotionKind;
  born: number;
}

export const POTION_COLORS: Record<PotionKind, string> = {
  power: "#ff5340",
  speed: "#59dcff",
  heal: "#8def4a",
  growth: "#c58cff",
};

type Tactic = "roam" | "hunt" | "flee" | "heal" | "loot";

const TACTIC_COLORS: Record<Tactic, string> = {
  roam: "#8f8f7a",
  hunt: "#ff5340",
  flee: "#59dcff",
  heal: "#8def4a",
  loot: "#ffd23f",
};

interface Ent {
  id: number; name: string; isPlayer: boolean;
  x: number; y: number; vx: number; vy: number; dir: number;
  level: number; xp: number; score: number;
  hp: number; maxHp: number; dmg: number;
  radius: number; bladeR: number; speed: number;
  skin: EntSkin;
  bladeAngle: number; bladeSpin: number;
  hitCd: number; hurtT: number; shieldT: number;
  dead: boolean;
  tx: number; ty: number; retarget: number;
  tactic: Tactic;
  strafe: number; strafeT: number;
  dashT: number; dashCd: number;
  buffs: { power: number; speed: number };
  levelCap: number;
}

const BOT_SKINS: EntSkin[] = [
  { body: "#58b64a", rim: "#245c1e", blade: "#e8f6da", bladeRim: "#9db88c", trail: "#58b64a", ink: "#245c1e", pattern: "none" },
  { body: "#7fb069", rim: "#3d5a2e", blade: "#eef5e0", bladeRim: "#a3b18a", trail: "#7fb069", ink: "#3d5a2e", pattern: "none" },
  { body: "#c9803d", rim: "#6e4318", blade: "#f2e0c8", bladeRim: "#b59a72", trail: "#c9803d", ink: "#6e4318", pattern: "none" },
  { body: "#5a9fb0", rim: "#274f5a", blade: "#dff2f5", bladeRim: "#8fb6bd", trail: "#5a9fb0", ink: "#274f5a", pattern: "none" },
  { body: "#a3b18a", rim: "#58614a", blade: "#eef2e4", bladeRim: "#b8c0a8", trail: "#a3b18a", ink: "#58614a", pattern: "none" },
  { body: "#b05a5a", rim: "#5c2727", blade: "#f5dede", bladeRim: "#bd8f8f", trail: "#b05a5a", ink: "#5c2727", pattern: "none" },
];

/* ============================== контракты ============================== */

export interface GameConfig {
  name: string;
  skin: SkinDef;
  upgrades: Record<UpgradeId, number>;
}

export interface HudData {
  score: number; level: number; xp: number; xpNext: number;
  hp: number; maxHp: number; boost: number; boosting: boolean;
  kills: number; grass: number; time: number;
  combo: number; comboMult: number;
  zone: string; danger: boolean;
  players: number;
  meName: string;
  buffs: { power: number; speed: number };
  leaderboard: { name: string; score: number; me: boolean; level: number }[];
}

export interface RunSummary {
  score: number; level: number; kills: number; grass: number;
  time: number; dew: number; killer: string;
}

interface Callbacks {
  onHud: (h: HudData) => void;
  onDeath: (s: RunSummary) => void;
}

const xpNeed = (level: number) => Math.floor(45 * Math.pow(level, 1.35));
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

function buzz(ms: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
  } catch {
    /* без вибро */
  }
}

/* ============================== движок ============================== */

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cfg: GameConfig;
  private cbs: Callbacks;

  private raf = 0;
  private last = 0;
  private animT = 0;
  private time = 0;
  private timeScale = 1;
  private paused = false;
  private destroyed = false;

  private vw = 320;
  private vh = 240;
  private dpr = 1;

  private cam = { x: WORLD / 2, y: WORLD / 2, zoom: 1.1 };
  private shakeT = 0;
  private shakeMag = 0;

  private player!: Ent;
  private bots: Ent[] = [];
  private nextId = 1;

  private chunks = new Map<string, Chunk>();
  private viewChunks: Chunk[] = [];

  private particles: Particle[] = [];
  private texts: FloatText[] = [];
  private respawnAt: number[] = [];
  private potions: Potion[] = [];
  private potionT = 1.5;

  private keys = new Set<string>();
  private mouse = { x: 0, y: 0, on: false };
  private joy = { x: 0, y: 0, on: false };
  private boostHeld = false;
  private boost = 100;
  private boosting = false;

  private grassCount = 0;
  private kills = 0;
  private combo = 0;
  private comboT = 0;
  private xpAcc = 0;
  private xpAccT = 0;
  private mowSfxT = 0;
  private hudT = 0;
  private pruneT = 0;
  private curZone: BiomeId = "wheat";
  private emberT = 0;

  private dyingT = -1;
  private killer = "дикая пшеница";
  private overSent = false;

  constructor(canvas: HTMLCanvasElement, cfg: GameConfig, cbs: Callbacks) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.cfg = cfg;
    this.cbs = cbs;
    this.resize();

    this.player = this.makePlayer();
    for (let i = 0; i < 105; i++) this.bots.push(this.makeBot());
    /* несколько зелий на поле с самого начала */
    for (let i = 0; i < 4; i++) this.spawnPotion();
  }

  /* ---------- создание сущностей ---------- */

  private makePlayer(): Ent {
    const e: Ent = {
      id: 0, name: this.cfg.name || "Косарь", isPlayer: true,
      x: WORLD / 2, y: WORLD / 2, vx: 0, vy: 0, dir: -TAU / 4,
      level: 1, xp: 0, score: 0,
      hp: 100, maxHp: 100, dmg: 8,
      radius: 16, bladeR: 44, speed: 195,
      skin: {
        body: this.cfg.skin.body, rim: this.cfg.skin.rim,
        blade: this.cfg.skin.blade, bladeRim: this.cfg.skin.bladeRim,
        trail: this.cfg.skin.trail,
        ink: this.cfg.skin.ink, pattern: this.cfg.skin.pattern,
      },
      bladeAngle: 0, bladeSpin: 1,
      hitCd: 0, hurtT: 0, shieldT: 2.5,
      dead: false, tx: 0, ty: 0, retarget: 0,
      tactic: "roam", strafe: 1, strafeT: 0, dashT: 0, dashCd: 0,
      buffs: { power: 0, speed: 0 },
      levelCap: 999,
    };
    this.recalcStats(e);
    e.hp = e.maxHp;
    return e;
  }

  private makeBot(): Ent {
    /* боты живут по всей карте, уровень растёт к окраинам */
    let x = 140 + Math.random() * (WORLD - 280);
    let y = 140 + Math.random() * (WORLD - 280);
    const dist = Math.hypot(x - WORLD / 2, y - WORLD / 2);
    let level: number;
    if (dist < 1200) level = 1 + Math.floor(Math.random() * 3);
    else if (dist < 1700) level = 3 + Math.floor(Math.random() * 5);
    else if (dist < 2150) level = 6 + Math.floor(Math.random() * 7);
    else level = 10 + Math.floor(Math.random() * 16);
    /* не даём появиться вплотную к игроку */
    if (this.player) {
      const pd = Math.hypot(x - this.player.x, y - this.player.y);
      if (pd < 560) {
        const a = Math.random() * TAU;
        x = clamp(x + Math.cos(a) * 640, 140, WORLD - 140);
        y = clamp(y + Math.sin(a) * 640, 140, WORLD - 140);
      }
    }

    const e: Ent = {
      id: this.nextId++,
      name: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
      isPlayer: false,
      x, y, vx: 0, vy: 0, dir: Math.random() * TAU,
      level, xp: 0, score: level * level * 12,
      hp: 100, maxHp: 100, dmg: 8,
      radius: 16, bladeR: 44, speed: 150 + Math.random() * 45,
      skin: BOT_SKINS[Math.floor(Math.random() * BOT_SKINS.length)],
      bladeAngle: Math.random() * TAU, bladeSpin: Math.random() < 0.5 ? 1 : -1,
      hitCd: 0, hurtT: 0, shieldT: 1.5,
      dead: false, tx: x, ty: y, retarget: Math.random() * 1.5,
      tactic: "roam", strafe: Math.random() < 0.5 ? -1 : 1, strafeT: Math.random() * 1.5,
      dashT: 0, dashCd: 0,
      buffs: { power: 0, speed: 0 },
      levelCap: level + 6,
    };
    this.recalcStats(e);
    e.hp = e.maxHp * (0.75 + Math.random() * 0.25);
    if (this.player) {
      const dx = x - this.player.x, dy = y - this.player.y;
      if (dx * dx + dy * dy < 480 * 480) {
        e.x = clamp(x + 600, 120, WORLD - 120);
      }
    }
    return e;
  }

  private recalcStats(e: Ent) {
    const u = e.isPlayer ? this.cfg.upgrades : null;
    e.radius = 15 + Math.min(e.level, 45) * 0.95;
    /* радиус косы заметно растёт с каждым уровнем */
    e.bladeR = (e.radius + 27 + (e.level - 1) * 2.1) * (1 + 0.09 * (u?.sweep ?? 0));
    e.dmg = (6 + e.level * 2.1) * (1 + 0.15 * (u?.blade ?? 0)) * (e.isPlayer ? 1 : 0.85);
    e.maxHp = (55 + e.level * 11.5) * (1 + 0.18 * (u?.vitality ?? 0));
    e.hp = Math.min(e.hp, e.maxHp);
  }

  private playerSpeed(): number {
    const u = this.cfg.upgrades;
    const sizeFactor = 1 - Math.min(this.player.level * 0.006, 0.22);
    const buff = this.player.buffs.speed > 0 ? 1.5 : 1;
    return 195 * sizeFactor * (1 + 0.06 * u.legs) * buff;
  }

  /* ---------- ввод ---------- */

  private onKeyDown = (e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) e.preventDefault();
    this.keys.add(e.key.toLowerCase());
    if (e.key === " " || e.key === "Shift") this.boostHeld = true;
  };
  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
    if (e.key === " " || e.key === "Shift") this.boostHeld = false;
  };
  private onMouseMove = (e: MouseEvent) => {
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = e.clientX - r.left;
    this.mouse.y = e.clientY - r.top;
    this.mouse.on = true;
  };
  private onMouseDown = (e: MouseEvent) => {
    if (e.button === 0) this.boostHeld = true;
  };
  private onMouseUp = (e: MouseEvent) => {
    if (e.button === 0) this.boostHeld = false;
  };
  private onResize = () => this.resize();
  private onBlur = () => {
    this.keys.clear();
    this.boostHeld = false;
  };

  start() {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mouseup", this.onMouseUp);
    window.addEventListener("resize", this.onResize);
    window.addEventListener("blur", this.onBlur);
    this.last = performance.now();
    const loop = (t: number) => {
      if (this.destroyed) return;
      const raw = Math.min((t - this.last) / 1000, 0.05);
      this.last = t;
      this.animT += raw;
      if (!this.paused) this.update(raw * this.timeScale);
      this.render();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mouseup", this.onMouseUp);
    window.removeEventListener("resize", this.onResize);
    window.removeEventListener("blur", this.onBlur);
  }

  setPaused(p: boolean) { this.paused = p; }
  setBoost(b: boolean) { this.boostHeld = b; }
  setJoy(x: number, y: number, on: boolean) { this.joy = { x, y, on }; }

  private resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.vw = window.innerWidth;
    this.vh = window.innerHeight;
    this.canvas.width = Math.floor(this.vw * this.dpr);
    this.canvas.height = Math.floor(this.vh * this.dpr);
    this.canvas.style.width = this.vw + "px";
    this.canvas.style.height = this.vh + "px";
  }

  /* ---------- генерация чанков ---------- */

  private genChunk(cx: number, cy: number): Chunk {
    const rng = mulberry32(((cx + 50) * 73856093) ^ ((cy + 50) * 19349663) ^ 0x9e3779b9);
    const biome = biomeAt((cx + 0.5) * CHUNK, (cy + 0.5) * CHUNK);
    const def = BIOMES[biome];
    const blades: Blade[] = [];
    const n = def.density + Math.floor(rng() * 7);
    for (let i = 0; i < n; i++) {
      blades.push({
        x: cx * CHUNK + rng() * CHUNK,
        y: cy * CHUNK + rng() * CHUNK,
        h: def.hMin + rng() * (def.hMax - def.hMin),
        w: 1.7 + rng() * 1.5,
        lean: (rng() - 0.5) * 9,
        phase: rng() * TAU,
        sway: 0.6 + rng() * 0.8,
        tint: Math.floor(rng() * def.blades.length),
        cut: 0,
        flower: rng() < def.flower ? Math.floor(rng() * def.flowerColors.length) : -1,
      });
    }
    blades.sort((a, b) => a.tint - b.tint);
    const cacti: Cactus[] = [];
    if (def.cactus > 0) {
      const cn = rng() < def.cactus ? 1 + Math.floor(rng() * 2) : Math.floor(rng() * 2);
      for (let i = 0; i < cn; i++) {
        cacti.push({
          x: cx * CHUNK + 34 + rng() * (CHUNK - 68),
          y: cy * CHUNK + 34 + rng() * (CHUNK - 68),
          r: 15 + rng() * 9, h: 34 + rng() * 24, arm: rng(),
        });
      }
    }
    const speckles: Speckle[] = [];
    for (let i = 0; i < 6; i++) {
      speckles.push({
        x: cx * CHUNK + rng() * CHUNK, y: cy * CHUNK + rng() * CHUNK,
        r: 7 + rng() * 18, a: 0.06 + rng() * 0.1,
      });
    }
    return { cx, cy, biome, blades, cacti, speckles, groundTint: rng() };
  }

  private ensureChunks() {
    const z = this.cam.zoom;
    const hw = this.vw / (2 * z) + 360;
    const hh = this.vh / (2 * z) + 360;
    const x0 = clamp(Math.floor((this.cam.x - hw) / CHUNK), 0, GRID - 1);
    const x1 = clamp(Math.floor((this.cam.x + hw) / CHUNK), 0, GRID - 1);
    const y0 = clamp(Math.floor((this.cam.y - hh) / CHUNK), 0, GRID - 1);
    const y1 = clamp(Math.floor((this.cam.y + hh) / CHUNK), 0, GRID - 1);
    this.viewChunks = [];
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const key = cx + "," + cy;
        let c = this.chunks.get(key);
        if (!c) {
          c = this.genChunk(cx, cy);
          this.chunks.set(key, c);
        }
        this.viewChunks.push(c);
      }
    }
  }

  private pruneChunks() {
    if (this.chunks.size < 90) return;
    const z = this.cam.zoom;
    const lim = Math.max(this.vw, this.vh) / (2 * z) + 1100;
    let removed = 0;
    for (const [key, c] of this.chunks) {
      if (removed > 30) break;
      const dx = (c.cx + 0.5) * CHUNK - this.cam.x;
      const dy = (c.cy + 0.5) * CHUNK - this.cam.y;
      if (Math.abs(dx) > lim || Math.abs(dy) > lim) {
        this.chunks.delete(key);
        removed++;
      }
    }
  }

  /* ---------- кошение ---------- */

  private cutCircle(x: number, y: number, r: number, who: Ent): number {
    const r2 = r * r;
    let xp = 0;
    const x0 = clamp(Math.floor((x - r) / CHUNK), 0, GRID - 1);
    const x1 = clamp(Math.floor((x + r) / CHUNK), 0, GRID - 1);
    const y0 = clamp(Math.floor((y - r) / CHUNK), 0, GRID - 1);
    const y1 = clamp(Math.floor((y + r) / CHUNK), 0, GRID - 1);
    let cuts = 0;
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const c = this.chunks.get(cx + "," + cy);
        if (!c) continue;
        const def = BIOMES[c.biome];
        for (const b of c.blades) {
          if (b.cut > 0.4) continue;
          const dx = b.x - x, dy = b.y - y;
          if (dx * dx + dy * dy > r2) continue;
          b.cut = 5.5 + Math.random() * 5;
          const gained = def.xp * (b.flower >= 0 ? 1.7 : 1);
          xp += gained;
          cuts++;
          if (who.isPlayer) {
            this.grassCount++;
            this.combo++;
            this.comboT = 1.15;
            if (this.particles.length < 300 && cuts % 2 === 0) {
              this.spawnShred(b.x, b.y - b.h * 0.4, def.blades[b.tint]);
            }
            if (this.particles.length < 260 && Math.random() < 0.35) this.spawnOrb(b.x, b.y - 6);
          } else if (this.particles.length < 200 && Math.random() < 0.06) {
            this.spawnShred(b.x, b.y - b.h * 0.4, def.blades[b.tint]);
          }
        }
      }
    }
    if (who.isPlayer && cuts > 0) {
      this.xpAcc += Math.round(xp * this.comboMult());
      if (this.mowSfxT <= 0) {
        sfx.mow();
        this.mowSfxT = 0.085;
      }
    }
    return xp;
  }

  private comboMult(): number {
    return 1 + Math.min(this.combo, 100) * 0.02;
  }

  /* ---------- опыт и уровни ---------- */

  private gainXp(e: Ent, amt: number) {
    if (!e.isPlayer && e.level >= e.levelCap) return;
    e.xp += amt;
    e.score += amt;
    while (e.xp >= xpNeed(e.level)) {
      e.xp -= xpNeed(e.level);
      e.level++;
      this.recalcStats(e);
      e.hp = e.maxHp;
      if (e.isPlayer) {
        sfx.level();
        buzz(30);
        this.addRing(e.x, e.y, "#ffd23f");
        this.addText(e.x, e.y - e.radius - 30, "УРОВЕНЬ " + e.level, "#ffd23f", 17);
        this.shake(4);
      }
      if (!e.isPlayer && e.level >= e.levelCap) {
        e.xp = 0;
        break;
      }
    }
  }

  /* ---------- зелья ---------- */

  private spawnPotion() {
    if (this.potions.length >= 8) return;
    const roll = Math.random();
    const kind: PotionKind = roll < 0.3 ? "heal" : roll < 0.55 ? "power" : roll < 0.8 ? "speed" : "growth";
    this.potions.push({
      id: this.nextId++,
      x: 240 + Math.random() * (WORLD - 480),
      y: 240 + Math.random() * (WORLD - 480),
      kind,
      born: this.time,
    });
  }

  private applyPotion(e: Ent, kind: PotionKind) {
    const col = POTION_COLORS[kind];
    this.addRing(e.x, e.y, col);
    if (kind === "heal") {
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * 0.45);
      if (e.isPlayer) this.addText(e.x, e.y - e.radius - 26, "ЗДОРОВЬЕ +45%", col, 14);
    } else if (kind === "growth") {
      this.gainXp(e, xpNeed(e.level));
      if (e.isPlayer) this.addText(e.x, e.y - e.radius - 26, "+1 УРОВЕНЬ!", col, 16);
    } else if (kind === "power") {
      e.buffs.power = 8;
      if (e.isPlayer) this.addText(e.x, e.y - e.radius - 26, "СИЛА ×1.4 — 8с", col, 14);
    } else {
      e.buffs.speed = 8;
      if (e.isPlayer) this.addText(e.x, e.y - e.radius - 26, "СКОРОСТЬ ×1.5 — 8с", col, 14);
    }
    for (let i = 0; i < 8; i++) this.spawnSparks(e.x + (Math.random() - 0.5) * 20, e.y - 6, col);
    if (e.isPlayer) {
      sfx.potion(kind);
      buzz(20);
    }
  }

  /* ---------- бой ---------- */

  private tryHit(a: Ent, b: Ent) {
    if (a.hitCd > 0 || b.dead || a.dead) return;
    if (b.shieldT > 0) return;
    const rr = a.bladeR + b.radius;
    const dx = b.x - a.x, dy = b.y - a.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > rr * rr) return;
    a.hitCd = 0.45;
    const d = Math.sqrt(d2) || 1;
    const dmg = a.dmg * (a.buffs.power > 0 ? 1.4 : 1) * (0.85 + Math.random() * 0.3);
    b.hp -= dmg;
    b.hurtT = 0.35;
    b.vx += (dx / d) * 300;
    b.vy += (dy / d) * 300;
    const mx = a.x + (dx / d) * a.bladeR;
    const my = a.y + (dy / d) * a.bladeR;
    this.spawnSparks(mx, my, b.isPlayer ? "#ff7059" : "#eef9e2");
    if (b.isPlayer) {
      sfx.hurt();
      buzz(45);
      this.shake(8);
    } else if (a.isPlayer) {
      sfx.thorn();
    }
    if (b.hp <= 0) this.killEnt(b, a);
  }

  private killEnt(victim: Ent, killer: Ent) {
    victim.dead = true;
    for (let i = 0; i < 16; i++) this.spawnShred(victim.x, victim.y, victim.skin.body, 1.6);
    this.addRing(victim.x, victim.y, victim.skin.body);
    this.gainXp(killer, victim.level * 25 + 30);
    if (killer.isPlayer) {
      this.kills++;
      sfx.kill();
      buzz(25);
      this.shake(12);
      this.addText(victim.x, victim.y - 34, "СКОШЕН!", "#ffd23f", 15);
    }
    if (victim.isPlayer) {
      this.killer = killer.name;
      sfx.death();
      buzz([80, 40, 120]);
      this.shake(22);
      this.dyingT = 1.1;
      this.timeScale = 0.4;
    } else {
      this.respawnAt.push(this.time + 4 + Math.random() * 4);
    }
  }

  /* ---------- частицы / тексты ---------- */

  private spawnShred(x: number, y: number, color: string, pow = 1) {
    const a = Math.random() * TAU;
    const s = (60 + Math.random() * 140) * pow;
    this.particles.push({
      kind: "shred", x, y,
      vx: Math.cos(a) * s, vy: Math.sin(a) * s - 90 * pow,
      life: 0.55 + Math.random() * 0.3, max: 0.8,
      size: 2.5 + Math.random() * 3, color,
      rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 14,
    });
  }

  private spawnSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 5; i++) {
      const a = Math.random() * TAU;
      const s = 90 + Math.random() * 160;
      this.particles.push({
        kind: "spark", x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0.25 + Math.random() * 0.2, max: 0.45,
        size: 1.6 + Math.random() * 2, color, rot: 0, vr: 0,
      });
    }
  }

  private spawnOrb(x: number, y: number) {
    this.particles.push({
      kind: "orb", x, y, vx: 0, vy: 0,
      life: 1.4, max: 1.4, size: 3, color: "#b3f877", rot: 0, vr: 0,
    });
  }

  private addRing(x: number, y: number, color: string) {
    this.particles.push({
      kind: "ring", x, y, vx: 0, vy: 0, life: 0.5, max: 0.5, size: 10, color, rot: 0, vr: 0,
    });
  }

  private addText(x: number, y: number, text: string, color: string, size: number) {
    if (this.texts.length > 24) this.texts.shift();
    this.texts.push({ x, y, life: 1.1, text, color, size });
  }

  private shake(m: number) {
    this.shakeMag = Math.max(this.shakeMag, m);
    this.shakeT = 0.3;
  }

  /* ---------- обновление ---------- */

  private update(dt: number) {
    this.time += dt;
    const p = this.player;
    if (p.dead) {
      if (this.dyingT > 0) {
        this.dyingT -= dt / this.timeScale;
        if (this.dyingT <= 0 && !this.overSent) {
          this.overSent = true;
          this.cbs.onDeath({
            score: Math.round(p.score),
            level: p.level,
            kills: this.kills,
            grass: this.grassCount,
            time: Math.round(this.time),
            dew: Math.round(this.grassCount / 12 + this.kills * 4 + p.level * 2),
            killer: this.killer,
          });
        }
      }
      this.updateParticles(dt);
      return;
    }

    /* --- ввод игрока --- */
    let ix = 0, iy = 0;
    if (this.joy.on) {
      ix = this.joy.x; iy = this.joy.y;
    } else {
      const k = this.keys;
      if (k.has("w") || k.has("ц") || k.has("arrowup")) iy -= 1;
      if (k.has("s") || k.has("ы") || k.has("arrowdown")) iy += 1;
      if (k.has("a") || k.has("ф") || k.has("arrowleft")) ix -= 1;
      if (k.has("d") || k.has("в") || k.has("arrowright")) ix += 1;
      if (ix === 0 && iy === 0 && this.mouse.on) {
        const dx = this.mouse.x - this.vw / 2;
        const dy = this.mouse.y - this.vh / 2;
        const d = Math.hypot(dx, dy);
        if (d > 26) { ix = dx / d; iy = dy / d; }
      }
    }
    const il = Math.hypot(ix, iy);
    if (il > 1) { ix /= il; iy /= il; }

    const biome = biomeAt(p.x, p.y);
    const def = BIOMES[biome];
    this.curZone = biome;

    /* --- ускорение --- */
    this.boosting = this.boostHeld && this.boost > 2 && il > 0.1;
    if (this.boosting) this.boost = Math.max(0, this.boost - 30 * dt);
    else this.boost = Math.min(100, this.boost + 17 * dt);
    const spd = this.playerSpeed() * def.slow * (this.boosting ? 1.75 : 1);
    p.vx += (ix * spd - p.vx) * Math.min(1, dt * 9);
    p.vy += (iy * spd - p.vy) * Math.min(1, dt * 9);
    p.x = clamp(p.x + p.vx * dt, 30, WORLD - 30);
    p.y = clamp(p.y + p.vy * dt, 30, WORLD - 30);
    if (il > 0.1) p.dir = Math.atan2(iy, ix);

    p.bladeAngle += p.bladeSpin * (5 + p.level * 0.14) * dt;
    p.hitCd = Math.max(0, p.hitCd - dt);
    p.hurtT = Math.max(0, p.hurtT - dt);
    p.shieldT = Math.max(0, p.shieldT - dt);
    p.buffs.power = Math.max(0, p.buffs.power - dt);
    p.buffs.speed = Math.max(0, p.buffs.speed - dt);

    /* --- регенерация и опасности --- */
    p.hp = Math.min(p.maxHp, p.hp + (1.1 + 0.9 * this.cfg.upgrades.regen + p.level * 0.06) * dt);
    if (biome === "magma" && p.level < 12) {
      p.hp -= 3.5 * dt;
      this.emberT -= dt;
      if (this.emberT <= 0) {
        this.emberT = 0.15;
        this.particles.push({
          kind: "ember", x: p.x + (Math.random() - 0.5) * 60, y: p.y + 20,
          vx: (Math.random() - 0.5) * 20, vy: -50 - Math.random() * 40,
          life: 0.7, max: 0.7, size: 2 + Math.random() * 2.4, color: "#ff8c3d", rot: 0, vr: 0,
        });
      }
      if (p.hp <= 0) {
        this.killer = "Пепелища";
        this.killPlayerByEnvironment();
      }
    }

    /* --- кошение пшеницы игроком --- */
    const mowedXp = this.cutCircle(p.x, p.y, p.bladeR, p);
    if (mowedXp > 0) this.gainXp(p, mowedXp * this.comboMult());

    this.comboT -= dt;
    if (this.comboT <= 0) this.combo = 0;
    this.mowSfxT -= dt;
    this.xpAccT -= dt;
    if (this.xpAccT <= 0 && this.xpAcc > 0) {
      this.addText(p.x, p.y - p.radius - 26, "+" + this.xpAcc, "#b3f877", 13);
      this.xpAcc = 0;
      this.xpAccT = 0.3;
    }

    /* --- боты с тактикой --- */
    this.updateBots(dt);

    /* --- бой попарно --- */
    const ents: Ent[] = [p, ...this.bots];
    for (let i = 0; i < ents.length; i++) {
      const a = ents[i];
      if (a.dead) continue;
      for (let j = i + 1; j < ents.length; j++) {
        const b = ents[j];
        if (b.dead) continue;
        const dx = b.x - a.x, dy = b.y - a.y;
        const rr = a.radius + b.radius;
        const d2 = dx * dx + dy * dy;
        if (d2 < rr * rr && d2 > 0.01) {
          const d = Math.sqrt(d2);
          const push = ((rr - d) / d) * 0.5;
          a.x -= dx * push; a.y -= dy * push;
          b.x += dx * push; b.y += dy * push;
        }
        this.tryHit(a, b);
        this.tryHit(b, a);
      }
    }

    /* --- зелья: появление и подбор --- */
    this.potionT -= dt;
    if (this.potionT <= 0) {
      this.potionT = 3.5 + Math.random() * 2.5;
      this.spawnPotion();
    }
    for (let i = this.potions.length - 1; i >= 0; i--) {
      const pt = this.potions[i];
      if (this.time - pt.born > 26) {
        this.potions.splice(i, 1);
        continue;
      }
      for (const e of ents) {
        if (e.dead) continue;
        const dx = e.x - pt.x, dy = e.y - pt.y;
        const rr = e.radius + 15;
        if (dx * dx + dy * dy < rr * rr) {
          this.applyPotion(e, pt.kind);
          this.potions.splice(i, 1);
          break;
        }
      }
    }

    /* --- кактусы --- */
    for (const e of ents) {
      if (e.dead) continue;
      for (const c of this.viewChunks) {
        for (const cac of c.cacti) {
          const dx = e.x - cac.x, dy = e.y - cac.y;
          const rr = cac.r + e.radius + 2;
          if (dx * dx + dy * dy < rr * rr) {
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            e.x = cac.x + (dx / d) * rr;
            e.y = cac.y + (dy / d) * rr;
            if (e.hurtT <= 0) {
              e.hp -= 12;
              e.hurtT = 0.6;
              this.spawnSparks(e.x, e.y, "#8def4a");
              if (e.isPlayer) { sfx.thorn(); this.shake(6); }
              if (e.hp <= 0 && e.isPlayer) {
                this.killer = "Кактус";
                this.killPlayerByEnvironment();
              }
            }
          }
        }
      }
    }

    /* --- смерть ботов, респаун --- */
    this.bots = this.bots.filter((b) => !b.dead);
    for (let i = this.respawnAt.length - 1; i >= 0; i--) {
      if (this.time >= this.respawnAt[i]) {
        this.respawnAt.splice(i, 1);
        if (this.bots.length < 112) this.bots.push(this.makeBot());
      }
    }

    /* --- отрастание --- */
    for (const c of this.viewChunks) {
      for (const b of c.blades) if (b.cut > 0) b.cut -= dt;
    }

    this.updateParticles(dt);
    this.updateCamera(dt);

    /* --- hud --- */
    this.hudT -= dt;
    if (this.hudT <= 0) {
      this.hudT = 0.15;
      this.pushHud();
    }
    this.pruneT -= dt;
    if (this.pruneT <= 0) {
      this.pruneT = 0.8;
      this.pruneChunks();
    }
  }

  private killPlayerByEnvironment() {
    const p = this.player;
    p.hp = 0;
    p.dead = true;
    sfx.death();
    buzz([80, 40, 120]);
    this.shake(22);
    this.dyingT = 1.1;
    this.timeScale = 0.4;
    for (let i = 0; i < 16; i++) this.spawnShred(p.x, p.y, p.skin.body, 1.6);
  }

  /* ---------- тактический ИИ ботов ---------- */

  private updateBots(dt: number) {
    const all: Ent[] = [this.player, ...this.bots];
    for (const b of this.bots) {
      if (b.dead) continue;
      b.hitCd = Math.max(0, b.hitCd - dt);
      b.hurtT = Math.max(0, b.hurtT - dt);
      b.shieldT = Math.max(0, b.shieldT - dt);
      b.dashT = Math.max(0, b.dashT - dt);
      b.dashCd = Math.max(0, b.dashCd - dt);
      b.buffs.power = Math.max(0, b.buffs.power - dt);
      b.buffs.speed = Math.max(0, b.buffs.speed - dt);
      b.bladeAngle += b.bladeSpin * (4.5 + b.level * 0.1) * dt;
      b.hp = Math.min(b.maxHp, b.hp + 0.8 * dt);
      b.strafeT -= dt;
      if (b.strafeT <= 0) {
        b.strafe = Math.random() < 0.5 ? -1 : 1;
        b.strafeT = 1.2 + Math.random() * 1.4;
      }

      /* --- оценка обстановки --- */
      const bPow = b.dmg * (b.buffs.power > 0 ? 1.4 : 1);
      let threat: Ent | null = null;
      let threatD = 340 * 340;
      let prey: Ent | null = null;
      let preyScore = Infinity;
      let nearest: Ent | null = null;
      let nearestD = Infinity;
      for (const o of all) {
        if (o === b || o.dead) continue;
        const dx = o.x - b.x, dy = o.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < nearestD) { nearest = o; nearestD = d2; }
        const oPow = o.dmg * (o.buffs.power > 0 ? 1.4 : 1);
        if (oPow > bPow * 1.08 && d2 < threatD) { threat = o; threatD = d2; }
        if (oPow < bPow * 1.15) {
          let score = d2;
          if (o.hp < o.maxHp * 0.55) score *= 0.45; /* добивай раненых */
          if (o.hurtT > 0.1) score *= 0.6;          /* помогай добивать — шакаль */
          if (o.isPlayer) score *= 0.78;            /* игрок — главная цель */
          if (score < preyScore) { prey = o; preyScore = score; }
        }
      }

      /* --- ближайшее зелье --- */
      let pot: Potion | null = null;
      let potD = 700 * 700;
      for (const pt of this.potions) {
        const dx = pt.x - b.x, dy = pt.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < potD) { pot = pt; potD = d2; }
      }
      const hpFrac = b.hp / b.maxHp;
      const wantsPot =
        pot &&
        ((pot.kind === "heal" && hpFrac < 0.72) ||
          pot.kind === "growth" ||
          (pot.kind === "power" && prey !== null && hpFrac > 0.45) ||
          (pot.kind === "speed" && threat !== null));

      /* --- выбор тактики --- */
      let mx = 0, my = 0;
      let spdMul = 0.8;

      if (threat && threatD < 330 * 330) {
        /* БЕГСТВО: от сильного, с рывком в упор */
        b.tactic = "flee";
        const d = Math.sqrt(threatD) || 1;
        b.tx = b.x - ((threat.x - b.x) / d) * 520;
        b.ty = b.y - ((threat.y - b.y) / d) * 520;
        if (threatD < 170 * 170 && b.dashCd <= 0) {
          b.dashT = 0.4;
          b.dashCd = 3;
        }
        const dx = b.tx - b.x, dy = b.ty - b.y;
        const d2 = Math.hypot(dx, dy) || 1;
        mx = dx / d2; my = dy / d2;
        spdMul = 1.28 * (b.dashT > 0 ? 1.85 : 1);
      } else if (wantsPot && pot) {
        /* МАРОДЁР: за зельем */
        b.tactic = "loot";
        const dx = pot.x - b.x, dy = pot.y - b.y;
        const d = Math.hypot(dx, dy) || 1;
        mx = dx / d; my = dy / d;
        spdMul = 1.12;
      } else if (prey && preyScore < 430 * 430 && hpFrac > 0.33) {
        /* ОХОТА: сближение + стрейф по дуге, у цели — кружение */
        b.tactic = "hunt";
        const dx = prey.x - b.x, dy = prey.y - b.y;
        const d = Math.hypot(dx, dy) || 1;
        const close = d < b.bladeR + prey.radius + 30;
        let ax = dx / d, ay = dy / d;
        const px = -ay * b.strafe, py = ax * b.strafe;
        if (close) {
          ax = px * 1.15 + ax * 0.25;
          ay = py * 1.15 + ay * 0.25;
        } else {
          ax = ax + px * 0.5;
          ay = ay + py * 0.5;
        }
        const al = Math.hypot(ax, ay) || 1;
        mx = ax / al; my = ay / al;
        spdMul = close ? 1.18 : 1.06;
      } else if (hpFrac < 0.45) {
        /* ЛЕЧЕНИЕ: подальше от всех, к центру, переждать */
        b.tactic = "heal";
        let ax = (WORLD / 2 - b.x) * 0.35;
        let ay = (WORLD / 2 - b.y) * 0.35;
        if (nearest && nearestD < 520 * 520) {
          const d = Math.sqrt(nearestD) || 1;
          ax += ((b.x - nearest.x) / d) * 420;
          ay += ((b.y - nearest.y) / d) * 420;
        }
        const al = Math.hypot(ax, ay) || 1;
        mx = ax / al; my = ay / al;
        spdMul = 0.95;
      } else {
        /* БЛУЖДАНИЕ: слабые тянутся к центру, сильные — на окраины */
        b.tactic = "roam";
        b.retarget -= dt;
        if (b.retarget <= 0) {
          b.retarget = 2 + Math.random() * 2.5;
          const bias = b.level < 6 ? 0.35 : -0.15;
          b.tx = clamp(
            b.x + (Math.random() - 0.5) * 900 + (WORLD / 2 - b.x) * bias,
            120, WORLD - 120
          );
          b.ty = clamp(
            b.y + (Math.random() - 0.5) * 900 + (WORLD / 2 - b.y) * bias,
            120, WORLD - 120
          );
        }
        const dx = b.tx - b.x, dy = b.ty - b.y;
        const d = Math.hypot(dx, dy);
        if (d > 12) {
          mx = dx / d; my = dy / d;
          spdMul = 0.8;
        } else {
          mx = 0; my = 0;
        }
      }

      if (mx !== 0 || my !== 0) {
        const spd = b.speed * spdMul * (b.buffs.speed > 0 ? 1.5 : 1) * BIOMES[biomeAt(b.x, b.y)].slow;
        b.vx += (mx * spd - b.vx) * Math.min(1, dt * 5);
        b.vy += (my * spd - b.vy) * Math.min(1, dt * 5);
        b.dir = Math.atan2(my, mx);
      } else {
        b.vx *= 0.9; b.vy *= 0.9;
      }
      b.x = clamp(b.x + b.vx * dt, 60, WORLD - 60);
      b.y = clamp(b.y + b.vy * dt, 60, WORLD - 60);

      /* --- бот косит пшеницу --- */
      const xp = this.cutCircle(b.x, b.y, b.bladeR, b);
      if (xp > 0) this.gainXp(b, xp);
    }
  }

  private updateParticles(dt: number) {
    const p = this.player;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      if (pt.life <= 0) { this.particles.splice(i, 1); continue; }
      if (pt.kind === "orb" && !p.dead) {
        const dx = p.x - pt.x, dy = p.y - pt.y;
        const d = Math.hypot(dx, dy) || 1;
        pt.vx += (dx / d) * 900 * dt;
        pt.vy += (dy / d) * 900 * dt;
        pt.vx *= 0.94; pt.vy *= 0.94;
        if (d < p.radius + 8) { this.particles.splice(i, 1); continue; }
      } else if (pt.kind === "shred") {
        pt.vy += 320 * dt;
        pt.vx *= 0.96;
        pt.rot += pt.vr * dt;
      } else if (pt.kind === "ring") {
        pt.size += 130 * dt;
      } else if (pt.kind === "ember") {
        pt.vx += (Math.random() - 0.5) * 30 * dt;
      }
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
    }
    for (let i = this.texts.length - 1; i >= 0; i--) {
      const t = this.texts[i];
      t.life -= dt;
      t.y -= 34 * dt;
      if (t.life <= 0) this.texts.splice(i, 1);
    }
  }

  private updateCamera(dt: number) {
    const p = this.player;
    const targetZoom = clamp(1.18 - (p.level - 1) * 0.016, 0.6, 1.18);
    this.cam.zoom += (targetZoom - this.cam.zoom) * Math.min(1, dt * 1.6);
    this.cam.x += (p.x - this.cam.x) * Math.min(1, dt * 5.5);
    this.cam.y += (p.y - this.cam.y) * Math.min(1, dt * 5.5);
    this.shakeT = Math.max(0, this.shakeT - dt);
    if (this.shakeT <= 0) this.shakeMag = 0;
    this.ensureChunks();
  }

  /* ---------- HUD ---------- */

  private pushHud() {
    const p = this.player;
    const sorted = [p, ...this.bots].sort((a, b) => b.score - a.score).slice(0, 5);
    this.cbs.onHud({
      score: Math.round(p.score),
      level: p.level,
      xp: Math.floor(p.xp),
      xpNext: xpNeed(p.level),
      hp: Math.max(0, Math.round(p.hp)),
      maxHp: Math.round(p.maxHp),
      boost: Math.round(this.boost),
      boosting: this.boosting,
      kills: this.kills,
      grass: this.grassCount,
      time: Math.floor(this.time),
      combo: this.combo,
      comboMult: Math.round(this.comboMult() * 100) / 100,
      zone: BIOMES[this.curZone].name,
      danger: biomeAt(p.x, p.y) === "magma" && p.level < 12,
      players: this.bots.length + 1,
      meName: p.name,
      buffs: {
        power: Math.max(0, Math.round(p.buffs.power * 10) / 10),
        speed: Math.max(0, Math.round(p.buffs.speed * 10) / 10),
      },
      leaderboard: sorted.map((e) => ({ name: e.name, score: Math.round(e.score), me: e.isPlayer, level: e.level })),
    });
  }

  /* ---------- отрисовка ---------- */

  private render() {
    const ctx = this.ctx;
    const z = this.cam.zoom;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = "#191006";
    ctx.fillRect(0, 0, this.vw, this.vh);

    const shx = this.shakeT > 0 ? (Math.random() - 0.5) * this.shakeMag : 0;
    const shy = this.shakeT > 0 ? (Math.random() - 0.5) * this.shakeMag : 0;

    ctx.save();
    ctx.translate(this.vw / 2 + shx, this.vh / 2 + shy);
    ctx.scale(z, z);
    ctx.translate(-this.cam.x, -this.cam.y);

    const viewX0 = this.cam.x - this.vw / (2 * z) - 60;
    const viewX1 = this.cam.x + this.vw / (2 * z) + 60;
    const viewY0 = this.cam.y - this.vh / (2 * z) - 60;
    const viewY1 = this.cam.y + this.vh / (2 * z) + 60;

    /* земля */
    for (const c of this.viewChunks) {
      const def = BIOMES[c.biome];
      ctx.fillStyle = c.groundTint < 0.5 ? def.ground : def.groundAlt;
      ctx.fillRect(c.cx * CHUNK, c.cy * CHUNK, CHUNK + 1, CHUNK + 1);
      ctx.fillStyle = def.speckle;
      for (const s of c.speckles) {
        ctx.globalAlpha = s.a;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    /* граница мира */
    ctx.strokeStyle = "#5c3a1e";
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, WORLD, WORLD);

    /* пшеница */
    const t = this.animT;
    ctx.lineCap = "round";
    for (const c of this.viewChunks) {
      const def = BIOMES[c.biome];
      let curColor = "";
      for (const b of c.blades) {
        if (b.x < viewX0 || b.x > viewX1 || b.y < viewY0 - 40 || b.y > viewY1) continue;
        const scale = b.cut >= 1 ? 0.22 : b.cut > 0 ? 0.22 + 0.78 * (1 - b.cut) : 1;
        const h = b.h * scale;
        const sw = Math.sin(t * 1.7 * b.sway + b.phase) * (2 + b.h * 0.07) * scale;
        const col = def.blades[b.tint];
        if (col !== curColor) { ctx.strokeStyle = col; curColor = col; }
        ctx.lineWidth = b.w;
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.quadraticCurveTo(b.x + b.lean * 0.5 + sw * 0.3, b.y - h * 0.55, b.x + b.lean + sw, b.y - h);
        ctx.stroke();
        if (b.flower >= 0 && scale > 0.7) {
          const fx = b.x + b.lean + sw, fy = b.y - h;
          const fc = def.flowerColors[b.flower];
          ctx.fillStyle = fc;
          for (let k = 0; k < 4; k++) {
            const a = (k / 4) * TAU + b.phase;
            ctx.beginPath();
            ctx.arc(fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 2.1, 0, TAU);
            ctx.fill();
          }
          ctx.fillStyle = "#ffd23f";
          ctx.beginPath();
          ctx.arc(fx, fy, 1.7, 0, TAU);
          ctx.fill();
          curColor = "";
        }
      }
    }

    /* кактусы */
    for (const c of this.viewChunks) {
      for (const cac of c.cacti) this.drawCactus(cac);
    }

    /* зелья */
    for (const pt of this.potions) {
      if (pt.x < viewX0 || pt.x > viewX1 || pt.y < viewY0 || pt.y > viewY1) continue;
      this.drawPotion(pt);
    }

    /* сущности (сортировка по y, рисуем только видимых — ботов на карте 100+) */
    const ents: Ent[] = [this.player, ...this.bots].filter((e) => !e.dead || e.isPlayer);
    ents.sort((a, b) => a.y - b.y);
    for (const e of ents) {
      if (!e.isPlayer && (e.x < viewX0 - 100 || e.x > viewX1 + 100 || e.y < viewY0 - 100 || e.y > viewY1 + 100)) continue;
      this.drawEnt(e);
    }

    /* частицы */
    for (const pt of this.particles) {
      const a = clamp(pt.life / pt.max, 0, 1);
      if (pt.kind === "shred") {
        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.globalAlpha = a;
        ctx.fillStyle = pt.color;
        ctx.fillRect(-pt.size, -pt.size * 0.35, pt.size * 2, pt.size * 0.7);
        ctx.restore();
      } else if (pt.kind === "spark" || pt.kind === "ember" || pt.kind === "orb") {
        ctx.globalAlpha = a;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, TAU);
        ctx.fill();
      } else if (pt.kind === "ring") {
        ctx.globalAlpha = a * 0.8;
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, TAU);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    /* тексты */
    ctx.textAlign = "center";
    const invZ = 1 / Math.sqrt(z);
    for (const ft of this.texts) {
      ctx.globalAlpha = clamp(ft.life, 0, 1);
      ctx.font = `${ft.size * invZ}px "Russo One", sans-serif`;
      ctx.lineWidth = 4 * invZ;
      ctx.strokeStyle = "rgba(7,17,8,0.85)";
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    /* виньетка */
    const vg = ctx.createRadialGradient(
      this.vw / 2, this.vh / 2, Math.min(this.vw, this.vh) * 0.36,
      this.vw / 2, this.vh / 2, Math.max(this.vw, this.vh) * 0.72
    );
    vg.addColorStop(0, "rgba(4,10,5,0)");
    vg.addColorStop(1, "rgba(4,10,5,0.42)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, this.vw, this.vh);

    /* красная пульсация при низком hp */
    const p = this.player;
    if (!p.dead && p.hp < p.maxHp * 0.35) {
      const k = 1 - p.hp / (p.maxHp * 0.35);
      const rg = ctx.createRadialGradient(
        this.vw / 2, this.vh / 2, Math.min(this.vw, this.vh) * 0.3,
        this.vw / 2, this.vh / 2, Math.max(this.vw, this.vh) * 0.7
      );
      rg.addColorStop(0, "rgba(244,67,46,0)");
      rg.addColorStop(1, `rgba(244,67,46,${(0.28 + 0.16 * Math.sin(this.animT * 7)) * k})`);
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, this.vw, this.vh);
    }
  }

  private drawPotion(pt: Potion) {
    const ctx = this.ctx;
    const col = POTION_COLORS[pt.kind];
    const age = this.time - pt.born;
    const blink = age > 21 ? 0.35 + 0.65 * Math.abs(Math.sin(this.animT * 6)) : 1;
    const fy = pt.y + Math.sin(this.animT * 3 + pt.id) * 3;

    ctx.save();
    ctx.translate(pt.x, fy);
    ctx.globalAlpha = blink;

    /* свечение */
    ctx.globalAlpha = 0.2 * blink;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(0, 2, 17, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = blink;

    /* тень */
    ctx.fillStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.ellipse(0, 12, 8, 3, 0, 0, TAU);
    ctx.fill();

    /* колба: круглое дно + горлышко */
    ctx.fillStyle = col;
    ctx.strokeStyle = "rgba(20,12,4,0.85)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 3, 7.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = col;
    ctx.fillRect(-3, -12, 6, 11);
    ctx.strokeRect(-3, -12, 6, 11);
    /* пробка */
    ctx.fillStyle = "#8a5a2a";
    ctx.fillRect(-4, -16, 8, 5);
    ctx.strokeRect(-4, -16, 8, 5);
    /* блик */
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(-2.4, 1.4, 4, Math.PI * 0.8, Math.PI * 1.4);
    ctx.stroke();
    /* пузырёк */
    const bub = Math.sin(this.animT * 5 + pt.id * 2);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.beginPath();
    ctx.arc(1.6, 3.5 + bub * 1.6, 1.5, 0, TAU);
    ctx.fill();

    ctx.restore();
  }

  private drawCactus(cac: Cactus) {
    const ctx = this.ctx;
    const { x, y, h } = cac;
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(x, y + 3, 14, 6, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#3e8f3e";
    ctx.strokeStyle = "#245c1e";
    ctx.lineWidth = 2;
    const bw = 15;
    ctx.beginPath();
    ctx.moveTo(x - bw / 2, y);
    ctx.lineTo(x - bw / 2, y - h + bw / 2);
    ctx.arc(x, y - h + bw / 2, bw / 2, Math.PI, 0);
    ctx.lineTo(x + bw / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (cac.arm > 0.3) {
      const ay = y - h * 0.55;
      const dir = cac.arm > 0.65 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(x + dir * bw * 0.4, ay + 10);
      ctx.lineTo(x + dir * (bw * 0.4 + 10), ay + 10);
      ctx.lineTo(x + dir * (bw * 0.4 + 10), ay - 8);
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#3e8f3e";
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#245c1e";
    }
    ctx.strokeStyle = "#e8f6da";
    ctx.lineWidth = 1;
    for (let k = 0; k < 5; k++) {
      const sy = y - 6 - (k / 5) * (h - 14);
      ctx.beginPath();
      ctx.moveTo(x - bw / 2, sy);
      ctx.lineTo(x - bw / 2 - 4, sy - 2);
      ctx.moveTo(x + bw / 2, sy - 5);
      ctx.lineTo(x + bw / 2 + 4, sy - 7);
      ctx.stroke();
    }
  }

  /* узор на теле скина (полосы, горох, клетка, зигзаг, кольца, пятна) */
  private drawPattern(e: Ent) {
    const ctx = this.ctx;
    const r = e.radius;
    const rnd = mulberry32(e.id * 7919 + 13);
    ctx.save();
    ctx.beginPath();
    ctx.arc(e.x, e.y, r - 0.5, 0, TAU);
    ctx.clip();
    ctx.fillStyle = e.skin.ink;
    ctx.strokeStyle = e.skin.ink;
    switch (e.skin.pattern) {
      case "stripes": {
        ctx.translate(e.x, e.y);
        ctx.rotate(-Math.PI / 4 + e.id);
        for (let i = -3; i <= 3; i++) {
          ctx.fillRect(-r * 2, i * r * 0.52 - r * 0.1, r * 4, r * 0.2);
        }
        break;
      }
      case "dots": {
        for (let gy = -2; gy <= 2; gy++) {
          for (let gx = -2; gx <= 2; gx++) {
            const px = e.x + gx * r * 0.5 + (gy % 2 === 0 ? 0 : r * 0.25);
            const py = e.y + gy * r * 0.46;
            if ((px - e.x) ** 2 + (py - e.y) ** 2 > r * r) continue;
            ctx.beginPath();
            ctx.arc(px, py, r * 0.11, 0, TAU);
            ctx.fill();
          }
        }
        break;
      }
      case "checker": {
        const s = r * 0.42;
        for (let gy = -3; gy <= 3; gy++) {
          for (let gx = -3; gx <= 3; gx++) {
            if ((gx + gy) % 2 === 0) continue;
            ctx.fillRect(e.x + gx * s, e.y + gy * s, s, s);
          }
        }
        break;
      }
      case "zigzag": {
        ctx.lineWidth = r * 0.12;
        ctx.lineJoin = "round";
        for (let row = -2; row <= 2; row++) {
          const y0 = e.y + row * r * 0.5;
          ctx.beginPath();
          for (let k = -3; k <= 3; k++) {
            const px = e.x + k * r * 0.32;
            const py = y0 + (k % 2 === 0 ? -r * 0.13 : r * 0.13);
            if (k === -3) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        break;
      }
      case "rings": {
        ctx.lineWidth = r * 0.13;
        for (const rr of [0.32, 0.66]) {
          ctx.beginPath();
          ctx.arc(e.x, e.y, r * rr, 0, TAU);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(e.x, e.y, r * 0.1, 0, TAU);
        ctx.fill();
        break;
      }
      case "patches": {
        for (let k = 0; k < 4; k++) {
          const a = rnd() * TAU;
          const d = rnd() * r * 0.55;
          ctx.beginPath();
          ctx.arc(e.x + Math.cos(a) * d, e.y + Math.sin(a) * d, r * (0.2 + rnd() * 0.16), 0, TAU);
          ctx.fill();
        }
        break;
      }
    }
    ctx.restore();
  }

  private drawEnt(e: Ent) {
    const ctx = this.ctx;
    if (e.dead) return;
    const blink = e.shieldT > 0 && Math.floor(this.animT * 8) % 2 === 0;

    /* тень */
    ctx.fillStyle = "rgba(0,0,0,0.24)";
    ctx.beginPath();
    ctx.ellipse(e.x, e.y + e.radius * 0.55, e.radius * 1.05, e.radius * 0.42, 0, 0, TAU);
    ctx.fill();

    /* аура зелья */
    if (e.buffs.power > 0 || e.buffs.speed > 0) {
      const col = e.buffs.power > 0 ? "#ff5340" : "#59dcff";
      ctx.save();
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(this.animT * 6);
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius + 10, this.animT * 3, this.animT * 3 + TAU);
      ctx.stroke();
      ctx.restore();
    }

    ctx.save();
    if (blink) ctx.globalAlpha = 0.55;

    /* рукояти кос */
    for (let k = 0; k < 2; k++) {
      const ang = e.bladeAngle + k * Math.PI;
      const ex = e.x + Math.cos(ang) * e.radius * 0.7;
      const ey = e.y + Math.sin(ang) * e.radius * 0.7;
      const tx = e.x + Math.cos(ang) * (e.bladeR - 6);
      const ty = e.y + Math.sin(ang) * (e.bladeR - 6);
      ctx.strokeStyle = "#6b4a1f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tx, ty, e.radius * 0.72 + 5, ang - 1.9, ang + 1.2);
      ctx.arc(tx, ty, (e.radius * 0.72 + 5) * 0.42, ang + 1.2, ang - 1.9, true);
      ctx.closePath();
      ctx.fillStyle = e.skin.blade;
      ctx.fill();
      ctx.strokeStyle = e.skin.bladeRim;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    /* тело */
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, TAU);
    ctx.fillStyle = e.skin.body;
    ctx.fill();
    if (e.skin.pattern !== "none") this.drawPattern(e);
    ctx.lineWidth = 3;
    ctx.strokeStyle = e.skin.rim;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(e.x - e.radius * 0.3, e.y - e.radius * 0.35, e.radius * 0.55, Math.PI * 0.9, Math.PI * 1.6);
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = e.radius * 0.16;
    ctx.stroke();

    /* глаза */
    const exo = Math.cos(e.dir) * e.radius * 0.32;
    const eyo = Math.sin(e.dir) * e.radius * 0.32;
    for (const s of [-0.55, 0.55]) {
      const px = e.x + Math.cos(e.dir + s) * e.radius * 0.42 + exo * 0.4;
      const py = e.y + Math.sin(e.dir + s) * e.radius * 0.42 + eyo * 0.4;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(px, py, e.radius * 0.24, 0, TAU);
      ctx.fill();
      ctx.fillStyle = "#10240f";
      ctx.beginPath();
      ctx.arc(px + exo * 0.35, py + eyo * 0.35, e.radius * 0.12, 0, TAU);
      ctx.fill();
    }

    /* вспышка урона */
    if (e.hurtT > 0) {
      ctx.globalAlpha = Math.min(0.5, e.hurtT * 1.4);
      ctx.fillStyle = "#ff5340";
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = blink ? 0.55 : 1;
    }

    /* щит */
    if (e.shieldT > 0) {
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = "rgba(179,248,119,0.8)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius + 7, this.animT * 2, this.animT * 2 + TAU);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();

    const invZ = 1 / Math.sqrt(this.cam.zoom);

    /* полоска hp */
    if (e.hp < e.maxHp) {
      const w = e.radius * 2.4;
      const pct = clamp(e.hp / e.maxHp, 0, 1);
      ctx.fillStyle = "rgba(7,17,8,0.7)";
      ctx.fillRect(e.x - w / 2, e.y - e.radius - 14 * invZ, w, 4.5 * invZ);
      ctx.fillStyle = pct > 0.5 ? "#8def4a" : pct > 0.25 ? "#ffd23f" : "#ff5340";
      ctx.fillRect(e.x - w / 2, e.y - e.radius - 14 * invZ, w * pct, 4.5 * invZ);
    }

    /* имя бота + точка тактики */
    if (!e.isPlayer) {
      ctx.font = `600 ${12.5 * invZ}px Rubik, sans-serif`;
      ctx.textAlign = "center";
      const label = `${e.name} · ур.${e.level}`;
      const w = ctx.measureText(label).width;
      const ny = e.y - e.radius - 19 * invZ;
      ctx.lineWidth = 3.5 * invZ;
      ctx.strokeStyle = "rgba(7,17,8,0.8)";
      ctx.strokeText(label, e.x, ny);
      ctx.fillStyle = e.dmg > this.player.dmg * 1.15 ? "#ff8d7d" : "#d6ffb0";
      ctx.fillText(label, e.x, ny);
      ctx.fillStyle = TACTIC_COLORS[e.tactic];
      ctx.beginPath();
      ctx.arc(e.x - w / 2 - 7 * invZ, ny - 3.5 * invZ, 2.8 * invZ, 0, TAU);
      ctx.fill();
    }
  }


}
