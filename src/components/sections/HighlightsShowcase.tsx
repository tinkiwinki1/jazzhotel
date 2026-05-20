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
  const [active, setActive] = useState(1);
  const [runKey, setRunKey] = useState(0);
  const [paused, setPaused] = useState(false);
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
      className="grid lg:grid-cols-2 gap-px bg-[#525252] border border-[#16243E] rounded-[24px] overflow-hidden w-full"
    >
      {/* LEFT — featured panel */}
      <div className="relative bg-[#D5DEE3] p-8 sm:p-10 lg:p-[56px] min-h-[440px] lg:h-[592px] flex flex-col justify-end gap-5 isolate">
        {/* Ghost index — top-right */}
        <span
          aria-hidden="true"
          className="absolute right-[51px] top-[29.6px] serif text-[130px] leading-none text-white/30 select-none pointer-events-none tabular"
        >
          {num}
        </span>

        {/* Metric + caption block */}
        <div className="relative z-[1] flex flex-col gap-4 w-full">
          <div className="text-[12px] font-bold leading-[18px] uppercase tracking-[2.4px] text-[#525252]">
            {item.caption}
          </div>
          <div
            key={runKey + '-num'}
            className="serif text-[88px] sm:text-[110px] lg:text-[140px] leading-[0.8] text-[#222222] tabular"
          >
            <CountUp raw={item.metric} runKey={runKey} />
          </div>
        </div>

        {/* Description + dots block, gap-80 between them */}
        <div className="relative z-[2] flex flex-col gap-20 w-full">
          <div className="flex flex-col gap-5 max-w-[576px]">
            <div className="h-px w-full bg-[#525252]"></div>
            <p
              key={runKey + '-body'}
              className="text-[16px] leading-[24px] text-[#222222] animate-fade-in-up"
            >
              {item.body}
            </p>
          </div>

          {/* Progress indicators */}
          <div className="pt-[40px]">
            <div className="flex items-center gap-1">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  aria-label={`${i + 1}`}
                  className="p-1.5 -m-1.5 group/dot"
                >
                  <span
                    className={`block h-[2px] transition-all ${
                      i === active ? 'w-[40px] bg-[#16243E]' : 'w-[20px] bg-white group-hover/dot:bg-[#16243E]/40'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — 6-row list */}
      <div className="flex flex-col gap-px bg-[#525252]">
        {items.map((it, i) => {
          const isActive = i === active;
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              className={`flex flex-col gap-3 items-start px-6 py-4 h-[98px] text-left transition-colors ${
                isActive ? 'bg-[#16243E]' : 'bg-white hover:bg-[#f5f1e8]'
              }`}
              aria-pressed={isActive}
            >
              <div className="flex items-baseline justify-between w-full">
                <span
                  className={`serif text-[30px] leading-[36px] tabular whitespace-nowrap ${
                    isActive ? 'text-white' : 'text-[#16243E]'
                  }`}
                >
                  {it.metric}
                </span>
                <span
                  className={`text-[10px] leading-[15px] tabular tracking-[2px] ${
                    isActive ? 'text-[#9CA3AF]' : 'text-[#525252]'
                  }`}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div
                className={`text-[12px] font-bold leading-[18px] uppercase tracking-[2.4px] ${
                  isActive ? 'text-white' : 'text-[#525252]'
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
