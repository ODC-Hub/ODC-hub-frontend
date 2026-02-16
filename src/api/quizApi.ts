// src/api/quiz.types.ts

import api from "./axios";

export type QuestionType = "SINGLE" | "MULTIPLE";

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options: QuizOption[];
}

// ---------------- BOOTCAMPER ----------------

export interface QuizResponse {
  id: string;
  title: string;
  module: string;
  durationSeconds: number;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface SubmitQuizRequest {
  answers: Record<string, string[]>;
  timeTakenSeconds: number;
}

export interface QuizResultResponse {
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
}

export interface QuizAttemptResponse {
  quizId: string;
  quizTitle: string;
  module: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  submittedAt: string;
}

// ---------------- FORMATEUR ----------------

export interface QuizAdminResponse extends QuizResponse {
  createdAt: string;
  editable: boolean;
  questions: (QuizQuestion & {
    correctOptionIds: string[];
  })[];
}


export interface CreateQuizRequest {
  title: string;
  module: string;
  durationSeconds: number;
  passingScore: number;
  questions: {
    text: string;
    type: QuestionType;
    options: QuizOption[];
    correctOptionIds: string[];
  }[];
}

// ================= FORMATEUR =================

export const createQuiz = async (
  payload: CreateQuizRequest
): Promise<QuizAdminResponse> => {
  const res = await api.post("/quizzes", payload);
  return res.data;
};

export const getMyQuizzes = async (): Promise<QuizAdminResponse[]> => {
  const res = await api.get("/quizzes/mine");
  return res.data;
};

export const deleteQuiz = async (quizId: string): Promise<void> => {
  await api.delete(`/quizzes/${quizId}`);
};

export const getQuizForEdit = async (
  quizId: string
): Promise<QuizAdminResponse> => {
  const res = await api.get(`/quizzes/${quizId}/admin`);
  return res.data;
};

export const updateQuiz = async (
  quizId: string,
  payload: CreateQuizRequest
): Promise<QuizAdminResponse> => {
  const res = await api.put(`/quizzes/${quizId}`, payload);
  return res.data;
};
// ================= BOOTCAMPER =================

export const getQuizForBootcamper = async (
  quizId: string
): Promise<QuizResponse> => {
  const res = await api.get(`/quizzes/${quizId}`);
  return res.data;
};

export const submitQuiz = async (
  quizId: string,
  payload: SubmitQuizRequest
): Promise<QuizResultResponse> => {
  const res = await api.post(`/quizzes/${quizId}/submit`, payload);
  return res.data;
};

export const getAvailableQuizzes = async (): Promise<QuizResponse[]> => {
  const res = await api.get("/quizzes");
  return res.data;
};

export const getMyQuizResults = async (): Promise<QuizAttemptResponse[]> => {
  const res = await api.get("/quizzes/results/me");
  return res.data;
};

export const getAllQuizResultsForFormateur = async () => {
  const res = await api.get("/quizzes/formateur/results");
  return res.data;
};
