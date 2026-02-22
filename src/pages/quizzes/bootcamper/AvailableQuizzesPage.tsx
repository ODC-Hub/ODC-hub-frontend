import { useEffect, useState } from "react";
import { getAvailableQuizzes, QuizResponse } from "../../../api/quizApi";
import QuizListItem from "./QuizListItem";

export default function AvailableQuizzesPage() {
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getAvailableQuizzes();
        setQuizzes(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-500 dark:text-gray-400">Loading quizzes…</div>;
  }

  if (quizzes.length === 0) {
    return <div className="p-6 text-gray-500 dark:text-gray-400">No quizzes available</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Available Quizzes</h1>

      <div className="space-y-4">
        {quizzes.map((quiz) => (
          <QuizListItem key={quiz.id} quiz={quiz} />
        ))}
      </div>
    </div>
  );
}
