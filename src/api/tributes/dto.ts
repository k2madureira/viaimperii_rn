import { CoinDenom } from '../../utils/coins';

// Erro tipado do domínio: o status distingue motivos que o modal precisa tratar
// de formas diferentes (422 inline no campo, 429 bloqueia o envio, 409 desabilita
// a ação na fila de revisão). Sem ele, tudo viraria a mesma mensagem genérica.
export class TributeApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'TributeApiError';
    this.status = status;
  }
}

// Faixa aceita pelo backend, por tributo. Fora dela → 422.
export const TRIBUTE_MIN = 5;
export const TRIBUTE_MAX = 100;

// Valores sugeridos no carrossel do modal (em denarii).
export const TRIBUTE_PRESETS = [5, 10, 25, 50, 100];

// Resumo agregado do que já foi tributado num alvo. Vem batched no item do feed,
// como o resumo de reações — zerado quando ninguém tributou ainda.
export interface TributeSummary {
  total: number; // atômico (asses)
  total_display: string;
  count: number;
  mine: number; // atômico já tributado pelo VIEWER neste alvo
}

export interface TributeInput {
  amount: number; // quantidade na denominação `unit`
  unit?: CoinDenom; // default 'denarius' no backend
}

export interface SendFeedTributeInput extends TributeInput {
  eventId: number;
}

export interface SendMissionTributeInput extends TributeInput {
  missionSlug: string;
  executorId: string; // uuid do executor da missão concluída
}

// Mesma resposta nos dois alvos (feed e mission).
export interface TributeResult {
  message: string;
  target_type: 'feed' | 'mission';
  target_id: string | number;
  recipient_user_id: string;
  coins_sent: number;
  coins_sent_display: string;
  sender_balance: number;
  sender_balance_display: string;
  target_total: number; // total já tributado NAQUELE alvo
  target_total_display: string;
  tributes_today: number; // nº de tributos do remetente hoje (fuso SP)
  daily_limit: number | null; // 10 | null (admin é isento)
}
