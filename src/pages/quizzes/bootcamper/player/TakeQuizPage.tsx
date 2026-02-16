/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import QuizTimer from "./QuizTimer";
import QuestionView from "./QuestionView";

import { getQuizForBootcamper, QuizResponse, submitQuiz } from "@/api/quizApi";

export default function TakeQuizPage() {
  const { quizId } = useParams<{ quizId?: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ persists across renders
  const startTimeRef = useRef<number>(Date.now());

  /* ================= FETCH QUIZ ================= */

  useEffect(() => {
  // 🚨 HARD GUARD
  if (!quizId) return;
  if (quizId === "my-results") return;

  const fetchQuiz = async () => {
    try {
      const data = await getQuizForBootcamper(quizId);
      setQuiz(data);
      setTimeLeft(data.durationSeconds);
      startTimeRef.current = Date.now();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  fetchQuiz();
}, [quizId]);


  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    if (!quiz || submitting) return;

    setSubmitting(true);

    try {
      const timeTakenSeconds = Math.floor(
        (Date.now() - startTimeRef.current) / 1000
      );

      const result = await submitQuiz(quiz.id, {
        answers,
        timeTakenSeconds,
      });

      navigate("/quizzes/my-results", { state: result });
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert("You already submitted this quiz.");
        navigate("/quizzes/my-results");
      } else {
        alert("Failed to submit quiz");
        setSubmitting(false);
      }
    }


  };

  /* ================= AUTO SUBMIT ================= */

  useEffect(() => {
    if (timeLeft === 0 && quiz && !submitting) {
      handleSubmit();
    }
  }, [timeLeft, quiz, submitting]);

  /* ================= UI STATES ================= */

  if (loading) {
    return <div className="p-6">Loading quiz…</div>;
  }

  if (!quiz) {
    return <div className="p-6">Quiz not found</div>;
  }

  const currentQuestion = quiz.questions[currentIndex];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">{quiz.title}</h1>
        <QuizTimer timeLeft={timeLeft} onTick={setTimeLeft} />
      </div>

      {/* Question */}
      <QuestionView
        question={currentQuestion}
        selected={answers[currentQuestion.id] || []}
        onChange={(opts) =>
          setAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: opts,
          }))
        }
      />

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-50"
        >
          Previous
        </button>

        <span className="text-sm text-gray-500">
          Question {currentIndex + 1} / {quiz.questions.length}
        </span>

        {currentIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex((i) => i + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
