export const XP_PER_RANK = 500;
export const MASTERY_FOR_MEDAL = 100;

export const SPECIALTIES = [
  'Engineering',
  'Strategy',
  'Commerce',
  'Diplomacy',
  'Exploration',
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export const SPECIALTY_MEDALS: Record<string, string> = {
  Engineering: 'Imperial Architect',
  Strategy: 'Master Strategist',
  Commerce: 'Imperial Merchant',
  Diplomacy: 'Diplomat of Rome',
  Exploration: 'Conqueror of Gaul',
};

export const SPECIALTY_LABELS_PT: Record<string, string> = {
  Engineering: 'Engenharia',
  Strategy: 'Estratégia',
  Commerce: 'Comércio',
  Diplomacy: 'Diplomacia',
  Exploration: 'Exploração',
};
