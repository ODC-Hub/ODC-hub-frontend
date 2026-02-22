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

  if (loading) return <div className="p-6 text-gray-700 dark:text-gray-300">Loading…</div>;
  if (!quiz) return <div className="p-6 text-gray-700 dark:text-gray-300">Quiz not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        {quiz.title}
      </h1>

      {quiz.questions.map((q, index) => (
        <div
          key={q.id}
          className="
            rounded-xl p-5 space-y-3
            border
            bg-white dark:bg-gray-900
            border-gray-200 dark:border-gray-700
          "
        >
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {index + 1}. {q.text}
          </h3>

          <ul className="space-y-2">
            {q.options.map((o) => {
              const isCorrect = q.correctOptionIds.includes(o.id);

              return (
                <li
                  key={o.id}
                  className={`
                    px-3 py-2 rounded border
                    text-gray-800 dark:text-gray-100
                    ${
                      isCorrect
                        ? "bg-green-50 border-green-400 dark:bg-green-900/30 dark:border-green-500"
                        : "bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    }
                  `}
                >
                  {o.text}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}