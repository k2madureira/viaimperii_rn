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
