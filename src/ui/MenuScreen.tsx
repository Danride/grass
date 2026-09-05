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

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-5xl flex-col items-center px-3 py-6 sm:py-10">
        {/* -------- шапка -------- */}
        <header className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconScytheLogo size={40} />
            <div>
              <h1 className="font-display text-3xl leading-none text-sun-400 drop-shadow-[0_4px_0_rgba(20,12,4,0.9)] sm:text-4xl">
                КОСАРЬ<span className="text-grass-400">.IO</span>
              </h1>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-[#d8c08a]">
                жатва на пшеничном поле
              </p>
            </div>
          </div>
          <div className="hud-chip flex items-center gap-1.5 border-[#6b4a1f]/70 bg-[#1c1206]/85 px-3 py-1.5 text-sun-300">
            <IconDew size={16} className="text-dew-400" />
            <span className="font-display text-lg leading-none">{fmt(save.dew)}</span>
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
              className={`tab-btn px-2 py-2.5 text-[11px] sm:text-sm ${tab === t ? "on" : "off"}`}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* -------- контент -------- */}
        <main className="mt-4 w-full max-w-3xl">
          {tab === "start" && (
            <section key="start" className="anim-pop panel-earth p-4 sm:p-6">
              <label className="block font-display text-xs uppercase tracking-widest text-[#d8c08a]">
                Имя косаря
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 16))}
                onKeyDown={(e) => e.key === "Enter" && start()}
                placeholder="Косарь"
                className="mt-1.5 w-full rounded-lg border-2 border-[#6b4a1f] bg-[#120c04] px-3 py-2.5 font-display text-lg text-[#ffe9c4] outline-none placeholder:text-[#6b5330] focus:border-sun-500"
              />
              <button
                onClick={start}
                className="btn-gold mt-4 flex w-full items-center justify-center gap-2.5 px-6 py-4 text-xl"
              >
                <IconGrass size={22} /> В поле!
              </button>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
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
            <section key="skins" className="anim-pop panel-earth p-4 sm:p-6">
              <SectionTitle title="Выбор скина" hint="роса копится за каждый забег" />
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
                      <div className="mt-2 font-display text-[13px] leading-tight text-[#ffe9c4]">{s.name}</div>
                      <div className="mt-0.5 text-[11px] leading-tight text-[#c8ab74]">{s.desc}</div>
                      <div className="mt-2">
                        {owned ? (
                          <span className="font-display text-[11px] uppercase text-grass-400">
                            {active ? "в бою" : "надеть"}
                          </span>
                        ) : (
                          <span className={`flex items-center gap-1 font-display text-[12px] ${affordable ? "text-dew-300" : "text-blood-400"}`}>
                            <IconDew size={13} /> {fmt(s.cost)}
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
            <section key="shop" className="anim-pop panel-earth p-4 sm:p-6">
              <SectionTitle title="Кузница косаря" hint="улучшения сохраняются навсегда" />
              <div className="mt-3 space-y-2">
                {UPGRADES.map((u) => {
                  const lvl = save.upgrades[u.id];
                  const maxed = lvl >= u.max;
                  const cost = upgradeCost(u, lvl);
                  const affordable = save.dew >= cost;
                  return (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 rounded-xl border-2 border-[#6b4a1f] bg-[#241708] p-2.5 sm:p-3"
                    >
                      <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border ${maxed ? "border-sun-500 bg-[#33220b] text-sun-400" : "border-[#6b4a1f] bg-[#160f06] text-grass-400"}`}>
                        <UpgradeIcon id={u.id} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-sm text-[#ffe9c4]">{u.name}</span>
                          <span className="font-display text-[10px] uppercase text-[#c8ab74]">
                            ур. {lvl}/{u.max}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#c8ab74]">{u.desc}</div>
                        <div className="mt-1 flex gap-1">
                          {Array.from({ length: u.max }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-1.5 flex-1 rounded-full ${i < lvl ? "bg-gradient-to-r from-sun-600 to-sun-400" : "bg-[#3a2812]"}`}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => buyUpgrade(u.id)}
                        disabled={maxed || !affordable}
                        className={`shrink-0 rounded-lg border-2 px-3 py-2 font-display text-sm uppercase tracking-wide transition ${
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
                            <IconDew size={14} /> {fmt(cost)}
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
            <section key="help" className="anim-pop panel-earth p-4 sm:p-6">
              <SectionTitle title="Подсказки косарю" hint="прочитал — уже сильнее половины поля" />
              <div className="mt-3 grid gap-2.5 md:grid-cols-2">
                <HelpCard title="Управление — компьютер">
                  <HelpRow k="Мышь" v="двигаться к курсору" />
                  <HelpRow k="W A S D" v="двигаться (работает и ЦФЫВ)" />
                  <HelpRow k="Пробел" v="ускорение (тратит жёлтую шкалу)" />
                  <HelpRow k="Esc" v="пауза" />
                  <HelpRow k="M" v="звук вкл / выкл" />
                </HelpCard>
                <HelpCard title="Управление — телефон">
                  <HelpRow k="Палец слева" v="появится джойстик — веди им" />
                  <HelpRow k="Кнопка «Буст»" v="ускорение справа внизу" />
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
                    На поле больше 100 косарей. Зелёная метка на миникарте — слабее тебя,
                    красная — опаснее.
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
                    Зелья видны на миникарте цветными точками — и боты тоже их подбирают, успевай первым!
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

        <footer className="mt-4 pb-2 text-center text-[11px] text-[#8a6f42]">
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
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="font-display text-xl uppercase tracking-wide text-sun-400 drop-shadow-[0_3px_0_rgba(20,12,4,0.9)] sm:text-2xl">
        {title}
      </h2>
      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8a6f42]">{hint}</span>
    </div>
  );
}

function Record({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-[#4a3315] bg-[#160f06] px-2.5 py-2">
      {icon}
      <div className="min-w-0">
        <div className="truncate text-[10px] font-bold uppercase tracking-wider text-[#8a6f42]">{label}</div>
        <div className="font-display text-base leading-tight text-[#ffe9c4]">{value}</div>
      </div>
    </div>
  );
}

function HelpCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-[#6b4a1f] bg-[#241708] p-3">
      <div className="font-display text-xs uppercase tracking-widest text-[#d8c08a]">{title}</div>
      <ul className="mt-2 space-y-2">{children}</ul>
    </div>
  );
}

function HelpRow({ k, v }: { k: string; v: string }) {
  return (
    <li className="flex items-center gap-2 text-[13px] text-[#e8d9b8]">
      <span className="kbd shrink-0">{k}</span>
      <span className="leading-snug">{v}</span>
    </li>
  );
}

function ZoneRow({ color, name, note }: { color: string; name: string; note: string }) {
  return (
    <div className="flex items-start gap-2">
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
  return (
    <div className="relative mx-auto h-16 w-16">
      <div
        className="absolute inset-0 rounded-full border-[3px]"
        style={{ background: skin.body, borderColor: skin.rim }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[120%] w-[7px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded"
        style={{ background: "#6b4a1f" }}
      />
      <div
        className="absolute left-1/2 top-1/2 h-[120%] w-[7px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded"
        style={{ background: "#6b4a1f" }}
      />
      <div
        className="absolute -right-1 top-1/2 h-4 w-9 -translate-y-1/2 rounded-full border"
        style={{ background: skin.blade, borderColor: skin.bladeRim }}
      />
      <div className="absolute left-[30%] top-[34%] h-2.5 w-2.5 rounded-full bg-white">
        <div className="absolute right-0 top-0.5 h-1.5 w-1.5 rounded-full bg-[#10240f]" />
      </div>
      <div className="absolute left-[58%] top-[34%] h-2.5 w-2.5 rounded-full bg-white">
        <div className="absolute right-0 top-0.5 h-1.5 w-1.5 rounded-full bg-[#10240f]" />
      </div>
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
