import { useEffect, useRef, useState } from "react";
import type { Engine, HudData } from "../game/engine";
import { IconBot, IconClock, IconGrass, IconMuted, IconPause, IconSound } from "./icons";
import { fmt, fmtTime } from "../game/meta";

interface HUDProps {
  hud: HudData;
  engine: Engine | null;
  isTouch: boolean;
  muted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
}

export function HUD({ hud, engine, isTouch, muted, onPause, onToggleMute }: HUDProps) {
  const mapRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!engine || !mapRef.current) return;
    const id = window.setInterval(() => {
      if (mapRef.current) engine.renderMinimap(mapRef.current);
    }, 180);
    return () => window.clearInterval(id);
  }, [engine]);

  const hpPct = (hud.hp / hud.maxHp) * 100;
  const xpPct = Math.min(100, (hud.xp / hud.xpNext) * 100);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 font-sans">
      {/* ---- верх слева: счёт + уровень ---- */}
      <div className="absolute left-2.5 top-2.5 flex items-start gap-2 sm:left-4 sm:top-4">
        <div className="hud-chip flex flex-col items-center px-2.5 py-1.5">
          <div className="font-display text-[10px] uppercase leading-none text-sun-400">ур.</div>
          <div className="font-display text-2xl leading-tight text-grass-300 drop-shadow-[0_2px_0_rgba(7,17,8,0.9)]">
            {hud.level}
          </div>
        </div>
        <div className="hud-chip min-w-[128px] px-2.5 py-1.5 sm:min-w-[190px]">
          <div className="flex items-baseline justify-between">
            <span className="font-display text-[10px] uppercase tracking-wide text-grass-200/70">Очки</span>
            <span className="font-display text-base text-grass-200 drop-shadow-[0_2px_0_rgba(7,17,8,0.9)] sm:text-xl">
              {fmt(hud.score)}
            </span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-sm border border-pit-600 bg-pit-950">
            <div
              className="h-full bg-gradient-to-r from-sun-600 to-sun-400 transition-[width] duration-200"
              style={{ width: xpPct + "%" }}
            />
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-sm border border-pit-600 bg-pit-950">
            <div
              className={`h-full transition-[width] duration-150 ${
                hpPct > 50
                  ? "bg-gradient-to-r from-grass-600 to-grass-400"
                  : hpPct > 25
                    ? "bg-gradient-to-r from-sun-600 to-sun-400"
                    : "bg-gradient-to-r from-blood-600 to-blood-400"
              }`}
              style={{ width: hpPct + "%" }}
            />
          </div>
          <div className="mt-0.5 flex justify-between text-[10px] font-bold text-grass-200/55">
            <span>опыт {fmt(hud.xp)}/{fmt(hud.xpNext)}</span>
            <span>силы {hud.hp}</span>
          </div>
        </div>
      </div>

      {/* ---- верх справа: миникарта + статистика + кнопки ---- */}
      <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-2 sm:right-4 sm:top-4">
        <div className="flex items-center gap-2">
          <div className="hud-chip hidden items-center gap-2 px-2 py-1 text-[11px] font-bold text-grass-200/80 sm:flex">
            <span className="flex items-center gap-1"><IconGrass size={13} className="text-grass-400" />{fmt(hud.grass)}</span>
            <span className="flex items-center gap-1"><IconBot size={13} className="text-blood-400" />{hud.kills}</span>
            <span className="flex items-center gap-1"><IconClock size={13} className="text-dew-400" />{fmtTime(hud.time)}</span>
          </div>
          <button
            onClick={onToggleMute}
            className="hud-chip pointer-events-auto grid h-9 w-9 place-items-center text-grass-300 transition hover:text-grass-200 active:scale-90"
            aria-label="звук"
          >
            {muted ? <IconMuted size={17} /> : <IconSound size={17} />}
          </button>
          <button
            onClick={onPause}
            className="hud-chip pointer-events-auto grid h-9 w-9 place-items-center text-grass-300 transition hover:text-grass-200 active:scale-90"
            aria-label="пауза"
          >
            <IconPause size={17} />
          </button>
        </div>
        <canvas ref={mapRef} width={148} height={148} className="hud-chip hidden h-[148px] w-[148px] md:block" />
      </div>

      {/* ---- лидерборд ---- */}
      <div className="hud-chip absolute left-2.5 top-[104px] hidden w-48 px-2.5 py-2 md:block sm:left-4 sm:top-[120px]">
        <div className="flex items-center justify-between">
          <div className="font-display text-[10px] uppercase tracking-wider text-sun-400">Топ косарей</div>
          <div className="flex items-center gap-1 font-display text-[10px] text-grass-300">
            <span className="anim-blink inline-block h-1.5 w-1.5 rounded-full bg-grass-400" />
            {hud.players} в поле
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
                <span className="ml-1 text-[10px] text-grass-200/45">ур.{r.level}</span>
              </span>
              <span className="ml-2 font-display text-[10px]">{fmt(r.score)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ---- комбо ---- */}
      {hud.combo >= 15 && (
        <div
          key={Math.floor(hud.combo / 15)}
          className="anim-combo absolute left-1/2 top-24 -translate-x-1/2 text-center sm:top-28"
        >
          <div className="font-display text-3xl text-sun-400 drop-shadow-[0_3px_0_rgba(7,17,8,0.9)] sm:text-4xl">
            ×{hud.comboMult.toFixed(2)}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-sun-300/80">
            жатва · {hud.combo}
          </div>
        </div>
      )}

      {/* ---- название зоны ---- */}
      <div key={hud.zone} className="anim-zone absolute left-1/2 top-9 -translate-x-1/2 sm:top-11">
        <div className="hud-chip px-3 py-1 font-display text-xs uppercase tracking-widest text-sun-300 sm:text-sm">
          {hud.zone}
        </div>
      </div>
      {hud.danger && (
        <div className="absolute left-1/2 top-[72px] -translate-x-1/2 font-display text-[11px] uppercase tracking-widest text-blood-400 sm:top-[76px]">
          <span className="anim-blink">Земля жжёт! Нужен уровень 12+</span>
        </div>
      )}

      {/* ---- нижняя полоса буста (десктоп) ---- */}
      {!isTouch && (
        <div className="absolute bottom-3 left-1/2 w-52 -translate-x-1/2">
          <div className="h-2 overflow-hidden rounded-full border border-pit-600 bg-pit-950/80">
            <div
              className={`h-full rounded-full transition-[width] duration-150 ${
                hud.boosting ? "bg-gradient-to-r from-sun-500 to-sun-300" : "bg-gradient-to-r from-dew-500 to-dew-300"
              }`}
              style={{ width: hud.boost + "%" }}
            />
          </div>
          <div className="mt-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-grass-200/45">
            Пробел — ускорение
          </div>
        </div>
      )}

      {isTouch && <TouchControls hud={hud} engine={engine} />}
    </div>
  );
}

