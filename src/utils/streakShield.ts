// Visual do escudo de ofensiva (Streak Shield) derivado da razão have/max.
// Cores de tokens do theme (tailwind.config.js): error / warning / laurel.

const RED = '#D64545'; // theme.colors.error — vazio
const YELLOW = '#E6A23C'; // theme.colors.warning — intermediário
const GREEN = '#2F7A52'; // theme.colors.laurel/success — cheio

// Razão de preenchimento 0..1 (robusto a max ausente/0).
export function shieldFillRatio(have: number, max: number): number {
  if (!max || max <= 0) return 0;
  return Math.max(0, Math.min(1, have / max));
}

// Cor do glow: vazio = vermelho, cheio = verde, intermediários = amarelo.
export function shieldGlowColor(have: number, max: number): string {
  const ratio = shieldFillRatio(have, max);
  if (ratio <= 0) return RED;
  if (ratio >= 1) return GREEN;
  return YELLOW;
}
