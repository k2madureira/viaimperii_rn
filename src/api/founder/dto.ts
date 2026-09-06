import { CurrentRank } from '../users/dto';

// --- pré-inscrição (público) ---
export interface FounderPreRegisterRequest {
  email: string;
  name?: string;
}

// A resposta NUNCA traz o código cru — só o e-mail e a validade.
export interface FounderPreRegisterResponse {
  email: string;
  expires_at: string; // ISO
}

// --- disponibilidade (público) ---
export interface FounderAvailability {
  seats_remaining: number;
  enrollment_open: boolean;
}

// --- resgate do código (autenticado, self) ---
export interface FounderRedeemRequest {
  code: string;
}

// Após resgatar, o usuário vira Recruit IV e `must_choose_track` volta true → o
// front deve levar à escolha de trilha. O resgate também concede o Baú do
// Fundador (fechado), que passa a aparecer em GET /chests.
export interface FounderRedeemResponse {
  is_founder: boolean;
  founder_number: number;
  total_xp: number;
  current_rank: CurrentRank | null;
  must_choose_track: boolean;
}
