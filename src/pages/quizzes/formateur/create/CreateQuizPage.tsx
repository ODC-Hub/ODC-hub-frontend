/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { QuizFormState, QuizQuestion } from "./quizBuilder.types";
import QuestionCard from "./QuestionCard";
import { v4 as uuid } from "uuid";
import { useNavigate } from "react-router-dom";
import { createQuiz } from "@/api/quizApi";

/* ================= INITIAL STATE ================= */

const initialState: QuizFormState = {
  title: "",
  module: "",
  durationMinutes: 10,
  passingScore: 70,
  questions: [],
};

export default function CreateQuizPage() {
  const [form, setForm] = useState<QuizFormState>(initialState);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  /* ================= VALIDATION ================= */

  const validateForm = (): string | null => {
    if (!form.title.trim()) return "Quiz title is required";
    if (!form.module.trim()) return "Module is required";
    if (form.questions.length === 0) return "Add at least one question";

    if (form.passingScore < 50 || form.passingScore > 100) {
      return "Passing score must be between 50% and 100%";
    }

    if (form.durationMinutes <= 0) {
      return "Duration must be greater than 0";
    }

    for (const [i, q] of form.questions.entries()) {
      if (!q.text.trim()) {
        return `Question ${i + 1} text is empty`;
      }
      if (q.options.length < 2) {
        return `Question ${i + 1} must have at least 2 options`;
      }
      if (q.correctOptionIds.length === 0) {
        return `Question ${i + 1} has no correct answer`;
      }
      if (q.type === "SINGLE" && q.correctOptionIds.length !== 1) {
        return `Question ${i + 1} must have exactly one correct answer`;
      }
    }

    return null;
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    const error = validateForm();

    if (error) {
      setFormError(error);
      return;
    }

    setFormError(null);
    setSubmitting(true);

    try {
      await createQuiz({
        title: form.title,
        module: form.module,
        durationSeconds: form.durationMinutes * 60,
        passingScore: form.passingScore,
        questions: form.questions.map((q) => ({
          text: q.text,
          type: q.type,
          options: q.options,
          correctOptionIds: q.correctOptionIds,
        })),
      });

      navigate("/quizzes/formateur");
    } catch (err: any) {
      console.error(err);
      setFormError(
        err.response?.data?.message ??
          "Failed to create quiz. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= QUESTION HANDLERS ================= */

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: uuid(),
      text: "",
      type: "SINGLE",
      options: [],
      correctOptionIds: [],
    };

    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const updateQuestion = (updated: QuizQuestion) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === updated.id ? updated : q
      ),
    }));
  };

  const deleteQuestion = (id: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Create a New Quiz
        </h1>
        <p className="text-gray-500 mt-1">
          Configure quiz settings and define questions.
        </p>
      </div>

      {/* Error Banner */}
      {formError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
          <svg
            className="w-5 h-5 mt-0.5 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
            />
          </svg>

          <div className="flex-1">
            <p className="font-medium">Form validation error</p>
            <p className="mt-0.5">{formError}</p>
          </div>

          <button
            onClick={() => setFormError(null)}
            className="text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Quiz Info */}
      <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Quiz Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Quiz Title
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g. Java Basics Assessment"
              value={form.title}
              onChange={(e) => {
                setForm({ ...form, title: e.target.value });
                if (formError) setFormError(null);
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Module
              </label>
              <input
                className="border rounded-lg px-3 py-2 w-full"
                placeholder="Backend, Cloud, Frontend..."
                value={form.module}
                onChange={(e) => {
                  setForm({ ...form, module: e.target.value });
                  if (formError) setFormError(null);
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                min={1}
                className="border rounded-lg px-3 py-2 w-full"
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    durationMinutes: Number(e.target.value),
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                min={50}
                max={100}
                className="border rounded-lg px-3 py-2 w-full"
                value={form.passingScore}
                onChange={(e) =>
                  setForm({
                    ...form,
                    passingScore: Number(e.target.value),
                  })
                }
              />
              <p className="text-xs text-gray-400 mt-1">
                Must be between 50% and 100%
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Questions
          </h2>
        </div>

        {form.questions.length === 0 && (
          <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg border">
            No questions added yet.
          </div>
        )}

        {form.questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            index={index}
            question={q}
            onChange={updateQuestion}
            onDelete={deleteQuestion}
          />
        ))}

        <button
          onClick={addQuestion}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Question
        </button>
      </section>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Quiz"}
        </button>
      </div>
    </div>
  );
}
