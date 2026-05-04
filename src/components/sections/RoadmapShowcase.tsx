import { useEffect, useRef, useState } from 'react';

interface Item {
  letter: string;
  title: string;
  body: string;
  metric: string;
}

interface Props {
  items: Item[];
}

export default function RoadmapShowcase({ items }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
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

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % items.length);
      setRunKey((k) => k + 1);
    }, 6500);
    return () => clearInterval(id);
  }, [paused, items.length]);

  const choose = (i: number) => {
    if (i === active) return;
    setActive(i);
    setRunKey((k) => k + 1);
  };

  const item = items[active];

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
      <div className="relative bg-card-dark p-7 md:p-12 lg:p-14 min-h-[380px] md:min-h-[460px] overflow-hidden flex flex-col justify-between">
        {/* Ghost letter */}
        <span
          aria-hidden="true"
          className="serif absolute -top-12 -right-4 md:-top-8 md:right-4 text-[260px] md:text-[400px] leading-none text-gold/[0.07] select-none pointer-events-none"
        >
          {item.letter}
        </span>

        <div key={runKey + '-head'} className="relative animate-fade-in-up">
          <div className="flex items-baseline gap-5 mb-6">
            <span className="serif text-6xl md:text-7xl text-gold leading-none">{item.letter}</span>
            <span className="eyebrow text-gold-soft">
              {String(active + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </span>
          </div>
          <h3 className="serif text-3xl md:text-5xl text-ink-white leading-tight max-w-xl">{item.title}</h3>
        </div>

        <div className="relative mt-6 md:mt-10">
          <div className="h-px w-12 bg-gold mb-5"></div>
          <p
            key={runKey + '-body'}
            className="text-sm md:text-base text-ink-mutedDk leading-relaxed max-w-xl animate-fade-in-up"
          >
            {item.body}
          </p>
          <div
            key={runKey + '-metric'}
            className="mt-6 md:mt-8 inline-flex items-center px-4 py-2 bg-gold text-bg-dark text-sm md:text-base font-semibold tracking-wider animate-fade-in-up"
          >
            {item.metric}
          </div>
        </div>

        {/* Progress dots */}
        <div className="relative mt-8 md:mt-10 flex items-center gap-2.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              aria-label={`${items[i].letter} · ${items[i].title}`}
              className="group/dot p-1.5 -m-1.5"
            >
              <span
                className={`block h-0.5 transition-all ${
                  i === active ? 'w-12 bg-gold' : 'w-6 bg-line-dark group-hover/dot:bg-gold/50'
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
              aria-pressed={isActive}
              className={`group relative text-left p-5 md:p-6 transition-colors duration-300 overflow-hidden ${
                isActive ? 'bg-gold/10' : 'bg-card-dark hover:bg-card-dark/60'
              }`}
            >
              <span
                className={`absolute left-0 top-0 bottom-0 w-[2px] bg-gold transition-transform origin-top duration-500 ${
                  isActive ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-50'
                }`}
              />
              <div className="flex items-baseline gap-4">
                <span className="serif text-3xl md:text-4xl text-gold leading-none">{it.letter}</span>
                <span
                  className={`text-sm md:text-base font-medium transition-colors ${
                    isActive ? 'text-ink-white' : 'text-ink-mutedDk group-hover:text-ink-white'
                  }`}
                >
                  {it.title}
                </span>
              </div>
              <div
                className={`mt-3 text-xs tabular transition-colors ${
                  isActive ? 'text-gold-soft' : 'text-ink-mutedDk/80'
                }`}
              >
                {it.metric}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
