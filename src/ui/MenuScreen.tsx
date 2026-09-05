import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  SKINS, UPGRADES, upgradeCost, fmt, fmtTime,
  type SaveData, type UpgradeId, type SkinDef,
} from "../game/meta";
import { sfx } from "../game/audio";
import {
  IconBlade, IconBot, IconDew, IconHeart, IconLegs, IconRegen, IconScytheLogo,
  IconSkull, IconSweep, IconTrophy, IconGrass, IconClock, IconMuted, IconSound,
} from "./icons";

type Tab = "start" | "skins" | "shop" | "help";

interface MenuProps {
  save: SaveData;
  isTouch: boolean;
  onPlay: (name: string) => void;
  onSpend: (fn: (s: SaveData) => SaveData) => void;
}

export function MenuScreen({ save, isTouch, onPlay, onSpend }: MenuProps) {
  const [tab, setTab] = useState<Tab>("start");
  const [name, setName] = useState(save.name || "");

  const start = () => {
    sfx.ensure();
    sfx.ui();
    onPlay((name.trim() || "Косарь").slice(0, 16));
  };

  const switchTab = (t: Tab) => {
    sfx.ensure();
    sfx.ui();
    setTab(t);
  };

  const buySkin = (s: SkinDef) => {
    sfx.ensure();
    if (save.unlocked.includes(s.id)) {
      onSpend((st) => ({ ...st, skin: s.id }));
      sfx.ui();
    } else if (save.dew >= s.cost) {
      onSpend((st) => ({ ...st, dew: st.dew - s.cost, unlocked: [...st.unlocked, s.id], skin: s.id }));
      sfx.coin();
    }
  };

  const buyUpgrade = (id: UpgradeId) => {
    sfx.ensure();
    const def = UPGRADES.find((u) => u.id === id)!;
    const lvl = save.upgrades[id];
    if (lvl >= def.max) return;
    const cost = upgradeCost(def, lvl);
    if (save.dew < cost) return;
    onSpend((st) => ({ ...st, dew: st.dew - cost, upgrades: { ...st.upgrades, [id]: lvl + 1 } }));
    sfx.coin();
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-[#140d05]">
      <WheatField />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center px-2.5 py-5 sm:px-3 sm:py-10">
        {/* -------- шапка -------- */}
        <header className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <IconScytheLogo size={34} className="sm:h-10 sm:w-10" />
            <div>
              <h1 className="font-display text-2xl leading-none text-sun-400 drop-shadow-[0_4px_0_rgba(20,12,4,0.9)] sm:text-4xl">
                КОСАРЬ<span className="text-grass-400">.IO</span>
              </h1>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#d8c08a] sm:text-[11px]">
                жатва на пшеничном поле
              </p>
            </div>
          </div>
          <div className="hud-chip flex items-center gap-1.5 border-[#6b4a1f]/70 bg-[#1c1206]/85 px-2.5 py-1 text-sun-300 sm:px-3 sm:py-1.5">
            <IconDew size={14} className="text-dew-400 sm:h-4 sm:w-4" />
            <span className="font-display text-base leading-none sm:text-lg">{fmt(save.dew)}</span>
          </div>
        </header>

        {/* -------- вкладки -------- */}
        <nav className="mt-5 grid w-full max-w-xl grid-cols-4 gap-1.5">
          {(
            [
              ["start", "Начать"],
              ["skins", "Скин"],
              ["shop", "Магазин"],
              ["help", "Подсказки"],
            ] as [Tab, string][]
          ).map(([t, label]) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`tab-btn px-1.5 py-2 text-[10px] sm:px-2 sm:py-2.5 sm:text-sm ${tab === t ? "on" : "off"}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* -------- контент -------- */}
        <main className="mt-4 w-full max-w-3xl">
          {tab === "start" && (
            <section key="start" className="anim-pop panel-earth p-3 sm:p-6">
              <label className="block font-display text-[10px] uppercase tracking-widest text-[#d8c08a] sm:text-xs">
                Имя косаря
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 16))}
                onKeyDown={(e) => e.key === "Enter" && start()}
                placeholder="Косарь"
                className="mt-1.5 w-full rounded-lg border-2 border-[#6b4a1f] bg-[#120c04] px-2.5 py-2 font-display text-base text-[#ffe9c4] outline-none placeholder:text-[#6b5330] focus:border-sun-500 sm:px-3 sm:py-2.5 sm:text-lg"
              />
              <button
                onClick={start}
                className="btn-gold mt-3 flex w-full items-center justify-center gap-2 px-5 py-3 text-base sm:mt-4 sm:px-6 sm:py-4 sm:text-xl"
              >
                <IconGrass size={18} className="sm:h-[22px] sm:w-[22px]" /> В поле!
              </button>

              <div className="mt-3 grid grid-cols-2 gap-1.5 sm:mt-4 sm:gap-2 sm:grid-cols-3">
                <Record label="Рекорд очков" value={fmt(save.best.score)} icon={<IconTrophy size={15} className="text-sun-400" />} />
                <Record label="Уровень" value={String(save.best.level)} icon={<IconBlade size={15} className="text-grass-400" />} />
                <Record label="Ботов скошено" value={fmt(save.best.kills)} icon={<IconSkull size={15} className="text-blood-400" />} />
                <Record label="Пшеницы" value={fmt(save.best.grass)} icon={<IconGrass size={15} className="text-grass-300" />} />
                <Record label="В живых" value={fmtTime(save.best.time)} icon={<IconClock size={15} className="text-dew-400" />} />
                <Record label="Забегов" value={fmt(save.runs)} icon={<IconBot size={15} className="text-[#d8c08a]" />} />
              </div>

              <p className="mt-4 text-center text-[12px] leading-relaxed text-[#c8ab74]">
                Коси пшеницу — качай уровень и радиус косы. Скошенных ботов всасывай вместе с опытом.
                {" "}<button className="font-bold text-sun-300 underline decoration-dotted underline-offset-2" onClick={() => switchTab("help")}>Как играть?</button>
              </p>
            </section>
          )}

          {tab === "skins" && (
            <section key="skins" className="anim-pop panel-earth p-3 sm:p-6">
              <SectionTitle title="Выбор скина" hint="от угля до снега · узоры — за росу" />
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {SKINS.map((s) => {
                  const owned = save.unlocked.includes(s.id);
                  const active = save.skin === s.id;
                  const affordable = save.dew >= s.cost;
                  return (
                    <button
                      key={s.id}
                      onClick={() => buySkin(s)}
                      className={`relative rounded-xl border-2 p-3 text-left transition ${
                        active
                          ? "border-sun-500 bg-[#33220b] shadow-[0_0_0_3px_rgba(240,180,24,0.25)]"
                          : owned
                            ? "border-[#6b4a1f] bg-[#241708] hover:border-sun-600 hover:bg-[#2b1c0a]"
                            : affordable
                              ? "border-[#6b4a1f] bg-[#1c1206] hover:border-dew-400"
                              : "border-[#3a2812] bg-[#160f06] opacity-80"
                      }`}
                    >
                      {active && (
                        <span className="absolute right-2 top-2 rounded bg-sun-500 px-1.5 py-0.5 font-display text-[9px] uppercase text-pit-950">
                          выбран
                        </span>
                      )}
                      <SkinPreview skin={s} />
                      <div className="mt-1.5 font-display text-[12px] leading-tight text-[#ffe9c4] sm:mt-2 sm:text-[13px]">{s.name}</div>
                      <div className="mt-0.5 text-[10px] leading-tight text-[#c8ab74] sm:text-[11px]">{s.desc}</div>
                      <div className="mt-1.5 sm:mt-2">
                        {owned ? (
                          <span className="font-display text-[10px] uppercase text-grass-400 sm:text-[11px]">
                            {active ? "в бою" : "надеть"}
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 font-display text-[11px] sm:text-[12px] ${affordable ? "text-dew-300" : "text-blood-400"}`}>
                            <IconDew size={12} className="sm:h-[13px] sm:w-[13px]" /> {fmt(s.cost)}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {tab === "shop" && (
            <section key="shop" className="anim-pop panel-earth p-3 sm:p-6">
              <SectionTitle title="Кузница косаря" hint="улучшения сохраняются навсегда" />
              <div className="mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2">
                {UPGRADES.map((u) => {
                  const lvl = save.upgrades[u.id];
                  const maxed = lvl >= u.max;
                  const cost = upgradeCost(u, lvl);
                  const affordable = save.dew >= cost;
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-2 rounded-xl border-2 border-[#6b4a1f] bg-[#241708] p-2 sm:gap-3 sm:p-3"
                    >
                      <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border sm:h-10 sm:w-10 ${maxed ? "border-sun-500 bg-[#33220b] text-sun-400" : "border-[#6b4a1f] bg-[#160f06] text-grass-400"}`}>
                        <UpgradeIcon id={u.id} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-[13px] text-[#ffe9c4] sm:text-sm">{u.name}</span>
                          <span className="font-display text-[9px] uppercase text-[#c8ab74] sm:text-[10px]">
                            ур. {lvl}/{u.max}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#c8ab74] sm:text-[11px]">{u.desc}</div>
                        <div className="mt-1 flex gap-1">
                          {Array.from({ length: u.max }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-1 flex-1 rounded-full sm:h-1.5 ${i < lvl ? "bg-gradient-to-r from-sun-600 to-sun-400" : "bg-[#3a2812]"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => buyUpgrade(u.id)}
                        disabled={maxed || !affordable}
                        className={`shrink-0 rounded-lg border-2 px-2 py-1.5 font-display text-[12px] uppercase tracking-wide transition sm:px-3 sm:py-2 sm:text-sm ${
                          maxed
                            ? "cursor-default border-[#6b4a1f] bg-[#241708] text-[#c8ab74]"
                            : affordable
                              ? "btn-gold"
                              : "cursor-not-allowed border-blood-600/60 bg-blood-600/15 text-blood-400"
                        }`}
                      >
                        {maxed ? (
                          "Макс"
                        ) : (
                          <span className="flex items-center gap-1">
                            <IconDew size={12} className="sm:h-[14px] sm:w-[14px]" /> {fmt(cost)}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {tab === "help" && (
            <section key="help" className="anim-pop panel-earth p-3 sm:p-6">
              <SectionTitle title="Подсказки косарю" hint="прочитал — уже сильнее половины поля" />
              <div className="help-shrink mt-2.5 grid gap-2 sm:mt-3 sm:gap-2.5 md:grid-cols-2">
                <HelpCard title="Управление — компьютер">
                  <HelpRow k="Мышь" v="двигаться к курсору" />
                  <HelpRow k="W A S D" v="двигаться (работает и ЦФЫВ)" />
                  <HelpRow k="ЛКМ (удерживать)" v="спринт +75%, пока есть выносливость" />
                  <HelpRow k="Esc" v="пауза" />
                  <HelpRow k="M" v="звук вкл / выкл" />
                </HelpCard>
                <HelpCard title="Управление — телефон">
                  <HelpRow k="Палец слева" v="появится джойстик — веди им" />
                  <HelpRow k="Удержать справа" v="спринт +75%, пока есть выносливость" />
                  <HelpRow k="Пауза" v="кнопка сверху справа" />
                </HelpCard>
                <HelpCard title="Как косить и качаться">
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-grass-400" />
                    Коса крутится сама — просто веди героя по пшенице. Срезанные колосья дают
                    опыт и очки, а жёлтые светлячки сами летят к тебе.
                  </li>
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sun-400" />
                    Быстрая жатва без пауз разгоняет комбо — множитель опыта до ×3.
                  </li>
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-dew-400" />
                    Каждый уровень делает героя крупнее, бьёт больнее и заметно шире размахивает
                    косой. Срезанная пшеница отрастает через несколько секунд.
                  </li>
                </HelpCard>
                <HelpCard title="Боты и бой">
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-grass-400" />
                    На поле больше 100 косарей по всей карте. Зелёное имя — бот слабее тебя,
                    красное — опаснее. Точка рядом с именем показывает его тактику.
                  </li>
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blood-400" />
                    Удар косой отбрасывает и ранит. Скошенный бот отдаёт весь свой опыт —
                    охоться на зелёных и беги от красных.
                  </li>
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sun-400" />
                    За забег капает роса — валюта для скинов и улучшений в магазине.
                  </li>
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blood-400" />
                    Боты хитры: охотятся стаей, добивают раненых, отступают лечиться и охотятся за зельями.
                  </li>
                </HelpCard>
                <HelpCard title="Случайные зелья">
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blood-400" />
                    <span><b className="text-blood-400">Зелье силы</b> — урон ×1.4 на 8 секунд.</span>
                  </li>
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-dew-400" />
                    <span><b className="text-dew-400">Зелье ветра</b> — скорость ×1.5 на 8 секунд.</span>
                  </li>
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-grass-400" />
                    <span><b className="text-grass-400">Зелье здоровья</b> — сразу +45% сил.</span>
                  </li>
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: "#c58cff" }} />
                    <span><b style={{ color: "#c58cff" }}>Зелье роста</b> — мгновенно +1 уровень (редкое!).</span>
                  </li>
                  <li className="flex gap-2 text-[13px] leading-relaxed text-[#e8d9b8]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sun-400" />
                    Зелья светятся на поле — и боты тоже за ними охотятся, успевай первым!
                  </li>
                </HelpCard>
              </div>

              <div className="mt-3 rounded-xl border-2 border-[#6b4a1f] bg-[#241708] p-3">
                <div className="font-display text-xs uppercase tracking-widest text-[#d8c08a]">
                  Зоны пшеничного поля
                </div>
                <div className="mt-2 grid gap-x-4 gap-y-1.5 text-[12px] leading-snug text-[#e8d9b8] sm:grid-cols-2">
                  <ZoneRow color="#9a7038" name="Спелое поле" note="центр — безопасный старт, опыта меньше" />
                  <ZoneRow color="#8a6134" name="Пшеничное поле" note="основная карта, колосья средней высоты" />
                  <ZoneRow color="#d9a83f" name="Высокая рожь" note="густые заросли на севере — прячься и фарми" />
                  <ZoneRow color="#ff5040" name="Маковое поле" note="восток: цветы дают ×1.7 опыта" />
                  <ZoneRow color="#7a5527" name="Сухое поле" note="юг: колючки царапают, опыта больше" />
                  <ZoneRow color="#47663a" name="Гнилые топи" note="запад: вязко, скорость −28%" />
                  <ZoneRow color="#dcebf0" name="Мерзлота" note="северо-запад: скользко и богато" />
                  <ZoneRow color="#d3ac5c" name="Сухие пески" note="северо-восток: кактусы и много опыта" />
                  <ZoneRow color="#ff8c3d" name="Пепелища" note="юго-восток: жгут до 12 уровня, опыта ×6" />
                </div>
              </div>
            </section>
          )}
        </main>

        <footer className="mt-3 pb-2 text-center text-[10px] text-[#8a6f42] sm:mt-4 sm:text-[11px]">
          Сделано для жатвы · рекорды хранятся в этом браузере
        </footer>
      </div>

      {/* -------- бегущая строка рекордов -------- */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 overflow-hidden border-t-2 border-[#6b4a1f] bg-[#160f06]/90 py-1.5">
        <div className="ticker-track">
          {[0, 1].map((k) => (
            <span key={k} className="px-6 font-display text-[11px] uppercase tracking-widest text-[#c8ab74]">
              рекорд очков: <span className="text-sun-400">{fmt(save.best.score)}</span>
              <span className="mx-4 text-[#6b5330]">///</span>
              уровень: <span className="text-grass-400">{save.best.level}</span>
              <span className="mx-4 text-[#6b5330]">///</span>
              ботов скошено: <span className="text-blood-400">{fmt(save.best.kills)}</span>
              <span className="mx-4 text-[#6b5330]">///</span>
              пшеницы: <span className="text-grass-300">{fmt(save.best.grass)}</span>
              <span className="mx-4 text-[#6b5330]">///</span>
              всего забегов: <span className="text-dew-300">{fmt(save.runs)}</span>
              <span className="mx-4 text-[#6b5330]">///</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= вспомогательные ================= */

function SectionTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-1.5 sm:gap-2">
      <h2 className="font-display text-base uppercase tracking-wide text-sun-400 drop-shadow-[0_3px_0_rgba(20,12,4,0.9)] sm:text-2xl">
        {title}
      </h2>
      <span className="text-[9px] font-bold uppercase tracking-wider text-[#8a6f42] sm:text-[11px]">{hint}</span>
    </div>
  );
}

function Record({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#4a3315] bg-[#160f06] px-2 py-1.5 sm:gap-2.5 sm:px-2.5 sm:py-2">
      {icon}
      <div className="min-w-0">
        <div className="truncate text-[8px] font-bold uppercase tracking-wider text-[#8a6f42] sm:text-[10px]">{label}</div>
        <div className="font-display text-sm leading-tight text-[#ffe9c4] sm:text-base">{value}</div>
      </div>
    </div>
  );
}

function HelpCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-[#6b4a1f] bg-[#241708] p-2.5 sm:p-3">
      <div className="font-display text-[10px] uppercase tracking-widest text-[#d8c08a] sm:text-xs">{title}</div>
      <ul className="mt-1.5 space-y-1.5 sm:mt-2 sm:space-y-2">{children}</ul>
    </div>
  );
}

function HelpRow({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-center gap-2 text-[12px] text-[#e8d9b8] sm:text-[13px]">
      <span className="kbd shrink-0">{k}</span>
      <span className="leading-snug">{v}</span>
    </li>
  );
}

function ZoneRow({ color, name, note }: { color: string; name: string; note: string }) {
  return (
    <div className="zone-note flex items-start gap-2">
      <span className="mt-1 h-3 w-3 shrink-0 rounded-sm border border-black/40" style={{ background: color }} />
      <span>
        <b className="text-[#ffe9c4]">{name}</b>
        <span className="text-[#c8ab74]"> — {note}</span>
      </span>
    </div>
  );
}

function UpgradeIcon({ id }: { id: UpgradeId }) {
  switch (id) {
    case "blade": return <IconBlade size={19} />;
    case "sweep": return <IconSweep size={19} />;
    case "legs": return <IconLegs size={19} />;
    case "vitality": return <IconHeart size={19} />;
    case "regen": return <IconRegen size={19} />;
  }
}

function SkinPreview({ skin }: { skin: SkinDef }) {
  const pid = "pat-" + skin.id;
  let fill = skin.body;
  let defs: ReactNode = null;
  switch (skin.pattern) {
    case "stripes":
      fill = `url(#${pid})`;
      defs = (
        <pattern id={pid} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="9" height="9" fill={skin.body} />
          <rect width="4" height="9" fill={skin.ink} />
        </pattern>
      );
      break;
    case "dots":
      fill = `url(#${pid})`;
      defs = (
        <pattern id={pid} width="11" height="11" patternUnits="userSpaceOnUse">
          <rect width="11" height="11" fill={skin.body} />
          <circle cx="3" cy="3" r="2.2" fill={skin.ink} />
          <circle cx="8.5" cy="8.5" r="2.2" fill={skin.ink} />
        </pattern>
      );
      break;
    case "checker":
      fill = `url(#${pid})`;
      defs = (
        <pattern id={pid} width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={skin.body} />
          <rect width="6" height="6" fill={skin.ink} />
          <rect x="6" y="6" width="6" height="6" fill={skin.ink} />
        </pattern>
      );
      break;
    case "zigzag":
      fill = `url(#${pid})`;
      defs = (
        <pattern id={pid} width="14" height="10" patternUnits="userSpaceOnUse">
          <rect width="14" height="10" fill={skin.body} />
          <path d="M0 5 3.5 1 7 5 10.5 9 14 5" stroke={skin.ink} strokeWidth="2.6" fill="none" />
        </pattern>
      );
      break;
  }
  return (
    <div className="relative mx-auto h-16 w-16">
      <svg viewBox="0 0 72 72" className="h-full w-full">
        <defs>{defs}</defs>
        {/* одна коса */}
        <rect x="33.5" y="4" width="5" height="64" rx="2.5" fill="#6b4a1f" transform="rotate(45 36 36)" />
        {/* лезвие */}
        <rect x="52" y="30" width="17" height="9" rx="4.5" fill={skin.blade} stroke={skin.bladeRim} strokeWidth="1.5" />
        {/* тело с узором */}
        <circle cx="36" cy="36" r="24" fill={fill} stroke={skin.rim} strokeWidth="3" />
        {skin.pattern === "rings" && (
          <g fill="none" stroke={skin.ink} strokeWidth="3.2">
            <circle cx="36" cy="36" r="8" />
            <circle cx="36" cy="36" r="15.5" />
            <circle cx="36" cy="36" r="2.6" fill={skin.ink} stroke="none" />
          </g>
        )}
        {skin.pattern === "patches" && (
          <g fill={skin.ink}>
            <circle cx="27" cy="27" r="7" />
            <circle cx="46" cy="31" r="5.5" />
            <circle cx="33" cy="47" r="6.5" />
          </g>
        )}
        {/* блик */}
        <path d="M22 26a17 17 0 0 1 10-8" stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinecap="round" fill="none" />
      </svg>
      {skin.pattern !== "none" && (
        <span className="absolute -top-1 left-1/2 -translate-x-1/2 rounded bg-pit-800 px-1.5 py-px font-display text-[8px] uppercase tracking-wider text-sun-300 border border-[#6b4a1f]">
          узор
        </span>
      )}
    </div>
  );
}

/* ================= живой пшеничный фон ================= */

function WheatField() {
  const back = useMemo(() => stalks(26, 0.55, 90, 150), []);
  const front = useMemo(() => stalks(18, 1, 130, 210), []);
  const motes = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: (i * 7.3 + 3) % 100,
        delay: (i * 0.9) % 8,
        dur: 7 + (i % 5),
        size: 2 + (i % 3),
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* небо заката */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 118%, #5a3a14 0%, rgba(90,58,20,0) 60%), linear-gradient(180deg, #1c1206 0%, #140d05 55%, #0e0a04 100%)",
        }}
      />
      <div className="sun-glow absolute left-1/2 top-[16%] h-64 w-64 -translate-x-1/2 rounded-full bg-sun-500/25 blur-3xl" />

      {/* золотая пыль */}
      {motes.map((m, i) => (
        <span
          key={i}
          className="mote absolute bottom-[18%] rounded-full bg-sun-300"
          style={{
            left: m.left + "%",
            width: m.size,
            height: m.size,
            animationDuration: m.dur + "s",
            animationDelay: m.delay + "s",
            boxShadow: "0 0 8px 2px rgba(255,210,63,0.35)",
          }}
        />
      ))}

      {/* дальний ряд колосьев */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around opacity-60">
        {back.map((s, i) => (
          <Stalk key={i} {...s} dim />
        ))}
      </div>
      {/* ближний ряд */}
      <div className="absolute -bottom-1 left-0 right-0 flex items-end justify-around">
        {front.map((s, i) => (
          <Stalk key={i} {...s} />
        ))}
      </div>
    </div>
  );
}

interface StalkSpec {
  h: number;
  delay: number;
  dur: number;
  lean: number;
  grains: number;
}

function stalks(n: number, scale: number, hMin: number, hMax: number): StalkSpec[] {
  return Array.from({ length: n }, (_, i) => ({
    h: (hMin + ((i * 37) % (hMax - hMin))) * scale,
    delay: (i % 7) * 0.4,
    dur: 2.6 + (i % 5) * 0.35,
    lean: ((i % 5) - 2) * 3,
    grains: 4 + (i % 3),
  }));
}

function Stalk({ h, delay, dur, lean, grains, dim }: StalkSpec & { dim?: boolean }) {
  const stem = dim ? "#7a5c26" : "#b98c33";
  const head = dim ? "#9c7a2e" : "#e6b74f";
  return (
    <svg
      className="wheat-stalk shrink-0"
      width={26}
      height={h}
      viewBox={`0 0 26 ${h}`}
      style={{ animationDelay: delay + "s", animationDuration: dur + "s" }}
    >
      <path d={`M13 ${h} Q ${13 + lean} ${h * 0.55} ${13 + lean * 1.6} ${h * 0.18}`} stroke={stem} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      {Array.from({ length: grains }, (_, k) => {
        const t = k / grains;
        const y = h * 0.18 - k * 7;
        const x = 13 + lean * 1.6;
        if (y < 6) return null;
        return (
          <g key={k}>
            <ellipse cx={x - 4.5} cy={y + t * 4} rx={3.4} ry={6} fill={head} transform={`rotate(-24 ${x - 4.5} ${y})`} />
            <ellipse cx={x + 4.5} cy={y + t * 4} rx={3.4} ry={6} fill={head} transform={`rotate(24 ${x + 4.5} ${y})`} />
          </g>
        );
      })}
    </svg>
  );
}
