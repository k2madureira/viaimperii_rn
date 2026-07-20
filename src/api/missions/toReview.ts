import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ToReviewItem, ToReviewResponse } from './dto';

export async function getMissionsToReview(): Promise<ToReviewItem[]> {
  const response = await apiFetch(
    '/missions/to-review?page=1&perPage=100&sortField=remaining_seconds&sortOrder=asc',
  );

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar missões para revisão'));
  }

  const data = await readContent<ToReviewResponse>(response);
  return data.items ?? [];
}
