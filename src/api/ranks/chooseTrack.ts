import { apiFetch, readContent, readError } from '../config/defaultApi';
import { ChooseTrackResult } from './dto';

export async function chooseTrack(userId: string, trackSlug: string): Promise<ChooseTrackResult> {
  const response = await apiFetch(`/users/${userId}/track`, {
    method: 'POST',
    body: JSON.stringify({ track: trackSlug }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao escolher trilha'));
  }

  return readContent<ChooseTrackResult>(response);
}
