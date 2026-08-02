// Divisões do clã (rank_level 1..5) — mapeamento de nível → slug de i18n e cor do selo.
// marechal(5) → general(4) → major(3) → capitão(2) → soldado(1). Ver business-rules/social/clans.md §2.

export const CLAN_DIVISION_SLUG: Record<number, string> = {
  5: 'marechal',
  4: 'general',
  3: 'major',
  2: 'capitao',
  1: 'soldado',
};

export const CLAN_DIVISION_COLOR: Record<number, string> = {
  5: '#9E1B32', // marechal — vermelho imperial
  4: '#B4872F', // general — dourado
  3: '#2F7A52', // major — verde
  2: '#3A6B8C', // capitão — azul
  1: '#6B7280', // soldado — cinza
};

// Ordem de exibição dos membros (maior divisão primeiro).
export const CLAN_DIVISION_ORDER = [5, 4, 3, 2, 1];

export function clanDivisionSlug(level: number | null | undefined): string {
  return CLAN_DIVISION_SLUG[level ?? 1] ?? 'soldado';
}

export function clanDivisionColor(level: number | null | undefined): string {
  return CLAN_DIVISION_COLOR[level ?? 1] ?? '#6B7280';
}

// Requisitos de fundação (espelha business-rules/social/clans.md §1 e §5).
// A patente é derivada do XP; o gate do backend é `rank_index_for_xp >= 20`, que
// corresponde ao rank "Centurion I / Praetor I" = level 21 no ladder (RankImage.level).
export const CLAN_MIN_CREATE_LEVEL = 21;

// Taxa de fundação = 2 aureus (atômico: 1 aureus = 100000 asses).
export const CLAN_FOUNDING_FEE_ATOMIC = 200000;

// Escada de capacidade (nível do clã → teto de membros) + preço de upgrade (atômico).
export const CLAN_MEMBER_CAP_BY_LEVEL: { level: number; cap: number; upgradeFromPrev: number | null }[] = [
  { level: 1, cap: 50, upgradeFromPrev: null },
  { level: 2, cap: 200, upgradeFromPrev: 400000 }, // N1→N2 = 4 aureus
  { level: 3, cap: 500, upgradeFromPrev: 600000 }, // N2→N3 = 6 aureus
];
