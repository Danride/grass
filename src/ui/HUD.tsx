import { useEffect, useRef, useState } from "react";
import type { Engine, HudData } from "../game/engine";
import { IconBlade, IconBot, IconClock, IconGrass, IconLegs, IconMuted, IconPause, IconSound } from "./icons";

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
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      if (engine && mapRef.current) engine.renderMinimap(mapRef.current);
    }, 250);
    return () => clearInterval(id);
  }, [engine]);

  useEffect(() => {
    const id = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(id);
  }, []);

  const hpPct = Math.max(0, Math.min(100, (hud.hp / hud.maxHp) * 100));
  const xpPct = Math.max(0, Math.min(100, (hud.xp / hud.xpNext) * 100));
  const mm = Math.floor(hud.time / 60);
  const ss = String(hud.time % 60).padStart(2, "0");

  return (
    <div className="pointer-events-none absolute inset-0 z-10 select-none">
      {/* ======== верх: игрок ======== */}
      <div className="absolute left-2 top-2 flex max-w-[62%] flex-col gap-1.5 sm:left-3 sm:top-3">
        <div className="hud-chip px-2.5 py-2 sm:w-64">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-[13px] leading-none text-grass-300">
              УР. <span className="text-lg text-grass-200">{hud.level}</span>
            </span>
            <span className="font-display text-[13px] leading-none text-sun-300">
              {hud.score.toLocaleString("ru-RU")}
            </span>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full border border-pit-600 bg-pit-950">
            <div
              className="h-full rounded-full bg-gradient-to-r from-grass-700 via-grass-500 to-grass-300 transition-[width] duration-150"
              style={{ width: xpPct + "%" }}
            />
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-pit-600 bg-pit-950">
            <div
              className="h-full rounded-full transition-[width] duration-150"
              style={{
                width: hpPct + "%",
                background:
                  hpPct > 50
                    ? "linear-gradient(90deg,#f4432e,#ff7059)"
                    : hpPct > 25
                      ? "linear-gradient(90deg,#c78d0a,#ffd23f)"
                      : "linear-gradient(90deg,#8a1608,#f4432e)",
              }}
            />
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-pit-950">
            <div
              className={`h-full rounded-full bg-sun-400 transition-[width] duration-150 ${hud.boosting ? "anim-blink" : ""}`}
              style={{ width: hud.boost + "%" }}
            />
          </div>
        </div>

        {/* активные зелья */}
        {(hud.buffs.power > 0 || hud.buffs.speed > 0) && (
          <div className="flex gap-1.5">
            {hud.buffs.power > 0 && (
              <BuffChip color="#ff5340" label="Сила ×1.4" t={hud.buffs.power} icon={<IconBlade size={13} />} />
            )}
            {hud.buffs.speed > 0 && (
              <BuffChip color="#59dcff" label="Ветер ×1.5" t={hud.buffs.speed} icon={<IconLegs size={13} />} />
            )}
          </div>
        )}
      </div>

      {/* ======== верх справа: кнопки и миникарта ======== */}
      <div className="absolute right-2 top-2 flex flex-col items-end gap-1.5 sm:right-3 sm:top-3">
        <div className="pointer-events-auto flex gap-1.5">
          <button
            onClick={onToggleMute}
            className="hud-chip grid h-9 w-9 place-items-center text-grass-300 active:scale-95"
            aria-label="звук"
          >
            {muted ? <IconMuted size={17} /> : <IconSound size={17} />}
          </button>
          <button
            onClick={onPause}
            className="hud-chip grid h-9 w-9 place-items-center text-grass-300 active:scale-95"
            aria-label="пауза"
          >
            <IconPause size={17} />
          </button>
        </div>
        <div className="hud-chip p-1.5">
          <canvas ref={mapRef} width={132} height={132} className="block h-[100px] w-[100px] sm:h-[132px] sm:w-[132px]" />
        </div>
        <div className="hud-chip hidden w-48 px-2.5 py-2 md:block">
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
                  <span className="ml-1 text-[9px] text-grass-200/45">ур.{r.level}</span>
                </span>
                <span className="ml-2 shrink-0 font-display text-[10px]">{r.score.toLocaleString("ru-RU")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======== баннер зоны ======== */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 sm:bottom-auto sm:left-1/2 sm:top-3">
        <div
          key={hud.zone}
          className={`anim-zone hud-chip px-3 py-1.5 font-display text-[12px] uppercase tracking-wider sm:text-sm ${
            hud.danger ? "text-blood-400" : "text-grass-200/90"
          }`}
        >
          {hud.zone}
          {hud.danger && <span className="anim-blink ml-2 text-[10px]">жжёт!</span>}
        </div>
      </div>

      {/* ======== комбо ======== */}
      {hud.combo > 4 && (
        <div className="absolute left-1/2 top-[22%] -translate-x-1/2">
          <div key={hud.combo} className="anim-combo text-center">
            <div className="font-display text-3xl text-sun-400 drop-shadow-[0_3px_0_rgba(7,17,8,0.9)] sm:text-4xl">
              ×{hud.comboMult.toFixed(2)}
            </div>
            <div className="font-display text-[10px] uppercase tracking-[0.3em] text-sun-300/80">
              комбо {hud.combo}
            </div>
          </div>
        </div>
      )}

      {/* ======== низ слева: статистика ======== */}
      <div className="absolute bottom-2 left-2 flex flex-col gap-1.5 sm:bottom-3 sm:left-3">
        <div className="hud-chip flex items-center gap-2 px-2.5 py-1.5 text-[12px] text-grass-200/85">
          <IconBot size={14} className="text-blood-400" />
          <span className="font-display">{hud.kills}</span>
          <IconGrass size={14} className="ml-1 text-grass-400" />
          <span className="font-display">{hud.grass.toLocaleString("ru-RU")}</span>
          <IconClock size={14} className="ml-1 text-dew-400" />
          <span className="font-display">
            {mm}:{ss}
          </span>
        </div>
      </div>

      {/* ======== обучение в начале ======== */}
      {showHint && (
        <div className="absolute bottom-[26%] left-1/2 w-[92%] max-w-sm -translate-x-1/2 transition-opacity duration-700 sm:bottom-8">
          <div className="hud-chip px-3 py-2.5 text-center text-[12px] leading-relaxed text-grass-200/90">
            {isTouch ? (
              <>
                Веди <b className="text-grass-300">джойстиком слева</b>, буст — кнопка справа.
                <br />
                Коси пшеницу, подбирай <b className="text-sun-300">зелья</b>, охоться на зелёных ботов!
              </>
            ) : (
              <>
                Двигайся <b className="text-grass-300">мышью или WASD</b>, буст — <b className="text-sun-300">Пробел</b>.
                <br />
                Коси пшеницу, подбирай <b className="text-sun-300">зелья</b>, охоться на зелёных ботов!
              </>
            )}
          </div>
        </div>
      )}

      {/* ======== мобильные контролы ======== */}
      {isTouch && <TouchControls engine={engine} />}
    </div>
  );
}

