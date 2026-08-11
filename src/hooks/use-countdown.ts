import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  passed: boolean;
}

export function useCountdown(target: string | Date | null | undefined): Countdown {
  const compute = (): Countdown => {
    if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, passed: false };
    
    const targetDate = typeof target === "string" ? new Date(target) : target;
    const diff = targetDate.getTime() - Date.now();
    
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, passed: true };
    
    const totalSeconds = Math.floor(diff / 1000);
    
    return {
      days: Math.floor(totalSeconds / 86400),
      hours: Math.floor((totalSeconds % 86400) / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: Math.floor(totalSeconds % 60),
      totalSeconds,
      passed: false,
    };
  };

  const [value, setValue] = useState<Countdown>(compute());

  useEffect(() => {
    setValue(compute());
    const id = window.setInterval(() => setValue(compute()), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

export function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}
