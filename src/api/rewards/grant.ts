import { apiFetch, readContent, readError } from '../config/defaultApi';
import { GrantRewardPayload, RewardResult } from './dto';

/**
 * Distribuição de XP/moeda dirigida pelo front (POST /rewards).
 *
 * Regras do backend (usuário comum): máx. 100 por request e 10 grants por dia (SP).
 * **Idempotente por dia SP**: um grant idêntico (mesmo ator, alvo, `type` e
 * `amount`) no mesmo dia é replay — retorna `idempotent: true` sem re-creditar e
 * sem consumir slot. Então o cliente pode chamar sem guard local; basta olhar
 * `idempotent` para saber se creditou de fato (ex.: exibir toast só na 1ª vez).
 */
export async function grantReward(payload: GrantRewardPayload): Promise<RewardResult> {
  const response = await apiFetch('/rewards', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao conceder recompensa'));
  }
  return readContent<RewardResult>(response);
}
