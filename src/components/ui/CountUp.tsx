import { useEffect, useState } from 'react';
import { parseMetric, formatMetric, easeOutCubic } from '@/lib/count-up';

interface Props {
  raw: string;
  /** Change this to re-trigger the animation. */
  runKey: number;
  duration?: number;
}

export default function CountUp({ raw, runKey, duration = 1100 }: Props) {
  const parsed = parseMetric(raw);
  const [display, setDisplay] = useState<string>(parsed.num !== null ? formatMetric(0, parsed) : raw);

  useEffect(() => {
    if (parsed.num === null) {
      setDisplay(raw);
      return;
    }
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setDisplay(formatMetric(parsed.num, parsed));
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      setDisplay(formatMetric(parsed.num! * eased, parsed));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runKey, raw]);

  return <span className="tabular">{display}</span>;
}
