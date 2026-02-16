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
    return <div className="p-6">Loading quizzes...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Quizzes</h1>
        <Link
          to="/quizzes/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Create Quiz
        </Link>
      </div>

      {/* Stats */}
      {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Quizzes" value={quizzes.length} />
        <StatCard
          label="Total Questions"
          value={quizzes.reduce((acc, q) => acc + q.questions.length, 0)}
        />
        <StatCard
          label="Avg Questions / Quiz"
          value={
            quizzes.length
              ? Math.round(
                  quizzes.reduce((acc, q) => acc + q.questions.length, 0) /
                    quizzes.length
                )
              : 0
          }
        />
      </div>*/}

      {/* Quiz list */}
      {quizzes.length === 0 ? (
        <div className="text-gray-500 mt-10">
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

/*function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}*/
