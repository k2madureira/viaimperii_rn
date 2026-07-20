import { apiFetch, readContent, readError } from '../config/defaultApi';
import { QuizQuestionsResponse } from './dto';

export async function getQuizQuestions(testCode: string): Promise<QuizQuestionsResponse> {
  const response = await apiFetch('/specialty-quiz', {
    headers: { 'X-Test-Code': testCode },
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o quiz'));
  }

  return readContent<QuizQuestionsResponse>(response);
}
