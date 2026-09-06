import { Chest } from '../chests/dto';
import { FounderRedeemResponse } from '../founder/dto';

export interface RedeemCodeRequest {
  code: string;
}

// O endpoint unificado roteia pelo hash do código: acha em founder_codes → fluxo
// de fundador (kind:"founder"); senão tenta promo (kind:"promo"); senão 404.
export type RedeemKind = 'founder' | 'promo';

// Resposta unificada de POST /codes/redeem. Fundador TAMBÉM ganha um baú
// (Baú do Fundador) → `user_chest_id`/`chest` sempre presentes; abrir via
// POST /chests/{user_chest_id}/open.
export interface RedeemCodeResponse {
  kind: RedeemKind;
  message: string;
  user_chest_id: number;
  chest: Chest;
  status: 'unopened';
  remaining_redemptions: number | null; // só promo
  // Só quando kind === 'founder': vira Recruit IV + must_choose_track.
  founder?: FounderRedeemResponse | null;
}
