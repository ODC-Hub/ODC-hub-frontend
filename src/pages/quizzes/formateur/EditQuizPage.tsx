import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getQuizForEdit,
  updateQuiz,
  QuizAdminResponse,
  CreateQuizRequest,
} from "@/api/quizApi";
import QuestionCard from "./create/QuestionCard";
import { QuizQuestion } from "./create/quizBuilder.types";

export default function EditQuizPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizAdminResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ================= LOAD ================= */

  useEffect(() => {
    if (!quizId) return;

    getQuizForEdit(quizId)
      .then(setQuiz)
      .catch(() => setError("Failed to load quiz"));
  }, [quizId]);

  /* ================= GUARDS ================= */

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  if (!quiz) {
    return <div className="p-6">Loading quiz…</div>;
  }

  if (!quiz.editable) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          This quiz cannot be edited because at least one bootcamper has already
          attempted it.
        </div>
      </div>
    );
  }

  /* ================= QUESTION HANDLERS ================= */

  const updateQuestion = (updated: QuizQuestion) => {
    setQuiz(prev =>
      prev
        ? {
            ...prev,
            questions: prev.questions.map(q =>
              q.id === updated.id ? updated : q
            ),
          }
        : prev
    );
  };

  const deleteQuestion = (id: string) => {
    setQuiz(prev =>
      prev
        ? { ...prev, questions: prev.questions.filter(q => q.id !== id) }
        : prev
    );
  };

  /* ================= SAVE ================= */

  const handleSave = async () => {
    if (!quiz) return;

    setSaving(true);

    const payload: CreateQuizRequest = {
      title: quiz.title,
      module: quiz.module,
      durationSeconds: quiz.durationSeconds,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map(q => ({
        text: q.text,
        type: q.type,
        options: q.options,
        correctOptionIds: q.correctOptionIds,
      })),
    };

    try {
      await updateQuiz(quiz.id, payload);
      navigate("/quizzes/formateur");
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
        <p className="text-gray-500 mt-1">
          Update quiz information and questions.
        </p>
      </div>

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
              value={quiz.title}
              onChange={e => setQuiz({ ...quiz, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Module
              </label>
              <input
                className="border rounded-lg px-3 py-2 w-full"
                value={quiz.module}
                onChange={e => setQuiz({ ...quiz, module: e.target.value })}
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
                value={Math.round(quiz.durationSeconds / 60)}
                onChange={e =>
                  setQuiz({
                    ...quiz,
                    durationSeconds: Number(e.target.value) * 60,
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
                value={quiz.passingScore}
                onChange={e =>
                  setQuiz({
                    ...quiz,
                    passingScore: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Questions</h2>

        {quiz.questions.map((q, index) => (
          <QuestionCard
            key={q.id}
            index={index}
            question={q}
            onChange={updateQuestion}
            onDelete={deleteQuestion}
          />
        ))}
      </section>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
