export type ChestStatus = 'unopened' | 'opened';
export type ChestRewardKind = 'cosmetic_asset' | 'profession_mission';

export interface Chest {
  id: number;
  slug: string;
  name: string;
  description: string | null;
}

// --- lista (GET /chests) ---
export interface UserChestItem {
  id: number; // user_chest id → é ele que vai em detail/open
  chest: Chest;
  status: ChestStatus;
  opened_at: string | null;
  redeemed_at: string | null;
}

export interface ChestListSummary {
  unopened: number;
  opened: number;
  total: number;
}

export interface ChestListResponse {
  items: UserChestItem[];
  summary: ChestListSummary;
}

// --- opções de slot (detalhe) ---
export interface ChestAsset {
  id: number;
  name: string;
  slug: string;
  url: string;
  thumb_url: string | null;
  type: string;
  rarity: string;
}

export interface ChestMission {
  id: number;
  slug: string;
  name: string;
  difficulty: string;
  type: string;
}

export interface ChestProfession {
  id: number;
  slug: string;
  name: string;
}

// `reward_ref` é o valor a enviar no open. asset OU mission conforme o
// reward_kind do slot; missão traz as profissões que ativa.
export interface ChestSlotOption {
  reward_ref: string;
  asset?: ChestAsset;
  mission?: ChestMission;
  professions?: ChestProfession[];
}

export interface ChestSlot {
  slot_key: string;
  reward_kind: ChestRewardKind;
  choose_count: number; // v1: sempre 1
  selector: string | null;
  options: ChestSlotOption[]; // vem vazio depois de aberto
}

// Eco do que foi escolhido (aparece depois de aberto).
export interface ChestSelection {
  slot_key: string;
  reward_kind: ChestRewardKind;
  reward_ref: string;
  asset?: ChestAsset;
  mission?: ChestMission;
}

export interface ChestDetail {
  id: number;
  chest: Chest;
  status: ChestStatus;
  opened_at: string | null;
  slots: ChestSlot[];
  selections: ChestSelection[];
}

// --- abrir (POST /chests/{id}/open) ---
// v1: 1 escolha por slot → { "<slot_key>": "<reward_ref>" }
export interface OpenChestRequest {
  selections: Record<string, string>;
}

export interface GrantedRewardDetail {
  asset?: ChestAsset;
  mission?: ChestMission;
  professions_activated?: number[];
}

export interface GrantedReward {
  slot_key: string;
  reward_kind: ChestRewardKind;
  reward_ref: string;
  detail: GrantedRewardDetail;
}

export interface OpenChestResponse {
  id: number;
  status: 'opened';
  opened_at: string;
  granted: GrantedReward[];
}
