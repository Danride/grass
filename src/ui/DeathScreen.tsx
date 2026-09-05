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
      <div className="anim-pop panel relative z-10 w-full max-w-md p-4 sm:p-7">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-blood-600 bg-blood-600/20 text-blood-400 sm:h-12 sm:w-12">
            <IconSkull size={22} className="sm:h-[26px] sm:w-[26px]" />
          </span>
          <div>
            <h1 className="font-display text-2xl uppercase leading-none text-blood-400 drop-shadow-[0_3px_0_rgba(7,17,8,0.9)] sm:text-4xl">
              Скошен!
            </h1>
            <p className="mt-1 text-[12px] text-grass-200/60 sm:text-[13px]">
              Тебя одолел: <b className="text-grass-200">{r.killer}</b>
            </p>
          </div>
        </div>

        {anyBest && (
          <div className="anim-record mt-3 flex items-center justify-center gap-2 rounded-lg border-2 border-sun-500 bg-sun-500/10 py-1.5 sm:mt-4 sm:py-2">
            <IconTrophy size={16} className="text-sun-400 sm:h-[18px] sm:w-[18px]" />
            <span className="font-display text-[12px] uppercase tracking-widest text-sun-300 sm:text-sm">Новый рекорд!</span>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-1.5 sm:mt-4 sm:gap-2">
          <Stat label="Очки" value={fmt(r.score)} best={fmt(r.best.score)} isBest={!!r.newBest.score} />
          <Stat label="Уровень" value={String(r.level)} best={String(r.best.level)} isBest={!!r.newBest.level} />
          <Stat label="Ботов скошено" value={fmt(r.kills)} best={fmt(r.best.kills)} isBest={!!r.newBest.kills} />
          <Stat label="Пшеницы" value={fmt(r.grass)} best={fmt(r.best.grass)} isBest={!!r.newBest.grass} />
          <Stat label="Время в живых" value={fmtTime(r.time)} best={fmtTime(r.best.time)} isBest={!!r.newBest.time} />
          <div className="flex items-center gap-2 rounded-lg border-2 border-dew-500/50 bg-dew-500/10 px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5">
            <IconDew size={18} className="shrink-0 text-dew-400 sm:h-[22px] sm:w-[22px]" />
            <div>
              <div className="text-[8px] font-bold uppercase tracking-wider text-dew-300/70 sm:text-[10px]">Заработано росы</div>
              <div className="font-display text-base leading-tight text-dew-300 sm:text-xl">+{fmt(r.dew)}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1.5 sm:mt-5 sm:gap-2">
          <button onClick={onRetry} className="btn-blade flex items-center justify-center gap-2 px-5 py-2.5 text-base sm:px-6 sm:py-3 sm:text-lg">
            <IconPlay size={16} className="sm:h-[18px] sm:w-[18px]" /> Ещё раз в поле
          </button>
          <button onClick={onMenu} className="btn-bark px-5 py-2 text-sm sm:px-6 sm:py-2.5 sm:text-base">В главное меню</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, best, isBest }: { label: string; value: string; best: string; isBest: boolean }) {
  return (
    <div className={`rounded-lg border-2 px-2.5 py-2 sm:px-3 sm:py-2.5 ${isBest ? "anim-record border-sun-500 bg-sun-500/10" : "border-pit-600 bg-pit-900"}`}>
      <div className="text-[8px] font-bold uppercase tracking-wider text-grass-200/50 sm:text-[10px]">{label}</div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-display text-base leading-tight sm:text-xl ${isBest ? "text-sun-300" : "text-grass-200"}`}>{value}</span>
        {isBest && <IconTrophy size={12} className="text-sun-400 sm:h-[13px] sm:w-[13px]" />}
      </div>
      <div className="text-[8px] text-grass-200/40 sm:text-[10px]">рекорд: {best}</div>
    </div>
  );
}
