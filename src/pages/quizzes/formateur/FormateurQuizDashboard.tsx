// src/pages/quizzes/formateur/FormateurQuizDashboard.tsx
import { useEffect, useState } from "react";
import { getMyQuizzes, QuizAdminResponse } from "../../../api/quizApi";
import QuizCard from "./QuizCard";
import { Link } from "react-router-dom";

export default function FormateurQuizDashboard() {
  const [quizzes, setQuizzes] = useState<QuizAdminResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await getMyQuizzes();
        setQuizzes(data);
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500 dark:text-gray-400">Loading quizzes...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Quizzes</h1>
        <Link
          to="/quizzes/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Quiz
        </Link>
      </div>

      {/* Quiz list */}
      {quizzes.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 mt-10">
          No quizzes created yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onDeleted={(id) =>
                setQuizzes((prev) => prev.filter((q) => q.id !== id))
              }
            />
          ))}

        </div>
      )}
    </div>
  );
}
