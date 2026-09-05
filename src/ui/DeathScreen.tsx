import type { BestRecords } from "../game/meta";
import { fmt, fmtTime } from "../game/meta";
import type { RunSummary } from "../game/engine";
import { IconBot, IconClock, IconDew, IconGrass, IconPlay, IconSkull, IconTrophy } from "./icons";

export interface DeathResult extends RunSummary {
  newBest: Partial<Record<keyof BestRecords, boolean>>;
  best: BestRecords;
}

interface DeathProps {
  result: DeathResult;
  onRetry: () => void;
  onMenu: () => void;
}

export function DeathScreen({ result, onRetry, onMenu }: DeathProps) {
  const r = result;
  const anyBest = Object.values(r.newBest).some(Boolean);

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-pit-950 p-3">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 55% at 50% 115%, #3a130c 0%, rgba(58,19,12,0) 60%), linear-gradient(180deg, #0b1a0d, #071108)",
        }}
      />
      <div className="anim-pop panel relative z-10 w-full max-w-md p-5 sm:p-7">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-blood-600 bg-blood-600/20 text-blood-400">
            <IconSkull size={26} />
          </span>
          <div>
            <h1 className="font-display text-3xl uppercase leading-none text-blood-400 drop-shadow-[0_3px_0_rgba(7,17,8,0.9)] sm:text-4xl">
              Скошен!
            </h1>
            <p className="mt-1 text-[13px] text-grass-200/60">
              Тебя одолел: <b className="text-grass-200">{r.killer}</b>
            </p>
          </div>
        </div>

        {anyBest && (
          <div className="anim-record mt-4 flex items-center justify-center gap-2 rounded-lg border-2 border-sun-500 bg-sun-500/10 py-2">
            <IconTrophy size={18} className="text-sun-400" />
            <span className="font-display text-sm uppercase tracking-widest text-sun-300">Новый рекорд!</span>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Stat label="Очки" value={fmt(r.score)} best={fmt(r.best.score)} isBest={!!r.newBest.score} />
          <Stat label="Уровень" value={String(r.level)} best={String(r.best.level)} isBest={!!r.newBest.level} />
          <Stat label="Ботов скошено" value={fmt(r.kills)} best={fmt(r.best.kills)} isBest={!!r.newBest.kills} />
          <Stat label="Пшеницы" value={fmt(r.grass)} best={fmt(r.best.grass)} isBest={!!r.newBest.grass} />
          <Stat label="Время в живых" value={fmtTime(r.time)} best={fmtTime(r.best.time)} isBest={!!r.newBest.time} />
          <div className="flex items-center gap-3 rounded-lg border-2 border-dew-500/50 bg-dew-500/10 px-3 py-2.5">
            <IconDew size={22} className="shrink-0 text-dew-400" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-dew-300/70">Заработано росы</div>
              <div className="font-display text-xl leading-tight text-dew-300">+{fmt(r.dew)}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button onClick={onRetry} className="btn-blade flex items-center justify-center gap-2 px-6 py-3 text-lg">
            <IconPlay size={18} /> Ещё раз в поле
          </button>
          <button onClick={onMenu} className="btn-bark px-6 py-2.5">В главное меню</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, best, isBest }: { label: string; value: string; best: string; isBest: boolean }) {
  return (
    <div className={`rounded-lg border-2 px-3 py-2.5 ${isBest ? "anim-record border-sun-500 bg-sun-500/10" : "border-pit-600 bg-pit-900"}`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-grass-200/50">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-display text-xl leading-tight ${isBest ? "text-sun-300" : "text-grass-200"}`}>{value}</span>
        {isBest && <IconTrophy size={13} className="text-sun-400" />}
      </div>
      <div className="text-[10px] text-grass-200/40">рекорд: {best}</div>
    </div>
  );
}
