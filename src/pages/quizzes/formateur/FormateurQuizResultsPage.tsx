/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getAllQuizResultsForFormateur } from "@/api/quizApi";

export default function FormateurQuizResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllQuizResultsForFormateur()
      .then(setResults)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Quiz Results</h1>

      <div className="bg-white border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Bootcamper</th>
              <th className="p-3 text-left">Quiz</th>
              <th className="p-3 text-left">Module</th>
              <th className="p-3 text-center">Score</th>
              <th className="p-3 text-center">Result</th>
              <th className="p-3 text-center">Time</th>
              <th className="p-3 text-center">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{r.bootcamperName}</td>
                <td className="p-3">{r.quizTitle}</td>
                <td className="p-3">{r.module}</td>
                <td className="p-3 text-center">
                  {r.score}/{r.totalQuestions} ({r.percentage}%)
                </td>
                <td className="p-3 text-center">
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
                <td className="p-3 text-center">
                  {Math.floor(r.timeTakenSeconds / 60)} min
                </td>
                <td className="p-3 text-center">
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
