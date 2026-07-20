import { apiFetch, readContent, readError } from '../config/defaultApi';
import { QuizAnswer, QuizResult } from './dto';

export async function submitQuizAnswers(
  testCode: string,
  answers: QuizAnswer[],
): Promise<QuizResult> {
  const response = await apiFetch('/specialty-quiz/submit', {
    method: 'POST',
    headers: { 'X-Test-Code': testCode },
    body: JSON.stringify({ answers }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao enviar respostas'));
  }

  return readContent<QuizResult>(response);
}
