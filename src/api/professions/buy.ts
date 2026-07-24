import { apiFetch, readContent, readError } from '../config/defaultApi';
import { BuyProfessionResponse } from './dto';

// Compra acesso a uma profissão com moedas. 409 se já possui, 422 se saldo insuficiente.
export async function buyProfession(professionId: number): Promise<BuyProfessionResponse> {
  const response = await apiFetch(`/professions/${professionId}/buy`, { method: 'POST' });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao comprar a profissão'));
  }

  return readContent<BuyProfessionResponse>(response);
}
