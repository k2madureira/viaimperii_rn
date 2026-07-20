import { apiFetch, readContent, readError } from '../config/defaultApi';
import { Mission } from './dto';

// Status ao vivo de UMA missão (finaliza na leitura se a janela já venceu).
// Usado para pollar uma missão específica após o /complete.
export async function getMission(slug: string): Promise<Mission> {
  const response = await apiFetch(`/missions/${slug}`);

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar a missão'));
  }

  return readContent<Mission>(response);
}
