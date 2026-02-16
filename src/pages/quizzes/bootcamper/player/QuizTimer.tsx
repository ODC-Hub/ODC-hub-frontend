import { useEffect } from "react";

interface Props {
  timeLeft: number;
  onTick: (v: number) => void;
}

export default function QuizTimer({ timeLeft, onTick }: Props) {
  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      onTick(timeLeft - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onTick]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">
      {minutes}:{seconds.toString().padStart(2, "0")}
    </div>
  );
}
