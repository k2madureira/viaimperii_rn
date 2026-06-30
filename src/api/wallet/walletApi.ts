import { apiFetch, readContent, readError } from '../config/defaultApi';

// Saldo da carteira (moedas) — derivado do ledger no backend (GET /wallet).
export interface WalletBalance {
  currency: string;
  balance: number; // total (geral + restrito), unidades atômicas
  balance_display: string;
  general_balance: number; // gastável em qualquer coisa (inclui físicos)
  general_balance_display: string;
  restricted_balance: number; // fundos digital-only (ex.: bônus de admin)
  restricted_balance_display: string;
}

export async function getWallet(): Promise<WalletBalance> {
  const response = await apiFetch('/wallet');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a carteira'));
  }

  return readContent<WalletBalance>(response);
}
