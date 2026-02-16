import { QuizQuestion, QuestionType } from "./quizBuilder.types";

interface Props {
  index: number;
  question: QuizQuestion;
  onChange: (q: QuizQuestion) => void;
  onDelete: (id: string) => void;
}

export default function QuestionCard({
  index,
  question,
  onChange,
  onDelete,
}: Props) {
  const addOption = () => {
    onChange({
      ...question,
      options: [
        ...question.options,
        { id: crypto.randomUUID(), text: "" },
      ],
    });
  };

  const updateOptionText = (optionId: string, text: string) => {
    onChange({
      ...question,
      options: question.options.map((o) =>
        o.id === optionId ? { ...o, text } : o
      ),
    });
  };

  const removeOption = (optionId: string) => {
    onChange({
      ...question,
      options: question.options.filter((o) => o.id !== optionId),
      correctOptionIds: question.correctOptionIds.filter(
        (id) => id !== optionId
      ),
    });
  };

  const toggleCorrect = (optionId: string) => {
    if (question.type === "SINGLE") {
      onChange({
        ...question,
        correctOptionIds: [optionId],
      });
    } else {
      onChange({
        ...question,
        correctOptionIds: question.correctOptionIds.includes(optionId)
          ? question.correctOptionIds.filter((id) => id !== optionId)
          : [...question.correctOptionIds, optionId],
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">
            Question {index + 1}
          </h3>
          <p className="text-xs text-gray-400">
            Choose the correct answer(s)
          </p>
        </div>
        <button
          onClick={() => onDelete(question.id)}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      {/* Question text */}
      <textarea
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Enter the question text"
        value={question.text}
        onChange={(e) =>
          onChange({ ...question, text: e.target.value })
        }
      />

      {/* Question type */}
      <select
        className="border rounded-lg px-3 py-2 w-52"
        value={question.type}
        onChange={(e) =>
          onChange({
            ...question,
            type: e.target.value as QuestionType,
            correctOptionIds: [],
          })
        }
      >
        <option value="SINGLE">Single answer</option>
        <option value="MULTIPLE">Multiple answers</option>
      </select>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, idx) => (
          <div
            key={option.id}
            className="flex items-center gap-3"
          >
            <input
              type={question.type === "SINGLE" ? "radio" : "checkbox"}
              checked={question.correctOptionIds.includes(option.id)}
              onChange={() => toggleCorrect(option.id)}
            />

            <input
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder={`Option ${idx + 1}`}
              value={option.text}
              onChange={(e) =>
                updateOptionText(option.id, e.target.value)
              }
            />

            <button
              onClick={() => removeOption(option.id)}
              className="text-sm text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addOption}
        className="text-sm text-blue-600 hover:underline"
      >
        + Add option
      </button>
    </div>
  );
}
