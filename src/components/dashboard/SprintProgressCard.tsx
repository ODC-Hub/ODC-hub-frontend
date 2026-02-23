import { useEffect, useState } from "react";
import { GitBranch, ExternalLink } from "lucide-react";
import { projectApi } from "../../api/filrouge";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

interface SprintData {
    sprintName: string;
    progress: number;
    daysLeft: number | null;
    totalItems: number;
    doneItems: number;
    projectName: string;
    projectId: string;
}

function GaugeChart({ progress, isDark }: { progress: number; isDark: boolean }) {
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = Math.PI * normalizedRadius; // half circle
    const offset = circumference * (1 - progress / 100);

    const getColor = (p: number) => {
        if (p >= 75) return "#28A745";
        if (p >= 40) return "#FF6B35";
        return "#DC3545";
    };

    const color = getColor(progress);
    const textFill = isDark ? "#F4F4F4" : "#111111";
    const subFill = isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.45)";
    const labelFill = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";
    const trackStroke = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

    return (
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 110 }}>
            <svg
                width="200"
                height="110"
                viewBox="0 0 200 110"
                style={{ overflow: "visible" }}
            >
                {/* Track */}
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={trackStroke}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                />
                {/* Progress arc */}
                <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={offset}
                    style={{
                        transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        filter: `drop-shadow(0 0 8px ${color}80)`,
                    }}
                />
                {/* Center text */}
                <text
                    x="100"
                    y="88"
                    textAnchor="middle"
                    style={{ fontSize: "28px", fontWeight: 700, fill: textFill, fontFamily: "inherit" }}
                >
                    {progress}%
                </text>
                <text
                    x="100"
                    y="106"
                    textAnchor="middle"
                    style={{ fontSize: "11px", fill: subFill, fontFamily: "inherit" }}
                >
                    completion
                </text>
                {/* Labels */}
                <text x="18" y="116" textAnchor="middle" style={{ fontSize: "11px", fill: labelFill }}>0%</text>
                <text x="182" y="116" textAnchor="middle" style={{ fontSize: "11px", fill: labelFill }}>100%</text>
            </svg>
        </div>
    );
}

export default function SprintProgressCard() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [data, setData] = useState<SprintData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const projects = await projectApi.getAllProjects();
                if (!projects || projects.length === 0) {
                    setData(null);
                    setLoading(false);
                    return;
                }

                const project = projects[0];
                const [kpi, sprints] = await Promise.all([
                    projectApi.getProjectKpis(project.id),
                    projectApi.getAllProjects(), // just to type-check, use sprint API below
                ]);

                const { sprintApi, workItemApi } = await import("../../api/filrouge");
                const sprintList = await sprintApi.getSprintsByProject(project.id);
                const activeSprint = sprintList.find((s) => s.status === "ACTIVE") ?? sprintList[sprintList.length - 1];

                let doneItems = 0;
                let totalItems = 0;

                if (activeSprint) {
                    try {
                        const items = await workItemApi.getKanban(activeSprint.id);
                        totalItems = items.length;
                        doneItems = items.filter((i) => i.status === "DONE").length;
                    } catch {
                        // ignore
                    }
                }

                let daysLeft: number | null = null;
                if (activeSprint?.endDate) {
                    const end = new Date(activeSprint.endDate);
                    const now = new Date();
                    daysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
                }

                setData({
                    sprintName: activeSprint?.name ?? "Sprint",
                    progress: Math.round(kpi.globalProgress),
                    daysLeft,
                    totalItems,
                    doneItems,
                    projectName: project.name,
                    projectId: project.id,
                });
            } catch (e) {
                console.error("Sprint data load failed", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return (
        <div className="rounded-2xl p-7 backdrop-blur-md h-full
                        bg-white border border-gray-200 shadow-md
                        dark:bg-[rgba(18,18,18,0.7)] dark:border-white/8 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl"
                        style={{ background: "rgba(255,107,53,0.15)" }}
                    >
                        <GitBranch size={20} style={{ color: "#FF6B35" }} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-gray-400 dark:text-white/45">
                            FIL ROUGE PROJECT
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-[#F4F4F4]">
                            Sprint Progress
                        </p>
                    </div>
                </div>
                {data && (
                    <Link
                        to={`/projects/${data.projectId}`}
                        className="flex items-center gap-1.5 text-xs font-medium rounded-lg px-3 py-1.5 transition-all"
                        style={{
                            color: "#FF6B35",
                            background: "rgba(255,107,53,0.1)",
                            border: "1px solid rgba(255,107,53,0.2)",
                        }}
                    >
                        <ExternalLink size={12} />
                        View Board
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-48 h-28 rounded-xl animate-pulse bg-gray-200 dark:bg-white/6" />
                    <div className="w-32 h-4 rounded animate-pulse bg-gray-200 dark:bg-white/6" />
                </div>
            ) : error || !data ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <GitBranch size={40} style={{ color: "rgba(255,255,255,0.15)" }} className="mb-3" />
                    <p className="text-sm font-medium text-gray-400 dark:text-white/50">
                        No active project yet
                    </p>
                    <Link
                        to="/projects"
                        className="mt-3 text-xs font-semibold rounded-lg px-4 py-2"
                        style={{ background: "#FF6B35", color: "#fff" }}
                    >
                        Create a Project
                    </Link>
                </div>
            ) : (
                <>
                    <div className="flex flex-col items-center">
                        <p className="text-xs font-semibold mb-1 text-gray-400 dark:text-white/50">
                            {data.projectName}
                        </p>
                        <p className="text-base font-bold mb-4 text-gray-900 dark:text-[#F4F4F4]">
                            {data.sprintName}
                        </p>
                        <GaugeChart progress={data.progress} isDark={isDark} />
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-6">
                        <div className="text-center rounded-xl py-3 bg-gray-100 border border-gray-200 dark:bg-white/4 dark:border-white/6">
                            <p className="text-lg font-bold text-gray-900 dark:text-[#F4F4F4]">
                                {data.daysLeft !== null ? data.daysLeft : "—"}
                            </p>
                            <p className="text-xs mt-0.5 text-gray-400 dark:text-white/40">
                                Days Left
                            </p>
                        </div>
                        <div className="text-center rounded-xl py-3 bg-gray-100 border border-gray-200 dark:bg-white/4 dark:border-white/6">
                            <p className="text-lg font-bold" style={{ color: "#28A745" }}>
                                {data.doneItems}
                            </p>
                            <p className="text-xs mt-0.5 text-gray-400 dark:text-white/40">
                                Done
                            </p>
                        </div>
                        <div className="text-center rounded-xl py-3 bg-gray-100 border border-gray-200 dark:bg-white/4 dark:border-white/6">
                            <p className="text-lg font-bold text-gray-900 dark:text-[#F4F4F4]">
                                {data.totalItems}
                            </p>
                            <p className="text-xs mt-0.5 text-gray-400 dark:text-white/40">
                                Total
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
