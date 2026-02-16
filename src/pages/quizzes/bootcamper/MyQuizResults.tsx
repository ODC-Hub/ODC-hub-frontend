import { useEffect, useState } from "react";
import { getMyQuizResults, QuizAttemptResponse} from "../../../api/quizApi";

export default function MyQuizResults() {
  const [results, setResults] = useState<QuizAttemptResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getMyQuizResults();
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return <div className="p-6">Loading results…</div>;
  }

  if (results.length === 0) {
    return (
      <div className="p-6 text-gray-500">
        You haven’t completed any quizzes yet.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">My Quiz Results</h1>

      <div className="overflow-x-auto bg-white border rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Quiz</th>
              <th className="p-3">Module</th>
              <th className="p-3">Score</th>
              <th className="p-3">Result</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.quizId} className="border-t">
                <td className="p-3 font-medium">{r.quizTitle}</td>
                <td className="p-3">{r.module}</td>
                <td className="p-3">
                  {r.score}/{r.totalQuestions} ({r.percentage}%)
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      r.passed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {r.passed ? "Passed" : "Failed"}
                  </span>
                </td>
                <td className="p-3 text-gray-500">
                  {new Date(r.submittedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