/* ================= сенсорное управление ================= */

function TouchControls({ hud, engine }: { hud: HudData; engine: Engine | null }) {
  const [stick, setStick] = useState<{ ox: number; oy: number; dx: number; dy: number } | null>(null);

  useEffect(() => {
    let id: number | null = null;
    let ox = 0, oy = 0;
    const R = 58;

    const down = (e: PointerEvent) => {
      if (e.clientX > window.innerWidth * 0.62) return;
      id = e.pointerId;
      ox = e.clientX;
      oy = e.clientY;
      setStick({ ox, oy, dx: 0, dy: 0 });
      e.preventDefault();
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      let dx = e.clientX - ox;
      let dy = e.clientY - oy;
      const d = Math.hypot(dx, dy);
      if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R; }
      setStick({ ox, oy, dx, dy });
      engine?.setJoy(dx / R, dy / R, true);
      e.preventDefault();
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = null;
      setStick(null);
      engine?.setJoy(0, 0, false);
    };

    window.addEventListener("pointerdown", down, { passive: false });
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [engine]);

  return (
    <>
      {stick && (
        <div
          className="pointer-events-none absolute z-20 h-32 w-32 rounded-full border-2 border-grass-400/40 bg-pit-950/40"
          style={{ left: stick.ox - 64, top: stick.oy - 64 }}
        >
          <div
            className="absolute left-1/2 top-1/2 h-14 w-14 rounded-full border-2 border-grass-300 bg-grass-500/70 shadow-[0_0_18px_rgba(141,239,74,0.5)]"
            style={{ transform: `translate(calc(-50% + ${stick.dx}px), calc(-50% + ${stick.dy}px))` }}
          />
        </div>
      )}
      {!stick && (
        <div className="absolute bottom-24 left-6 z-10 grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-grass-400/25 text-[10px] font-bold uppercase tracking-wider text-grass-200/35">
          веди пальцем
        </div>
      )}
      <button
        className={`pointer-events-auto absolute bottom-8 right-5 z-20 h-20 w-20 touch-none select-none rounded-full border-4 font-display text-[13px] uppercase transition active:scale-95 ${
          hud.boosting
            ? "border-sun-300 bg-sun-500 text-pit-950 shadow-[0_0_26px_rgba(255,210,63,0.7)]"
            : "border-dew-400/60 bg-pit-800/85 text-dew-300"
        }`}
        style={{ touchAction: "none" }}
        onPointerDown={(e) => {
          e.preventDefault();
          engine?.setBoost(true);
        }}
        onPointerUp={() => engine?.setBoost(false)}
        onPointerLeave={() => engine?.setBoost(false)}
        onPointerCancel={() => engine?.setBoost(false)}
      >
        Буст
        <span className="mx-auto mt-0.5 block h-1 w-10 overflow-hidden rounded-full bg-pit-950/60">
          <span
            className="block h-full rounded-full bg-dew-400 transition-[width]"
            style={{ width: hud.boost + "%" }}
          />
        </span>
      </button>
    </>
  );
}
