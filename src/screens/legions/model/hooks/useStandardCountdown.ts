import { useEffect, useState } from 'react';

/**
 * Countdown client-side do estandarte ativo, semeado por `remaining_seconds`.
 * O contrato não expõe SSE de legião (spec §6.6), então o tique é local; a
 * fonte da verdade volta no próximo refetch do cofre.
 */
export function useStandardCountdown(remainingSeconds: number | undefined): number {
  const [seconds, setSeconds] = useState(remainingSeconds ?? 0);

  // Ressemeia sempre que o backend devolve um novo valor (refetch/on-focus).
  useEffect(() => {
    setSeconds(remainingSeconds ?? 0);
  }, [remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds == null || remainingSeconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [remainingSeconds]);

  return seconds;
}

/** Formata o restante como "2d 4h", "4h 12m" ou "12m 30s". */
export function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.trunc(totalSeconds));
  const days = Math.floor(s / 86_400);
  const hours = Math.floor((s % 86_400) / 3_600);
  const minutes = Math.floor((s % 3_600) / 60);
  const secs = s % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${secs}s`;
}
