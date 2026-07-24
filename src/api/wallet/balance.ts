import { apiFetch, readContent, readError } from '../config/defaultApi';
import { WalletBalance } from './dto';

export async function getWallet(): Promise<WalletBalance> {
  const response = await apiFetch('/wallet');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a carteira'));
  }

  return readContent<WalletBalance>(response);
}
