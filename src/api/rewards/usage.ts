import { apiFetch, readContent, readError } from '../config/defaultApi';
import { RewardsUsage } from './dto';

/** Saldo de grants restante hoje (tudo null para admin). */
export async function getRewardsUsage(): Promise<RewardsUsage> {
  const response = await apiFetch('/rewards/usage');
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar uso de recompensas'));
  }
  return readContent<RewardsUsage>(response);
}
