import { Chest } from '../chests/dto';

export interface RedeemCodeRequest {
  code: string;
}

// Depois de resgatar, abrir via POST /chests/{user_chest_id}/open.
export interface RedeemCodeResponse {
  user_chest_id: number;
  chest: Chest;
  status: 'unopened';
  message: string;
  remaining_redemptions: number | null;
}
