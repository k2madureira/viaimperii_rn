// Paleta usada para diferenciar as legiões (lombadas, livro aberto, card da home).
export const LEGION_COLORS = ['#8B1A2B', '#2F7A52', '#D4AF37', '#7a5b00', '#3b5a8b'];

export function legionColorByIndex(index: number): string {
  return LEGION_COLORS[((index % LEGION_COLORS.length) + LEGION_COLORS.length) % LEGION_COLORS.length];
}

// Cor da legião conforme sua posição na listagem — mantém a mesma cor em todas as telas.
export function legionColorById(
  legions: { id: number }[] | undefined,
  legionId: number | null | undefined,
): string | null {
  if (!legions || legionId == null) return null;
  const idx = legions.findIndex((l) => l.id === legionId);
  return idx >= 0 ? legionColorByIndex(idx) : null;
}
