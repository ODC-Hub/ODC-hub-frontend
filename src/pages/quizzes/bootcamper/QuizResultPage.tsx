import { QuizResultResponse } from "@/api/quizApi";
import { useLocation, Link } from "react-router-dom";

export default function QuizResultPage() {
  const state = useLocation().state as QuizResultResponse | null;

  if (!state) {
    return <div className="p-6">No result available</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto text-center space-y-6">
      <h1 className="text-2xl font-semibold">Quiz Result</h1>

      <div
        className={`p-6 rounded-xl text-white ${
          state.passed ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <div className="text-4xl font-bold">{state.percentage}%</div>
        <div className="mt-2">
          {state.passed ? "Passed 🎉" : "Failed ❌"}
        </div>
      </div>

      <div className="text-gray-600">
        Score: {state.score} / {state.totalQuestions}
      </div>

      <Link
        to="/quizzes"
        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Back to quizzes
      </Link>
    </div>
  );
}
