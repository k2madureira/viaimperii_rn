import { apiFetch, readContent, readError } from '../config/defaultApi';
import { BuyShieldResponse, StreakApiError } from './dto';

export async function buyStreakShield(userId: string): Promise<BuyShieldResponse> {
  const res = await apiFetch(`/users/${userId}/streak/shield`, { method: 'POST' });
  if (!res.ok) {
    throw new StreakApiError(res.status, await readError(res, 'Erro ao comprar o escudo'));
  }
  return readContent<BuyShieldResponse>(res);
}
