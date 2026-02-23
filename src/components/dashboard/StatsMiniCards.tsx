import { useEffect, useState } from "react";
import { GitBranch, Target, Star, ClipboardList } from "lucide-react";
import { projectApi } from "../../api/filrouge";
import { getMyQuizResults, getAllQuizResultsForFormateur } from "../../api/quizApi";
import { resourceApi } from "../../api/resources";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

interface StatsData {
    sprintName: string;
    sprintDaysLeft: number | null;
    sprintVelocity: number;
    avgQuizScore: number;
    quizzesCompleted: number;
    pendingReviews: number;
    urgentReviews: number;
}

export default function StatsMiniCards() {
    const { user } = useAuth();
    const [stats, setStats] = useState<StatsData>({
        sprintName: "No Active Sprint",
        sprintDaysLeft: null,
        sprintVelocity: 0,
        avgQuizScore: 0,
        quizzesCompleted: 0,
        pendingReviews: 0,
        urgentReviews: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const results = await Promise.allSettled([
                    projectApi.getAllProjects(),
                    user?.role === "BOOTCAMPER"
                        ? getMyQuizResults()
                        : getAllQuizResultsForFormateur(),
                    resourceApi.getAllResources(false),
                ]);

                // Sprint data
                let sprintName = "No Active Sprint";
                let sprintDaysLeft: number | null = null;
                let sprintVelocity = 0;

                if (results[0].status === "fulfilled" && results[0].value.length > 0) {
                    const projects = results[0].value;
                    // Try to get KPIs for the first project
                    try {
                        const kpi = await projectApi.getProjectKpis(projects[0].id);
                        sprintVelocity = Math.round(kpi.globalProgress);
                        // Find active sprint name from sprints
                        const { sprintApi } = await import("../../api/filrouge");
                        const sprints = await sprintApi.getSprintsByProject(projects[0].id);
                        const activeSprint = sprints.find((s) => s.status === "ACTIVE");
                        if (activeSprint) {
                            sprintName = activeSprint.name;
                            if (activeSprint.endDate) {
                                const end = new Date(activeSprint.endDate);
                                const now = new Date();
                                const diff = Math.ceil(
                                    (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                                );
                                sprintDaysLeft = Math.max(0, diff);
                            }
                        }
                    } catch {
                        /* no KPI available yet */
                    }
                }

                // Quiz data
                let avgQuizScore = 0;
                let quizzesCompleted = 0;
                if (results[1].status === "fulfilled") {
                    const quizResults = results[1].value as {
                        percentage: number;
                        score?: number;
                    }[];
                    quizzesCompleted = quizResults.length;
                    if (quizResults.length > 0) {
                        avgQuizScore = Math.round(
                            quizResults.reduce((sum, r) => sum + r.percentage, 0) /
                            quizResults.length
                        );
                    }
                }

                // Pending reviews (FORMATEUR)
                let pendingReviews = 0;
                let urgentReviews = 0;
                if (results[2].status === "fulfilled" && user?.role === "FORMATEUR") {
                    const resources = results[2].value;
                    resources.forEach((r) => {
                        pendingReviews += r.pendingSubmissions ?? 0;
                    });
                    urgentReviews = Math.floor(pendingReviews * 0.4); // heuristic: 40% urgent
                }

                setStats({
                    sprintName,
                    sprintDaysLeft,
                    sprintVelocity,
                    avgQuizScore,
                    quizzesCompleted,
                    pendingReviews,
                    urgentReviews,
                });
            } catch (err) {
                console.error("Failed to load stats", err);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [user]);

    const cards = [
        {
            label: "ACTIVE SPRINT",
            value: stats.sprintName,
            sub: stats.sprintDaysLeft !== null ? `${stats.sprintDaysLeft} days remaining` : "No deadline set",
            subColor: "#FF6B35",
            icon: GitBranch,
            iconBg: "rgba(255,107,53,0.15)",
            iconColor: "#FF6B35",
            link: "/projects",
        },
        {
            label: "SPRINT VELOCITY",
            value: `${stats.sprintVelocity}%`,
            sub: "Completion rate",
            subColor: "#FF6B35",
            icon: Target,
            iconBg: "rgba(255,107,53,0.15)",
            iconColor: "#FF6B35",
            link: "/projects",
        },
        {
            label: user?.role === "FORMATEUR" ? "CLASS AVG SCORE" : "AVG QUIZ SCORE",
            value: `${stats.avgQuizScore}%`,
            sub:
                user?.role === "BOOTCAMPER"
                    ? `${stats.quizzesCompleted} completed`
                    : `${stats.quizzesCompleted} attempts`,
            subColor: "#28A745",
            icon: Star,
            iconBg: "rgba(40,167,69,0.15)",
            iconColor: "#28A745",
            link: user?.role === "FORMATEUR" ? "/quizzes/formateur" : "/quizzes",
        },
        {
            label: user?.role === "FORMATEUR" ? "PENDING REVIEWS" : "MY SUBMISSIONS",
            value:
                user?.role === "FORMATEUR"
                    ? stats.pendingReviews.toString()
                    : stats.quizzesCompleted.toString(),
            sub:
                user?.role === "FORMATEUR"
                    ? `${stats.urgentReviews} urgent`
                    : "Track progress",
            subColor: user?.role === "FORMATEUR" ? "#DC3545" : "#28A745",
            icon: ClipboardList,
            iconBg:
                user?.role === "FORMATEUR"
                    ? "rgba(220,53,69,0.15)"
                    : "rgba(40,167,69,0.15)",
            iconColor: user?.role === "FORMATEUR" ? "#DC3545" : "#28A745",
            link:
                user?.role === "FORMATEUR" ? "/homework-reviews" : "/my-submissions",
        },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => {
                const Icon = card.icon;
                return (
                    <Link
                        to={card.link}
                        key={i}
                        className="block group rounded-2xl p-5 backdrop-blur-sm transition-all duration-250 hover:-translate-y-0.5
                                   bg-white border border-gray-200 shadow-sm
                                   dark:bg-white/5 dark:border-white/8 dark:shadow-[0_4px_24px_rgba(0,0,0,0.15)]
                                   no-underline"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <p className="text-xs font-semibold tracking-widest text-gray-400 dark:text-white/50">
                                {card.label}
                            </p>
                            <div
                                className="flex items-center justify-center w-9 h-9 rounded-xl"
                                style={{ background: card.iconBg }}
                            >
                                <Icon size={18} style={{ color: card.iconColor }} />
                            </div>
                        </div>
                        <p className="text-2xl font-bold mb-1 text-gray-900 dark:text-[#F4F4F4]">
                            {loading ? (
                                <span className="inline-block w-16 h-6 rounded animate-pulse bg-gray-200 dark:bg-white/10" />
                            ) : (
                                card.value
                            )}
                        </p>
                        <p className="text-xs font-medium" style={{ color: card.subColor }}>
                            {loading ? "Loading..." : card.sub}
                        </p>
                    </Link>
                );
            })}
        </div>
    );
}
