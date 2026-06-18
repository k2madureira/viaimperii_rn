import { apiFetch, readContent, readError } from '../config/defaultApi';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export interface QuizQuestionsResponse {
  total: number;
  questions: QuizQuestion[];
}

export interface QuizAnswer {
  question_id: number;
  option_id: string;
}

export interface QuizResult {
  specialty_name: string;
  specialty_id: number;
  description: string;
  message: string;
}

export async function getQuizQuestions(testCode: string): Promise<QuizQuestionsResponse> {
  const response = await apiFetch('/specialty-quiz', {
    headers: { 'X-Test-Code': testCode },
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao carregar o quiz'));
  }

  return readContent<QuizQuestionsResponse>(response);
}

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

export async function updateUserSpecialty(
  userId: string,
  specialtyId: number,
): Promise<void> {
  const response = await apiFetch(`/users/${userId}/specialty`, {
    method: 'PATCH',
    body: JSON.stringify({ specialty_id: specialtyId }),
  });

  if (!response.ok) {
    throw new Error(await readError(response, 'Erro ao atualizar especialidade'));
  }
}
