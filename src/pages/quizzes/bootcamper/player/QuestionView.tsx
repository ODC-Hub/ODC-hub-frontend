import { QuizQuestion } from "@/api/quizApi";

interface Props {
  question: QuizQuestion;
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function QuestionView({
  question,
  selected,
  onChange,
}: Props) {

  const toggle = (id: string) => {
    if (question.type === "SINGLE") {
      onChange([id]);
    } else {
      onChange(
        selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id]
      );
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border space-y-4">
      <h2 className="text-lg font-medium">{question.text}</h2>

      <div className="space-y-3">
        {question.options.map((opt) => (
          <label
            key={opt.id}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type={question.type === "SINGLE" ? "radio" : "checkbox"}
              checked={
                question.type === "SINGLE"
                  ? selected[0] === opt.id
                  : selected.includes(opt.id)
              }
              onChange={() => toggle(opt.id)}
            />
            <span>{opt.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
