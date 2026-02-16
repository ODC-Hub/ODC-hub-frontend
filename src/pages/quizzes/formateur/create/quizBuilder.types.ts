export type QuestionType = "SINGLE" | "MULTIPLE";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options: QuizOption[];
  correctOptionIds: string[];
}

export interface QuizFormState {
  title: string;
  module: string;
  durationMinutes: number;
  passingScore: number;
  questions: QuizQuestion[];
}
