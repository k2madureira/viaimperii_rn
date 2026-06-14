import { apiFetch } from '../config/defaultApi';

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
    const error = await response.json();
    throw new Error(error.message ?? 'Erro ao carregar o quiz');
  }

  const json = await response.json();
  return json.content as QuizQuestionsResponse;
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
    const error = await response.json();
    throw new Error(error.message ?? 'Erro ao enviar respostas');
  }

  const json = await response.json();
  return json.content as QuizResult;
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
    const error = await response.json();
    throw new Error(error.message ?? 'Erro ao atualizar especialidade');
  }
}
