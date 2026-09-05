import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Engine, type GameConfig, type HudData, type RunSummary } from "./game/engine";
import { loadSave, persistSave, SKINS, type SaveData } from "./game/meta";
import { sfx } from "./game/audio";
import { MenuScreen } from "./ui/MenuScreen";
import { DeathScreen, type DeathResult } from "./ui/DeathScreen";
import { HUD } from "./ui/HUD";
import { IconMuted, IconPlay, IconSound } from "./ui/icons";

type Screen = "menu" | "game" | "dead";

export default function App() {
  const [save, setSave] = useState<SaveData>(() => loadSave());
  const [screen, setScreen] = useState<Screen>("menu");
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<DeathResult | null>(null);
  const [cfg, setCfg] = useState<GameConfig | null>(null);

  const saveRef = useRef(save);
  useEffect(() => { saveRef.current = save; }, [save]);

  useEffect(() => { sfx.setMuted(save.muted); }, [save.muted]);

  const isTouch = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
    []
  );

  const updateSave = useCallback((fn: (s: SaveData) => SaveData) => {
    setSave((prev) => {
      const next = fn(prev);
      persistSave(next);
      saveRef.current = next;
      return next;
    });
  }, []);

  const toggleMute = useCallback(() => {
    sfx.ensure();
    updateSave((s) => ({ ...s, muted: !s.muted }));
  }, [updateSave]);

  const play = useCallback((name: string) => {
    const s = saveRef.current;
    const skin = SKINS.find((k) => k.id === s.skin) ?? SKINS[0];
    setCfg({ name, skin, upgrades: s.upgrades });
    setRunId((r) => r + 1);
    setScreen("game");
  }, []);

  const handleDeath = useCallback((s: RunSummary) => {
    const prev = saveRef.current;
    const newBest: DeathResult["newBest"] = {};
    const best = { ...prev.best };
    (["score", "level", "kills", "grass", "time"] as const).forEach((k) => {
      if (s[k] > best[k]) {
        best[k] = s[k];
        newBest[k] = true;
      }
    });
    const next: SaveData = {
      ...prev,
      dew: prev.dew + s.dew,
      best,
      runs: prev.runs + 1,
      totalKills: prev.totalKills + s.kills,
      totalGrass: prev.totalGrass + s.grass,
    };
    persistSave(next);
    saveRef.current = next;
    setSave(next);
    setResult({ ...s, newBest, best });
    setScreen("dead");
  }, []);

  if (screen === "menu") {
    return <MenuScreen save={save} isTouch={isTouch} onPlay={play} onSpend={updateSave} />;
  }

  if (screen === "dead" && result) {
    return (
      <DeathScreen
        result={result}
        onRetry={() => play(saveRef.current.name || "Косарь")}
        onMenu={() => setScreen("menu")}
      />
    );
  }

  if (screen === "game" && cfg) {
    return (
      <GameView
        key={runId}
        cfg={cfg}
        isTouch={isTouch}
        muted={save.muted}
        onToggleMute={toggleMute}
        onDeath={handleDeath}
        onQuit={() => setScreen("menu")}
      />
    );
  }

  return null;
}

/* ================= игровой экран ================= */

interface GameViewProps {
  cfg: GameConfig;
  isTouch: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onDeath: (s: RunSummary) => void;
  onQuit: () => void;
}

function GameView({ cfg, isTouch, muted, onToggleMute, onDeath, onQuit }: GameViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [hud, setHud] = useState<HudData | null>(null);
  const [eng, setEng] = useState<Engine | null>(null);
  const [paused, setPaused] = useState(false);

  const deathRef = useRef(onDeath);
  deathRef.current = onDeath;
  const muteRef = useRef(onToggleMute);
  muteRef.current = onToggleMute;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, cfg, {
      onHud: setHud,
      onDeath: (s) => deathRef.current(s),
    });
    engineRef.current = engine;
    setEng(engine);
    engine.start();

    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === "escape" || k === "p" || k === "з") setPaused((p) => !p);
      if (k === "m" || k === "ь") muteRef.current();
    };
    const onVis = () => {
      if (document.hidden) setPaused(true);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      engine.destroy();
      engineRef.current = null;
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
    };
    // движок создаётся один раз на забег (key=runId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setPaused(paused);
  }, [paused]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-pit-950" onContextMenu={(e) => e.preventDefault()}>
      <canvas ref={canvasRef} className="game-surface absolute inset-0" />
      {hud && (
        <HUD
          hud={hud}
          engine={eng}
          isTouch={isTouch}
          muted={muted}
          onPause={() => setPaused(true)}
          onToggleMute={onToggleMute}
        />
      )}
      {paused && (
        <PauseOverlay
          muted={muted}
          onResume={() => setPaused(false)}
          onToggleMute={onToggleMute}
          onQuit={onQuit}
          isTouch={isTouch}
        />
      )}
    </div>
  );
}

function PauseOverlay({
  muted, onResume, onToggleMute, onQuit, isTouch,
}: {
  muted: boolean;
  onResume: () => void;
  onToggleMute: () => void;
  onQuit: () => void;
  isTouch: boolean;
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-pit-950/78 p-4 backdrop-blur-[2px]">
      <div className="anim-pop panel w-full max-w-sm p-6 text-center">
        <h2 className="font-display text-4xl uppercase text-grass-400 drop-shadow-[0_4px_0_rgba(7,17,8,0.9)]">
          Пауза
        </h2>
        <p className="mt-1 text-[13px] text-grass-200/60">Пшеница подождёт. Боты — вряд ли.</p>

        <div className="mt-5 flex flex-col gap-2.5">
          <button onClick={onResume} className="btn-blade flex items-center justify-center gap-2 px-6 py-3 text-lg">
            <IconPlay size={18} /> Продолжить
          </button>
          <button onClick={onToggleMute} className="btn-bark flex items-center justify-center gap-2 px-6 py-2.5 text-base">
            {muted ? <IconMuted size={17} /> : <IconSound size={17} />}
            Звук: {muted ? "выкл" : "вкл"}
          </button>
          <button onClick={onQuit} className="btn-bark px-6 py-2.5 text-base">
            Сдаться и в меню
          </button>
        </div>

        <div className="mt-4 text-[12px] leading-relaxed text-grass-200/50">
          {isTouch ? (
            <>Джойстик слева · кнопка «Буст» справа</>
          ) : (
            <>
              <span className="kbd">Esc</span> — пауза · <span className="kbd">Пробел</span> — буст ·{" "}
              <span className="kbd">M</span> — звук
            </>
          )}
        </div>
      </div>
    </div>
  );
}
