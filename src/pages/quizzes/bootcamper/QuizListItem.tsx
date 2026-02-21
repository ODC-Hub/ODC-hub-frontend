import { QuizResponse } from "@/api/quizApi";
import { Link } from "react-router-dom";

export default function QuizListItem({ quiz }: { quiz: QuizResponse }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <div>
        <h2 className="font-medium text-lg text-gray-900 dark:text-white">{quiz.title}</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {quiz.module} · {quiz.questions.length} questions ·{" "}
          {Math.round(quiz.durationSeconds / 60)} min
        </div>
      </div>

      <Link
        to={`/quizzes/${quiz.id}/take`}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Start
      </Link>
    </div>
  );
}
