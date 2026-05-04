import { useEffect, useRef, useState } from 'react';
import CountUp from '@/components/ui/CountUp';

interface Labels {
  revenue: string;
  profit: string;
  margin: string;
  unit: string;
  vs: string;
  yoyLabel: string;
  twoYearLabel: string;
}

interface YearData {
  year: string;
  revenue: number; // USD '000
  profit: number; // USD '000
  margin: number; // percent
}

interface Props {
  labels: Labels;
  locale: 'ru' | 'en';
}

const YEARS: YearData[] = [
  { year: '2023', revenue: 480, profit: 198, margin: 41 },
  { year: '2024', revenue: 649, profit: 285, margin: 44 },
  { year: '2025', revenue: 805, profit: 444, margin: 55 },
];

function pct(curr: number, prev: number): number {
  return Math.round((curr / prev - 1) * 100);
}

function fmtSigned(n: number, suffix: string): string {
  return `${n > 0 ? '+' : ''}${n}${suffix}`;
}

export default function FinancialsHero({ labels }: Props) {
  const [active, setActive] = useState(YEARS.length - 1); // default 2025
  const [runKey, setRunKey] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inViewRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !inViewRef.current) {
            inViewRef.current = true;
            setRunKey((k) => k + 1);
          }
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const choose = (i: number) => {
    if (i === active) return;
    setActive(i);
    setRunKey((k) => k + 1);
  };

  const cur = YEARS[active];
  const prevYear = active > 0 ? YEARS[active - 1] : null;
  const firstYear = YEARS[0];
  const ppSuffix = labels.yoyLabel === 'YoY' ? ' pp' : ' пп';

  const revYoy = prevYear ? pct(cur.revenue, prevYear.revenue) : null;
  const profYoy = prevYear ? pct(cur.profit, prevYear.profit) : null;
  const marYoy = prevYear ? cur.margin - prevYear.margin : null;

  const showTwoY = active >= 2;
  const revTwoY = showTwoY ? pct(cur.revenue, firstYear.revenue) : null;
  const profTwoY = showTwoY ? pct(cur.profit, firstYear.profit) : null;
  const marTwoY = showTwoY ? cur.margin - firstYear.margin : null;

  return (
    <div ref={containerRef}>
      {/* Year tabs */}
      <div className="flex items-end justify-end flex-wrap gap-4 mb-7">
        <div className="flex border-b border-line-dim/60" role="tablist">
          {YEARS.map((y, i) => {
            const isActive = i === active;
            return (
              <button
                key={y.year}
                role="tab"
                aria-selected={isActive}
                onClick={() => choose(i)}
                className={`relative px-5 md:px-7 py-3 text-sm md:text-base tabular tracking-wider transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-mutedLt hover:text-ink'
                }`}
              >
                {y.year}
                <span
                  className={`absolute bottom-[-1px] left-2 right-2 h-[2px] bg-gold transition-transform origin-left ${
                    isActive ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 hero cards */}
      <div className="grid md:grid-cols-3 gap-px bg-line-dim/40 border border-line-dim/40">
        <Card
          label={labels.revenue}
          unit={labels.unit}
          value={`$${cur.revenue}K`}
          runKey={runKey}
          deltaYoy={revYoy !== null ? fmtSigned(revYoy, '%') : null}
          deltaTwoY={revTwoY !== null ? fmtSigned(revTwoY, '%') : null}
          activeYear={active}
          deltaPrevYear={prevYear?.year}
          deltaFirstYear={firstYear.year}
          labels={labels}
        />
        <Card
          label={labels.profit}
          unit={labels.unit}
          value={`$${cur.profit}K`}
          runKey={runKey}
          deltaYoy={profYoy !== null ? fmtSigned(profYoy, '%') : null}
          deltaTwoY={profTwoY !== null ? fmtSigned(profTwoY, '%') : null}
          activeYear={active}
          deltaPrevYear={prevYear?.year}
          deltaFirstYear={firstYear.year}
          labels={labels}
          highlight
        />
        <Card
          label={labels.margin}
          unit={null}
          value={`${cur.margin}%`}
          runKey={runKey}
          deltaYoy={marYoy !== null ? fmtSigned(marYoy, ppSuffix) : null}
          deltaTwoY={marTwoY !== null ? fmtSigned(marTwoY, ppSuffix) : null}
          activeYear={active}
          deltaPrevYear={prevYear?.year}
          deltaFirstYear={firstYear.year}
          labels={labels}
        />
      </div>
    </div>
  );
}

interface CardProps {
  label: string;
  unit: string | null;
  value: string;
  runKey: number;
  deltaYoy: string | null;
  deltaTwoY: string | null;
  activeYear: number;
  deltaPrevYear?: string;
  deltaFirstYear?: string;
  labels: Labels;
  highlight?: boolean;
}

function Card({
  label,
  unit,
  value,
  runKey,
  deltaYoy,
  deltaTwoY,
  activeYear,
  deltaPrevYear,
  deltaFirstYear,
  labels,
  highlight,
}: CardProps) {
  return (
    <div
      className={`relative p-7 md:p-9 ${
        highlight ? 'bg-tan-card/60' : 'bg-bg-light'
      } overflow-hidden`}
    >
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gold"></div>

      <div className="flex items-baseline justify-between gap-3 mb-5">
        <div className="eyebrow text-gold-deep">{label}</div>
        {unit && <div className="text-[10px] tracking-[0.15em] uppercase text-ink-mutedLt">{unit}</div>}
      </div>

      <div
        key={runKey + '-num'}
        className="serif text-5xl md:text-6xl lg:text-7xl text-ink tabular leading-none"
      >
        <CountUp raw={value} runKey={runKey} />
      </div>

      <div className="mt-7 flex flex-col gap-2.5">
        <DeltaRow value={deltaYoy} label={`${labels.yoyLabel}${deltaPrevYear ? ` · ${labels.vs} ${deltaPrevYear}` : ''}`} runKey={runKey} key={runKey + '-yoy'} />
        <DeltaRow value={deltaTwoY} label={`${labels.twoYearLabel}${deltaFirstYear ? ` · ${labels.vs} ${deltaFirstYear}` : ''}`} runKey={runKey} key={runKey + '-2y'} />
      </div>

      {/* Year position dots */}
      <div className="mt-6 flex items-center gap-1.5">
        {YEARS.map((y, i) => (
          <span
            key={y.year}
            className={`block transition-all ${
              i === activeYear ? 'h-1.5 w-8 bg-gold' : 'h-1.5 w-3 bg-line-dim'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

function DeltaRow({ value, label, runKey }: { value: string | null; label: string; runKey: number }) {
  if (!value) {
    return (
      <div className="grid grid-cols-[80px_1fr] items-baseline gap-3 opacity-30">
        <span className="serif text-base text-ink tabular">—</span>
        <span className="text-[11px] tracking-[0.15em] uppercase text-ink-mutedLt">{label}</span>
      </div>
    );
  }
  const positive = value.startsWith('+');
  return (
    <div className="grid grid-cols-[80px_1fr] items-baseline gap-3">
      <span
        className={`serif text-lg md:text-xl tabular ${positive ? 'text-gold-deep' : 'text-ink'}`}
      >
        <CountUp raw={value} runKey={runKey} />
      </span>
      <span className="text-[11px] tracking-[0.15em] uppercase text-ink-mutedLt">{label}</span>
    </div>
  );
}