function BuffChip({ color, label, t, icon }: { color: string; label: string; t: number; icon: React.ReactNode }) {
  return (
    <div
      className="hud-chip anim-pop flex items-center gap-1.5 px-2 py-1 text-[11px] font-bold"
      style={{ borderColor: color, color }}
    >
      {icon}
      <span className="font-display">{label}</span>
      <span className="opacity-80">{Math.ceil(t)}с</span>
      <span className="ml-0.5 inline-block h-1 w-8 overflow-hidden rounded-full bg-pit-950 align-middle">
        <span
          className="block h-full rounded-full"
          style={{ width: Math.min(100, (t / 8) * 100) + "%", background: color }}
        />
      </span>
    </div>
  );
}

/* ================= мобильные контролы ================= */

function TouchControls({ engine }: { engine: Engine | null }) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const pidRef = useRef<number | null>(null);
  const originRef = useRef({ x: 0, y: 0 });
  const R = 62;

  useEffect(() => {
    const zone = zoneRef.current;
    const knob = knobRef.current;
    if (!zone || !knob || !engine) return;

    const setKnob = (dx: number, dy: number) => {
      knob.style.transform = `translate(${dx}px, ${dy}px)`;
      knob.style.opacity = "1";
    };
    const reset = () => {
      knob.style.opacity = "0";
      knob.style.transform = "translate(0,0)";
    };

    const down = (e: PointerEvent) => {
      if (pidRef.current !== null) return;
      pidRef.current = e.pointerId;
      zone.setPointerCapture(e.pointerId);
      originRef.current = { x: e.clientX, y: e.clientY };
      knob.style.left = e.clientX + "px";
      knob.style.top = e.clientY + "px";
      setKnob(0, 0);
      engine.setJoy(0, 0, true);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== pidRef.current) return;
      let dx = e.clientX - originRef.current.x;
      let dy = e.clientY - originRef.current.y;
      const d = Math.hypot(dx, dy);
      if (d > R) {
        dx = (dx / d) * R;
        dy = (dy / d) * R;
      }
      setKnob(dx, dy);
      engine.setJoy(dx / R, dy / R, true);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== pidRef.current) return;
      pidRef.current = null;
      reset();
      engine.setJoy(0, 0, false);
    };

    zone.addEventListener("pointerdown", down);
    zone.addEventListener("pointermove", move);
    zone.addEventListener("pointerup", up);
    zone.addEventListener("pointercancel", up);
    return () => {
      zone.removeEventListener("pointerdown", down);
      zone.removeEventListener("pointermove", move);
      zone.removeEventListener("pointerup", up);
      zone.removeEventListener("pointercancel", up);
    };
  }, [engine]);

  return (
    <>
      {/* зона джойстика — левая половина */}
      <div ref={zoneRef} className="pointer-events-auto absolute bottom-0 left-0 top-24 w-1/2 touch-none" />
      <div
        ref={knobRef}
        className="pointer-events-none absolute z-20 -ml-[62px] -mt-[62px] h-[124px] w-[124px] opacity-0 transition-opacity duration-150"
        style={{ left: 0, top: 0 }}
      >
        <div className="absolute inset-0 rounded-full border-2 border-grass-400/50 bg-pit-950/40" />
        <div className="absolute left-1/2 top-1/2 h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-grass-300 bg-grass-500/80 shadow-[0_4px_14px_rgba(0,0,0,0.4)]" />
      </div>

      {/* кнопка буста */}
      <BoostButton engine={engine} />
    </>
  );
}

function BoostButton({ engine }: { engine: Engine | null }) {
  const set = (on: boolean) => (e: React.PointerEvent) => {
    e.preventDefault();
    engine?.setBoost(on);
  };
  return (
    <button
      onPointerDown={set(true)}
      onPointerUp={set(false)}
      onPointerLeave={set(false)}
      onPointerCancel={set(false)}
      className="pointer-events-auto absolute bottom-7 right-5 z-20 grid h-24 w-24 touch-none place-items-center rounded-full border-4 border-sun-600 bg-sun-400/85 font-display text-base uppercase text-pit-950 shadow-[0_6px_0_#8a6206,0_12px_28px_rgba(0,0,0,0.45)] active:translate-y-1 active:shadow-[0_2px_0_#8a6206]"
    >
      Буст
    </button>
  );
}
