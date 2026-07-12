// Utilidades de cor para temas derivados de UMA cor-marca (ex.: cor da profissão).
// Mantém a harmonia gerando tints (alfa) e um tom escuro para cabeçalhos a partir
// da mesma cor — sem introduzir cores novas.

// Normaliza #RGB / RRGGBB para #RRGGBB (maiúsculas). Volta ao fallback se inválida.
export function normalizeHex(hex: string | null | undefined, fallback = '#6B1221'): string {
  if (!hex) return fallback;
  let h = hex.trim();
  if (!h.startsWith('#')) h = `#${h}`;
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    h = '#' + h.slice(1).split('').map((c) => c + c).join('');
  }
  return /^#[0-9a-fA-F]{6}$/.test(h) ? h.toUpperCase() : fallback;
}

// Anexa alfa (0..1) a uma cor → #RRGGBBAA (aceito pelo React Native).
export function withAlpha(hex: string, alpha: number): string {
  const base = normalizeHex(hex);
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();
  return `${base}${a}`;
}

// Escurece uma cor por um fator (0..1) — usado para cabeçalhos com bom contraste.
export function darken(hex: string, factor = 0.2): string {
  const base = normalizeHex(hex);
  const f = 1 - Math.max(0, Math.min(1, factor));
  const ch = (i: number) => Math.round(parseInt(base.slice(i, i + 2), 16) * f);
  const hx = (n: number) => n.toString(16).padStart(2, '0');
  return `#${hx(ch(1))}${hx(ch(3))}${hx(ch(5))}`.toUpperCase();
}

// Luminância relativa aproximada — decide texto branco vs. escuro sobre a cor.
export function isDark(hex: string): boolean {
  const base = normalizeHex(hex);
  const r = parseInt(base.slice(1, 3), 16);
  const g = parseInt(base.slice(3, 5), 16);
  const b = parseInt(base.slice(5, 7), 16);
  // Fórmula YIQ.
  return (r * 299 + g * 587 + b * 114) / 1000 < 150;
}

export interface ProfessionTheme {
  base: string; // cor-marca normalizada
  header: string; // fundo do cabeçalho (tom escuro da cor)
  onHeader: string; // texto sobre o cabeçalho
  soft: string; // fundo suave (~10%)
  faint: string; // fundo bem sutil (~6%)
  border: string; // borda suave (~22%)
  strong: string; // realce (~20%) para chips
}

// Deriva um tema coeso a partir da cor principal da profissão (harmonia de cores).
export function professionTheme(color: string | null | undefined): ProfessionTheme {
  const base = normalizeHex(color);
  return {
    base,
    header: isDark(base) ? base : darken(base, 0.28),
    onHeader: '#FFFFFF',
    soft: withAlpha(base, 0.1),
    faint: withAlpha(base, 0.06),
    border: withAlpha(base, 0.22),
    strong: withAlpha(base, 0.2),
  };
}
