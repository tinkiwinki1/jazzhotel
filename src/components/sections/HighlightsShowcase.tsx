import { useEffect, useRef, useState } from 'react';
import CountUp from '@/components/ui/CountUp';

interface Item {
  metric: string;
  caption: string;
  body: string;
}

interface Props {
  items: Item[];
}

export default function HighlightsShowcase({ items }: Props) {
  const [active, setActive] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inViewRef = useRef(false);

  // Trigger count-up first time the section enters viewport
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

  // Auto-rotate every 6s, pause on hover/focus
  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % items.length);
      setRunKey((k) => k + 1);
    }, 6000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const choose = (i: number) => {
    if (i === active) return;
    setActive(i);
    setRunKey((k) => k + 1);
  };

  const item = items[active];
  const num = String(active + 1).padStart(2, '0');

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="grid lg:grid-cols-[1.4fr_1fr] gap-px bg-line-dark/40 border border-line-dark/40"
    >
      {/* Featured panel */}
      <div className="relative bg-card-dark p-7 md:p-12 lg:p-14 min-h-[360px] md:min-h-[440px] overflow-hidden flex flex-col justify-between">
        {/* Ghost index */}
        <span
          aria-hidden="true"
          className="serif absolute -top-6 -right-2 md:top-2 md:right-6 text-[180px] md:text-[260px] leading-none text-gold/[0.06] select-none pointer-events-none tabular"
        >
          {num}
        </span>

        <div className="relative">
          <div className="eyebrow text-gold-soft mb-4">{item.caption}</div>
          <div
            key={runKey + '-num'}
            className="serif text-6xl md:text-8xl lg:text-[112px] text-gold tabular leading-none"
          >
            <CountUp raw={item.metric} runKey={runKey} />
          </div>
        </div>

        <div className="relative mt-6 md:mt-10 max-w-xl">
          <div className="h-px w-12 bg-gold mb-5"></div>
          <p
            key={runKey + '-body'}
            className="text-sm md:text-base text-ink-mutedDk leading-relaxed animate-fade-in-up"
          >
            {item.body}
          </p>
        </div>

        {/* Progress dots */}
        <div className="relative mt-8 md:mt-10 flex items-center gap-2.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              aria-label={`${i + 1}`}
              className="group/dot p-1.5 -m-1.5"
            >
              <span
                className={`block h-0.5 transition-all ${
                  i === active ? 'w-10 bg-gold' : 'w-5 bg-line-dark group-hover/dot:bg-gold/50'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-px bg-line-dark/40">
        {items.map((it, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              className={`group relative text-left p-5 md:p-6 transition-colors duration-300 overflow-hidden ${
                isActive
                  ? 'bg-gold/10'
                  : 'bg-card-dark hover:bg-card-dark/60'
              }`}
              aria-pressed={isActive}
            >
              {/* Active accent */}
              <span
                className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gold transition-transform origin-top duration-500 ${
                  isActive ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-50'
                }`}
              />
              <div className="flex items-baseline justify-between gap-3">
                <span className="serif text-2xl md:text-3xl text-gold tabular leading-none whitespace-nowrap">
                  {it.metric}
                </span>
                <span className="text-[10px] tracking-[0.2em] text-ink-mutedDk tabular shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div
                className={`mt-3 eyebrow transition-colors ${
                  isActive ? 'text-gold-soft' : 'text-ink-mutedDk group-hover:text-ink-white'
                }`}
              >
                {it.caption}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
