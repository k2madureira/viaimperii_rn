import { apiFetch, readContent, readError } from '../config/defaultApi';
import { CreateUserPayload, CreateUserResponse } from './dto';

export async function createUserRequest(data: CreateUserPayload): Promise<CreateUserResponse> {
  const response = await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao criar conta'));
  }

  return readContent<CreateUserResponse>(response);
}
