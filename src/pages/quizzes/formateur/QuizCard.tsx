import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
import { QuizAdminResponse, deleteQuiz } from "@/api/quizApi";

interface Props {
  quiz: QuizAdminResponse;
  onDeleted?: (id: string) => void;
}

export default function QuizCard({ quiz, onDeleted }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteQuiz(quiz.id);
      onDeleted?.(quiz.id);
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };


  return (
    <>
      <div className="relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
        <button
          onClick={() => setConfirmOpen(true)}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
        >
          <Trash2 size={16} />
        </button>

        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{quiz.title}</h3>

        <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
          {quiz.module}
        </span>

        <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
          {quiz.questions.length} questions ·{" "}
          {Math.round(quiz.durationSeconds / 60)} min
        </div>

        <div className="mt-4 flex gap-4 text-sm">
          <Link to={`/quizzes/${quiz.id}/preview`} className="text-blue-600 dark:text-blue-400 hover:underline">
            View
          </Link>

          {quiz.editable ? (
            <Link to={`/quizzes/${quiz.id}/edit`} className="text-gray-600 dark:text-gray-400 hover:underline">
              Edit
            </Link>
          ) : (
            <span
              title="This quiz already has attempts"
              className="text-gray-400 dark:text-gray-500 cursor-not-allowed"
            >
              Edit
            </span>
          )}

        </div>
      </div>

      <ConfirmationDialog
        open={confirmOpen}
        title="Delete quiz"
        message={`Delete "${quiz.title}" permanently?`}
        danger
        confirmText={deleting ? "Deleting…" : "Delete"}
        cancelText="Cancel"
        confirmDisabled={deleting}
        onCancel={() => !deleting && setConfirmOpen(false)}
        onConfirm={handleDelete}
      />

    </>
  );
}
