import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getQuizForEdit, QuizAdminResponse } from "@/api/quizApi";

export default function QuizPreviewPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const [quiz, setQuiz] = useState<QuizAdminResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;

    getQuizForEdit(quizId)
      .then(setQuiz)
      .catch(() => alert("Failed to load quiz"))
      .finally(() => setLoading(false));
  }, [quizId]);

  if (loading) return <div className="p-6">Loading…</div>;
  if (!quiz) return <div className="p-6">Quiz not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">{quiz.title}</h1>

      {quiz.questions.map((q, index) => (
        <div
          key={q.id}
          className="bg-white border rounded-xl p-5 space-y-3"
        >
          <h3 className="font-medium">
            {index + 1}. {q.text}
          </h3>

          <ul className="space-y-2">
            {q.options.map((o) => (
              <li
                key={o.id}
                className={`px-3 py-2 rounded border ${
                  q.correctOptionIds.includes(o.id)
                    ? "bg-green-50 border-green-400"
                    : "bg-gray-50"
                }`}
              >
                {o.text}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
