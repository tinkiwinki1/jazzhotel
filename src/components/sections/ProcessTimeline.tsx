import { useEffect, useRef, useState } from 'react';

interface Step {
  code: string;
  title: string;
  body: string;
}

interface Props {
  steps: Step[];
}

export default function ProcessTimeline({ steps }: Props) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Draw the connector + sequential pop-in once on viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !drawn) {
            setDrawn(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [drawn]);

  // Auto-advance through steps slowly (8s)
  useEffect(() => {
    if (paused || !drawn) return;
    const id = window.setInterval(() => {
      setActive((a) => (a + 1) % steps.length);
    }, 8000);
    return () => clearInterval(id);
  }, [paused, drawn, steps.length]);

  const choose = (i: number) => setActive(i);
  const step = steps[active];
  const total = steps.length;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Desktop horizontal timeline */}
      <div className="hidden md:block relative">
        {/* Background connector */}
        <div className="absolute top-7 left-0 right-0 h-px bg-gold/25" />
        {/* Animated drawn connector */}
        <div
          className="absolute top-7 left-0 h-px bg-gold transition-[width] duration-[1400ms] ease-out"
          style={{ width: drawn ? '100%' : '0%' }}
        />

        <div className="relative grid grid-cols-7 gap-2">
          {steps.map((s, i) => {
            const isActive = i === active;
            const isPast = i < active;
            const popDelay = drawn ? `${i * 140}ms` : '0ms';
            return (
              <button
                key={i}
                type="button"
                onClick={() => choose(i)}
                className="group flex flex-col items-center text-center"
                aria-pressed={isActive}
              >
                <span
                  className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-500 border-2 ${
                    isActive
                      ? 'bg-gold border-gold scale-110 shadow-[0_0_0_6px_rgba(184,150,81,0.15)]'
                      : isPast
                      ? 'bg-gold/15 border-gold'
                      : 'bg-bg-light border-gold group-hover:border-gold-soft group-hover:scale-105'
                  }`}
                  style={{
                    transform: drawn ? undefined : 'scale(0)',
                    transitionDelay: drawn ? popDelay : '0ms',
                  }}
                >
                  <span
                    className={`serif text-base transition-colors ${
                      isActive ? 'text-bg-dark' : 'text-gold-deep'
                    }`}
                  >
                    {i + 1}
                  </span>
                </span>
                <div
                  className={`eyebrow transition-colors ${
                    isActive ? 'text-gold-deep' : 'text-ink-mutedLt group-hover:text-gold-deep'
                  }`}
                >
                  {s.title}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail panel (desktop) */}
      <div className="hidden md:block mt-10 lg:mt-14">
        <div className="grid grid-cols-[auto_1fr] gap-8 lg:gap-10 items-start bg-tan-card/40 border border-line-dim p-7 md:p-10">
          <div className="flex flex-col items-start">
            <span className="eyebrow text-gold-deep">
              {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <span className="serif text-6xl md:text-7xl text-gold leading-none mt-3 tabular">
              {String(active + 1).padStart(2, '0')}
            </span>
          </div>
          <div key={active} className="animate-fade-in-up">
            <div className="eyebrow text-gold-deep">{step.title}</div>
            <p className="serif text-2xl md:text-3xl text-ink leading-snug mt-3 max-w-3xl">
              {step.body}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile vertical layout */}
      <div className="md:hidden">
        <ol className="relative border-l-2 border-gold/40 pl-7 ml-4 flex flex-col gap-6">
          {steps.map((s, i) => {
            const isActive = i === active;
            return (
              <li key={i} className="relative">
                <button
                  type="button"
                  onClick={() => choose(i)}
                  className="text-left w-full"
                  aria-pressed={isActive}
                >
                  <span
                    className={`absolute -left-[39px] top-0 w-10 h-10 rounded-full border-2 border-gold flex items-center justify-center transition-colors ${
                      isActive ? 'bg-gold' : 'bg-bg-light'
                    }`}
                  >
                    <span
                      className={`serif text-sm transition-colors ${
                        isActive ? 'text-bg-dark' : 'text-gold-deep'
                      }`}
                    >
                      {i + 1}
                    </span>
                  </span>
                  <div className={`eyebrow ${isActive ? 'text-gold-deep' : 'text-ink-mutedLt'}`}>
                    {s.title}
                  </div>
                  <p className="text-sm text-ink-mutedLt mt-1.5 leading-relaxed">{s.body}</p>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
