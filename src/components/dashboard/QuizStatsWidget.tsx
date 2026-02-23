import { useEffect, useState } from "react";
import { Star, TrendingUp, CheckCircle } from "lucide-react";
import { getMyQuizResults, getAllQuizResultsForFormateur, QuizAttemptResponse } from "../../api/quizApi";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

interface QuizStats {
    avgScore: number;
    completed: number;
    passed: number;
    recent: QuizAttemptResponse[];
}

function ScoreRing({ score, isDark }: { score: number; isDark: boolean }) {
    const radius = 44;
    const stroke = 8;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference * (1 - score / 100);
    const color = score >= 75 ? "#28A745" : score >= 50 ? "#FF6B35" : "#DC3545";
    const trackStroke = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    return (
        <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} fill="none" stroke={trackStroke} strokeWidth={stroke} />
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    style={{
                        transformOrigin: "50% 50%",
                        transform: "rotate(-90deg)",
                        transition: "stroke-dashoffset 1.2s ease",
                        filter: `drop-shadow(0 0 6px ${color}80)`,
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-gray-900 dark:text-[#F4F4F4]">
                    {score}%
                </span>
            </div>
        </div>
    );
}

export default function QuizStatsWidget() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [stats, setStats] = useState<QuizStats>({
        avgScore: 0,
        completed: 0,
        passed: 0,
        recent: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                let results: QuizAttemptResponse[] = [];
                if (user?.role === "BOOTCAMPER") {
                    results = await getMyQuizResults();
                } else {
                    results = await getAllQuizResultsForFormateur();
                }

                const completed = results.length;
                const passed = results.filter((r) => r.passed).length;
                const avgScore =
                    completed > 0
                        ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / completed)
                        : 0;
                const recent = results
                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                    .slice(0, 3);

                setStats({ avgScore, completed, passed, recent });
            } catch (e) {
                console.error("Quiz stats error", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    return (
        <div className="rounded-2xl p-7 backdrop-blur-md h-full
                        bg-white border border-gray-200 shadow-md
                        dark:bg-[rgba(18,18,18,0.7)] dark:border-white/8 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-3 mb-6">
                <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl"
                    style={{ background: "rgba(40,167,69,0.15)" }}
                >
                    <Star size={20} style={{ color: "#28A745" }} />
                </div>
                <div>
                    <p className="text-xs font-semibold tracking-widest text-gray-400 dark:text-white/45">
                        QUIZ & EVALUATION
                    </p>
                    <p className="text-sm font-bold text-gray-900 dark:text-[#F4F4F4]">
                        Performance Overview
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-full animate-pulse bg-gray-200 dark:bg-white/6" />
                    <div className="flex-1 space-y-3">
                        <div className="w-full h-12 rounded-xl animate-pulse bg-gray-200 dark:bg-white/6" />
                        <div className="w-full h-12 rounded-xl animate-pulse bg-gray-200 dark:bg-white/6" />
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Row */}
                    <div className="flex items-center gap-6 mb-6">
                        <ScoreRing score={stats.avgScore} isDark={isDark} />
                        <div className="flex-1 grid grid-cols-1 gap-3">
                            <div
                                className="rounded-xl px-4 py-3"
                                style={{
                                    background: "rgba(40,167,69,0.08)",
                                    border: "1px solid rgba(40,167,69,0.2)",
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 dark:text-white/50">
                                            Quizzes Completed
                                        </p>
                                        <p className="text-2xl font-bold mt-0.5 text-gray-900 dark:text-[#F4F4F4]">
                                            {stats.completed}
                                        </p>
                                    </div>
                                    <CheckCircle size={28} style={{ color: "#28A745", opacity: 0.7 }} />
                                </div>
                            </div>
                            <div
                                className="rounded-xl px-4 py-3"
                                style={{
                                    background: "rgba(255,107,53,0.08)",
                                    border: "1px solid rgba(255,107,53,0.2)",
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 dark:text-white/50">
                                            Passed
                                        </p>
                                        <p className="text-2xl font-bold mt-0.5 text-gray-900 dark:text-[#F4F4F4]">
                                            {stats.passed}
                                            <span className="text-sm font-normal ml-1 text-gray-400 dark:text-white/40">
                                                / {stats.completed}
                                            </span>
                                        </p>
                                    </div>
                                    <TrendingUp size={28} style={{ color: "#FF6B35", opacity: 0.7 }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Results */}
                    {stats.recent.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold tracking-widest mb-3 text-gray-400 dark:text-white/35">
                                RECENT ATTEMPTS
                            </p>
                            <div className="space-y-2">
                                {stats.recent.map((r, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between rounded-xl px-4 py-2.5
                                                   bg-gray-50 border border-gray-200
                                                   dark:bg-white/4 dark:border-white/6"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-[#F4F4F4]">
                                                {r.quizTitle}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-white/35">
                                                {r.module}
                                            </p>
                                        </div>
                                        <span
                                            className="text-sm font-bold px-3 py-1 rounded-lg"
                                            style={{
                                                background: r.passed ? "rgba(40,167,69,0.15)" : "rgba(220,53,69,0.15)",
                                                color: r.passed ? "#28A745" : "#DC3545",
                                            }}
                                        >
                                            {Math.round(r.percentage)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {stats.completed === 0 && (
                        <div className="text-center py-4">
                            <p className="text-sm mb-3 text-gray-400 dark:text-white/40">
                                No quiz attempts yet
                            </p>
                            <Link
                                to={user?.role === "FORMATEUR" ? "/quizzes/formateur" : "/quizzes"}
                                className="text-xs font-semibold rounded-lg px-4 py-2"
                                style={{ background: "#28A745", color: "#fff" }}
                            >
                                {user?.role === "FORMATEUR" ? "Manage Quizzes" : "Take a Quiz"}
                            </Link>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
