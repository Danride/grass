import { useEffect, useRef, useState } from "react";
import type { Engine, HudData } from "../game/engine";
import { IconBot, IconClock, IconGrass, IconMuted, IconPause, IconSound } from "./icons";

interface HUDProps {
  hud: HudData;
  engine: Engine | null;
  isTouch: boolean;
  muted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
}

export function HUD({ hud, engine, isTouch, muted, onPause, onToggleMute }: HUDProps) {
  const [joy, setJoy] = useState<{ bx: number; by: number; kx: number; ky: number } | null>(null);
  const joyId = useRef<number | null>(null);
  const base = useRef({ x: 0, y: 0 });
  const boostIds = useRef(new Set<number>());

  /* сенсорное управление: левая половина — джойстик, правая — спринт */
  useEffect(() => {
    if (!isTouch || !engine) return;
    const syncBoost = () => engine.setBoost(boostIds.current.size > 0);
    const onStart = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        if (t.clientX < window.innerWidth * 0.45 && joyId.current === null) {
          joyId.current = t.identifier;
          base.current = { x: t.clientX, y: t.clientY };
          setJoy({ bx: t.clientX, by: t.clientY, kx: t.clientX, ky: t.clientY });
        } else {
          boostIds.current.add(t.identifier);
        }
      }
      syncBoost();
    };
    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joyId.current) {
          const dx = t.clientX - base.current.x;
          const dy = t.clientY - base.current.y;
          const len = Math.hypot(dx, dy);
          const cl = Math.min(len, 48);
          const nx = len > 4 ? (dx / len) * cl : 0;
          const ny = len > 4 ? (dy / len) * cl : 0;
          setJoy({ bx: base.current.x, by: base.current.y, kx: base.current.x + nx, ky: base.current.y + ny });
          engine.setJoy(len > 4 ? dx / len : 0, len > 4 ? dy / len : 0, len > 8);
        }
      }
    };
    const onEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === joyId.current) {
          joyId.current = null;
          setJoy(null);
          engine.setJoy(0, 0, false);
        }
        boostIds.current.delete(t.identifier);
      }
      syncBoost();
    };
    document.addEventListener("touchstart", onStart, { passive: false });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onEnd);
    document.addEventListener("touchcancel", onEnd);
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, [engine, isTouch]);

  const hpPct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const xpPct = Math.max(0, Math.min(100, (hud.xp / hud.xpNext) * 100));
  const lowHp = hud.hp / hud.maxHp < 0.35;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 select-none">
      {/* ===== верх слева: игрок ===== */}
      <div className={`absolute left-2 top-2 sm:left-3 sm:top-3 ${isTouch ? "w-[44vw] max-w-[210px]" : "w-60"}`}>
        <div className="hud-chip px-2.5 py-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className={`font-display leading-none ${isTouch ? "text-[13px]" : "text-sm"} text-grass-200 truncate`}>
              {hud.meName ?? "Косарь"}
            </span>
            <span className="font-display text-[10px] leading-none text-sun-400">ур. {hud.level}</span>
          </div>
          <div className={`mt-1 flex items-center justify-between font-display leading-none text-grass-300 ${isTouch ? "text-[11px]" : "text-[13px]"}`}>
            <span>{hud.score.toLocaleString("ru-RU")}</span>
            <span className="text-grass-200/50 text-[10px] flex items-center gap-1.5">
              <IconGrass size={11} className="text-grass-400" />
              {hud.grass}
              <IconBot size={11} className="text-blood-400" />
              {hud.kills}
            </span>
          </div>
          {/* xp */}
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-pit-950/80">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sun-600 to-sun-400 transition-[width] duration-200"
              style={{ width: xpPct + "%" }}
            />
          </div>
          {/* hp */}
          <div className={`mt-1 h-2.5 overflow-hidden rounded-md border border-pit-600 bg-pit-950/80 ${lowHp ? "anim-blink" : ""}`}>
            <div
              className={`h-full rounded-md transition-[width] duration-150 ${
                hpPct > 50 ? "bg-gradient-to-r from-grass-600 to-grass-400" : hpPct > 25 ? "bg-gradient-to-r from-sun-600 to-sun-400" : "bg-gradient-to-r from-blood-600 to-blood-400"
              }`}
              style={{ width: hpPct + "%" }}
            />
          </div>
          <div className="mt-0.5 flex justify-between text-[9px] font-bold leading-none text-grass-200/55">
            <span>{hud.hp}/{hud.maxHp}</span>
            {!isTouch && (
              <span className="flex items-center gap-1">
                <IconClock size={10} />
                {Math.floor(hud.time / 60)}:{String(hud.time % 60).padStart(2, "0")}
              </span>
            )}
          </div>
          {/* выносливость */}
          <div className={`mt-1 h-1.5 overflow-hidden rounded-full border border-pit-600 bg-pit-950/80 ${hud.boosting ? "shadow-[0_0_8px_rgba(255,210,63,0.7)]" : ""}`}>
            <div
              className={`h-full rounded-full transition-[width] duration-150 ${hud.boosting ? "bg-sun-300" : "bg-sun-600/80"}`}
              style={{ width: hud.boost + "%" }}
            />
          </div>
        </div>

        {/* бафы + комбо */}
        <div className="mt-1.5 flex items-center gap-1.5">
          {hud.buffs.power > 0 && (
            <span
              className="grid h-5 min-w-5 place-items-center rounded-full border border-[#ff5040] bg-[#ff504055] px-1 font-display text-[9px] text-white"
              style={{ textShadow: "0 1px 2px #000" }}
              title="Сила ×1.4"
            >
              С{Math.ceil(hud.buffs.power)}
            </span>
          )}
          {hud.buffs.speed > 0 && (
            <span
              className="grid h-5 min-w-5 place-items-center rounded-full border border-[#4ac6ff] bg-[#4ac6ff55] px-1 font-display text-[9px] text-white"
              style={{ textShadow: "0 1px 2px #000" }}
              title="Скорость ×1.5"
            >
              Б{Math.ceil(hud.buffs.speed)}
            </span>
          )}
          {hud.comboMult > 1.05 && (
            <span
              key={Math.round(hud.combo * 10)}
              className={`anim-combo hud-chip px-2 py-0.5 font-display text-[11px] leading-none text-sun-300 ${hud.comboMult >= 2.5 ? "border-sun-500 shadow-[0_0_10px_rgba(255,210,63,0.5)]" : ""}`}
            >
              ×{hud.comboMult.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {/* ===== верх справа: кнопки + лидерборд ===== */}
      <div className="absolute right-2 top-2 flex items-center gap-1.5 sm:right-3 sm:top-3">
        <button
          onClick={onToggleMute}
          className="pointer-events-auto grid h-8 w-8 place-items-center rounded-lg hud-chip text-grass-300 active:scale-95 sm:h-9 sm:w-9"
          aria-label="звук"
        >
          {muted ? <IconMuted size={15} /> : <IconSound size={15} />}
        </button>
        <button
          onClick={onPause}
          className="pointer-events-auto grid h-8 w-8 place-items-center rounded-lg hud-chip text-grass-300 active:scale-95 sm:h-9 sm:w-9"
          aria-label="пауза"
        >
          <IconPause size={15} />
        </button>
      </div>

      {/* лидерборд — только десктоп */}
      <div className="hud-chip absolute right-3 top-14 hidden w-44 px-2.5 py-2 md:block">
        <div className="flex items-center justify-between">
          <div className="font-display text-[10px] uppercase tracking-wider text-sun-400">Топ косарей</div>
          <div className="flex items-center gap-1 font-display text-[10px] text-grass-300">
            <span className="anim-blink inline-block h-1.5 w-1.5 rounded-full bg-grass-400" />
            {hud.players}
          </div>
        </div>
        <div className="mt-1 space-y-0.5">
          {hud.leaderboard.map((r, i) => (
            <div
              key={r.name + i}
              className={`flex items-center justify-between rounded px-1.5 py-0.5 text-[11px] ${
                r.me ? "bg-grass-700/50 font-bold text-grass-200" : "text-grass-200/75"
              }`}
            >
              <span className="truncate">
                <span className="mr-1 inline-block w-3 font-display text-[10px] text-sun-400">{i + 1}</span>
                {r.name}
              </span>
              <span className="font-display text-[10px]">{r.score.toLocaleString("ru-RU")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== зона внизу по центру ===== */}
      <div key={hud.zone} className={`anim-zone absolute left-1/2 -translate-x-1/2 ${isTouch ? "bottom-2" : "top-3"}`}>
        <div
          className={`hud-chip px-3 py-1 font-display uppercase tracking-wider ${isTouch ? "text-[10px]" : "text-xs"} ${
            hud.danger ? "border-blood-500 text-blood-400 anim-blink" : "text-sun-300"
          }`}
        >
          {hud.zone}
        </div>
      </div>

      {/* подсказка клавиш (десктоп) */}
      {!isTouch && (
        <div className="absolute bottom-2 right-3 hidden text-[11px] text-grass-200/45 md:block">
          <span className="kbd">ЛКМ</span> спринт · <span className="kbd">Esc</span> пауза
        </div>
      )}

      {/* подсказка старта */}
      {hud.time < 7 && (
        <div className="anim-pop absolute bottom-[18%] left-1/2 w-[92vw] max-w-sm -translate-x-1/2 text-center">
          <div className="panel px-4 py-2.5 text-[13px] leading-snug text-grass-200">
            {isTouch ? (
              <>Палец <b className="text-grass-300">слева</b> — джойстик, удержи <b className="text-sun-300">справа</b> — спринт. Коси пшеницу и зелёных ботов!</>
            ) : (
              <>Двигайся <b className="text-grass-300">мышью</b>, зажми <b className="text-sun-300">ЛКМ</b> — спринт. Коси пшеницу и зелёных ботов!</>
            )}
          </div>
        </div>
      )}

      {/* джойстик (только тач) */}
      {isTouch && joy && (
        <div
          className="absolute z-20 rounded-full border-2 border-grass-500/50 bg-pit-950/25"
          style={{ left: joy.bx - 46, top: joy.by - 46, width: 92, height: 92 }}
        >
          <div
            className="absolute rounded-full border-2 border-grass-300 bg-grass-600/70 shadow-[0_0_14px_rgba(111,211,44,0.5)]"
            style={{ left: 46 + (joy.kx - joy.bx) - 21, top: 46 + (joy.ky - joy.by) - 21, width: 42, height: 42 }}
          />
        </div>
      )}

      {/* индикатор спринта на таче */}
      {isTouch && hud.boosting && (
        <div className="absolute bottom-6 right-5 rounded-full border-2 border-sun-500 bg-sun-500/20 px-3 py-1.5 font-display text-[11px] uppercase text-sun-300">
          спринт
        </div>
      )}

    </div>
  );
}
