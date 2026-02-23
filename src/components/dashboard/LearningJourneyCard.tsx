import { BookOpen, ArrowRight, FileText, Code2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { resourceApi } from "../../api/resources";
import { ResourceResponse } from "../../types/resource";

const modules = [
    { id: "html-css-js", title: "HTML, CSS & JavaScript", category: "Frontend", progress: 100 },
    { id: "typescript", title: "TypeScript", category: "Frontend", progress: 85 },
    { id: "react", title: "React.js", category: "Frontend", progress: 60 },
    { id: "angular", title: "Angular", category: "Frontend", progress: 10 },
    { id: "java", title: "Java", category: "Backend", progress: 0 },
    { id: "spring-boot", title: "Spring Boot", category: "Backend", progress: 0 },
];

const currentModuleIndex = modules.findIndex((m) => m.progress > 0 && m.progress < 100);
const currentModule = modules[currentModuleIndex !== -1 ? currentModuleIndex : 2];

function ResourceTypeIcon({ type }: { type: string }) {
    if (type === "PDF") return <FileText size={16} style={{ color: "#FF6B35" }} />;
    if (type === "ATELIER" || type === "LINK") return <Code2 size={16} style={{ color: "#28A745" }} />;
    return <Video size={16} style={{ color: "#7C3AED" }} />;
}

function ResourceTypeBadge({ type }: { type: string }) {
    const configs: Record<string, { label: string; bg: string; color: string }> = {
        PDF: { label: "PDF", bg: "rgba(255,107,53,0.15)", color: "#FF6B35" },
        ATELIER: { label: "Workshop", bg: "rgba(40,167,69,0.15)", color: "#28A745" },
        LINK: { label: "Link", bg: "rgba(40,167,69,0.15)", color: "#28A745" },
        HOMEWORK: { label: "Homework", bg: "rgba(220,53,69,0.15)", color: "#DC3545" },
    };
    const cfg = configs[type] ?? { label: type, bg: "rgba(255,255,255,0.1)", color: "#F4F4F4" };
    return (
        <span
            className="text-xs font-semibold rounded-full px-2 py-0.5"
            style={{ background: cfg.bg, color: cfg.color }}
        >
            {cfg.label}
        </span>
    );
}

export default function LearningJourneyCard() {
    const [recentResources, setRecentResources] = useState<ResourceResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        resourceApi
            .getAllResources(true)
            .then((data) => {
                const sorted = [...data]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 4);
                setRecentResources(sorted);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="rounded-2xl p-7 backdrop-blur-md flex flex-col gap-5
                        bg-white border border-gray-200 shadow-md
                        dark:bg-[rgba(18,18,18,0.7)] dark:border-white/8 dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            {/* Current Module */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl"
                        style={{ background: "rgba(124,58,237,0.15)" }}
                    >
                        <BookOpen size={20} style={{ color: "#7C3AED" }} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-gray-400 dark:text-white/45">
                            LEARNING JOURNEY
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-[#F4F4F4]">
                            Current Module
                        </p>
                    </div>
                </div>

                <div
                    className="rounded-2xl p-5"
                    style={{
                        background: "linear-gradient(135deg, rgba(124,58,237,0.2) 0%, rgba(124,58,237,0.05) 100%)",
                        border: "1px solid rgba(124,58,237,0.25)",
                    }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <span
                                className="inline-block text-xs font-semibold rounded-full px-3 py-1 mb-2"
                                style={{ background: "rgba(124,58,237,0.25)", color: "#A78BFA" }}
                            >
                                {currentModule.category}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-[#F4F4F4]">
                                {currentModule.title}
                            </h3>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5 text-gray-400 dark:text-white/50">
                            <span>Progress</span>
                            <span style={{ color: "#A78BFA" }}>{currentModule.progress}%</span>
                        </div>
                        <div
                            className="w-full rounded-full overflow-hidden"
                            style={{ height: 6, background: "rgba(255,255,255,0.1)" }}
                        >
                            <div
                                className="h-full rounded-full"
                                style={{
                                    width: `${currentModule.progress}%`,
                                    background: "linear-gradient(90deg, #7C3AED, #A78BFA)",
                                    transition: "width 1s ease",
                                    boxShadow: "0 0 8px rgba(124,58,237,0.6)",
                                }}
                            />
                        </div>
                    </div>

                    <Link
                        to={`/learning/${currentModule.id}`}
                        className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-sm font-semibold transition-all"
                        style={{
                            background: "#7C3AED",
                            color: "#fff",
                            boxShadow: "0 4px 16px rgba(124,58,237,0.4)",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#6D28D9";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "#7C3AED";
                        }}
                    >
                        Continue Learning <ArrowRight size={16} />
                    </Link>
                </div>
            </div>

            {/* Quick Resources */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold tracking-widest text-gray-400 dark:text-white/45">
                        QUICK RESOURCES
                    </p>
                    <Link
                        to="/resources"
                        className="text-xs font-semibold"
                        style={{ color: "#FF6B35" }}
                    >
                        View All →
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-full h-12 rounded-xl animate-pulse bg-gray-200 dark:bg-white/5" />
                        ))}
                    </div>
                ) : recentResources.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-400 dark:text-white/35">
                            No resources uploaded yet
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recentResources.map((res) => (
                            <div
                                key={res.id}
                                className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all
                                           bg-gray-50 border border-gray-200
                                           dark:bg-white/4 dark:border-white/6"
                            >
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 bg-gray-200 dark:bg-white/6">
                                    <ResourceTypeIcon type={res.type} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate text-gray-900 dark:text-[#F4F4F4]">
                                        {res.title}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-white/35">
                                        {new Date(res.createdAt).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </p>
                                </div>
                                <ResourceTypeBadge type={res.type} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
