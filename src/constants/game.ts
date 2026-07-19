export const XP_PER_RANK = 500;
export const MASTERY_FOR_MEDAL = 100;

// Cotas de missões por janela (espelham DAILY_MISSION_LIMIT / WEEKLY_MISSION_LIMIT
// do backend). Usadas para derivar "quantas já concluí hoje" a partir do saldo.
export const DAILY_MISSION_LIMIT = 10;
export const WEEKLY_MISSION_LIMIT = 2;

// Meta diária de hábito (menor que a cota máxima): alvo alcançável que alimenta
// o anel de progresso do dia na Home e na tela de Missões. Só no front.
export const DAILY_MISSION_GOAL = 5;

// Tamanho mínimo do motivo ao rejeitar a conclusão de outro usuário (espelha
// REJECTION_REASON_MIN_LENGTH do backend — POST /missions/{slug}/reject retorna
// 422 abaixo disso, após strip). Garante um feedback útil para quem refaz a missão.
export const REJECTION_REASON_MIN_LENGTH = 20;

// Bônus ao bater a meta diária de missões. O crédito é feito pelo BACKEND
// (carteira é derivada do ledger; 1 denário = 100 asses), idempotente por dia (SP).
export const DAILY_GOAL_REWARD_DENARIUS = 20;
export const DAILY_GOAL_REWARD_ATOMIC = DAILY_GOAL_REWARD_DENARIUS * 100;

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
