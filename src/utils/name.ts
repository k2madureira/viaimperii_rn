/**
 * Iniciais de um nome (até 2 letras, maiúsculas) — fallback de avatar.
 */
export function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}
