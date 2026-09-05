import { apiFetch, readContent, readError } from '../config/defaultApi';
import { FounderAvailability } from './dto';

// Público. Usado para mostrar "restam X de 100 vagas" na landing.
export async function getFounderAvailability(): Promise<FounderAvailability> {
  const response = await apiFetch('/founder/availability');

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar disponibilidade'));
  }

  return readContent<FounderAvailability>(response);
}
