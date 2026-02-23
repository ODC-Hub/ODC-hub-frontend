import { useEffect, useState } from "react";
import { ClipboardList, CheckCircle, Clock, XCircle, ChevronRight } from "lucide-react";
import { resourceApi } from "../../api/resources";
import { LivrableResponse } from "../../types/resource";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

type Status = "PENDING" | "VALIDATED" | "REJECTED";

function StatusBadge({ status }: { status: Status }) {
    const config = {
        PENDING: { label: "Under Review", color: "#FF6B35", bg: "rgba(255,107,53,0.12)", icon: Clock },
        VALIDATED: { label: "Graded ✓", color: "#28A745", bg: "rgba(40,167,69,0.12)", icon: CheckCircle },
        REJECTED: { label: "Returned", color: "#DC3545", bg: "rgba(220,53,69,0.12)", icon: XCircle },
    };
    const { label, color, bg, icon: Icon } = config[status];
    return (
        <span
            className="inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1"
            style={{ background: bg, color }}
        >
            <Icon size={11} />
            {label}
        </span>
    );
}

// BOOTCAMPER: Submissions timeline
function BootcamperView({ submissions, loading }: { submissions: LivrableResponse[]; loading: boolean }) {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-16 rounded-xl animate-pulse bg-gray-200 dark:bg-white/5" />
                ))}
            </div>
        );
    }

    if (submissions.length === 0) {
        return (
            <div className="text-center py-8">
                <ClipboardList size={40} className="mx-auto mb-3 text-gray-300 dark:text-white/15" />
                <p className="text-sm text-gray-400 dark:text-white/40">
                    No submissions yet
                </p>
                <Link
                    to="/resources"
                    className="mt-3 inline-block text-xs font-semibold rounded-lg px-4 py-2"
                    style={{ background: "#FF6B35", color: "#fff" }}
                >
                    View Homework
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {submissions.slice(0, 4).map((sub) => {
                const steps: { label: string; done: boolean; active: boolean }[] = [
                    { label: "Submitted", done: true, active: sub.status === "PENDING" },
                    {
                        label: "Under Review",
                        done: sub.status !== "PENDING",
                        active: sub.status === "PENDING",
                    },
                    {
                        label: "Graded",
                        done: sub.status === "VALIDATED" || sub.status === "REJECTED",
                        active: false,
                    },
                ];

                return (
                    <div
                        key={sub.id}
                        className="rounded-xl p-4 bg-gray-50 border border-gray-200 dark:bg-white/4 dark:border-white/6"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-[#F4F4F4]">
                                    Homework Submission
                                </p>
                                <p className="text-xs mt-0.5 text-gray-400 dark:text-white/40">
                                    {new Date(sub.submittedAt).toLocaleDateString("en-US", {
                                        month: "short", day: "numeric", year: "numeric"
                                    })}
                                </p>
                            </div>
                            <StatusBadge status={sub.status} />
                        </div>

                        {/* Timeline */}
                        <div className="flex items-center gap-0">
                            {steps.map((step, i) => (
                                <div key={i} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="w-5 h-5 rounded-full flex items-center justify-center"
                                            style={{
                                                background: step.done
                                                    ? sub.status === "REJECTED" && i === 2
                                                        ? "rgba(220,53,69,0.3)"
                                                        : "rgba(40,167,69,0.3)"
                                                    : "rgba(255,255,255,0.1)",
                                                border: `2px solid ${step.done
                                                    ? sub.status === "REJECTED" && i === 2
                                                        ? "#DC3545"
                                                        : "#28A745"
                                                    : "rgba(255,255,255,0.2)"
                                                    }`,
                                            }}
                                        >
                                            {step.done && (
                                                <div
                                                    className="w-2 h-2 rounded-full"
                                                    style={{
                                                        background:
                                                            sub.status === "REJECTED" && i === 2 ? "#DC3545" : "#28A745",
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <p
                                            className="text-xs mt-1 whitespace-nowrap text-gray-500 dark:text-white/60"
                                            style={{ fontSize: 9 }}
                                        >
                                            {step.label}
                                        </p>
                                    </div>
                                    {i < steps.length - 1 && (
                                        <div
                                            className="flex-1 h-px mx-1"
                                            style={{
                                                background: steps[i + 1].done
                                                    ? "#28A745"
                                                    : "rgba(255,255,255,0.1)",
                                                marginBottom: "14px",
                                            }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// FORMATEUR: Pending reviews
function FormateurView({ submissions, loading }: { submissions: LivrableResponse[]; loading: boolean }) {
    const pending = submissions.filter((s) => s.status === "PENDING");

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-full h-14 rounded-xl animate-pulse bg-gray-200 dark:bg-white/5" />
                ))}
            </div>
        );
    }

    return (
        <>
            {/* Pending count banner */}
            <div
                className={`flex items-center justify-between rounded-xl p-4 mb-4 border
                            ${pending.length > 0 ? "bg-red-600/10 border-red-600/25" : "bg-green-600/10 border-green-600/25"}`}
            >
                <div>
                    <p className="text-xs font-semibold text-gray-400 dark:text-white/50">
                        PENDING REVIEWS
                    </p>
                    <p className="text-3xl font-bold mt-0.5 text-gray-900 dark:text-[#F4F4F4]">
                        {pending.length}
                    </p>
                </div>
                <div
                    className={`flex items-center justify-center w-14 h-14 rounded-2xl
                                ${pending.length > 0 ? "bg-red-600/20" : "bg-green-600/20"}`}
                >
                    <ClipboardList size={28} style={{ color: pending.length > 0 ? "#DC3545" : "#28A745" }} />
                </div>
            </div>

            {pending.length === 0 ? (
                <div className="text-center py-4">
                    <CheckCircle size={32} className="mx-auto mb-2 text-green-600" />
                    <p className="text-sm font-medium text-green-600">
                        All caught up! 🎉
                    </p>
                    <p className="text-xs mt-1 text-gray-400 dark:text-white/35">
                        No pending reviews
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {pending.slice(0, 4).map((sub) => (
                        <div
                            key={sub.id}
                            className="flex items-center justify-between rounded-xl px-4 py-3
                                       bg-gray-50 border border-gray-200
                                       dark:bg-white/4 dark:border-white/6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: "rgba(255,107,53,0.2)", color: "#FF6B35" }}>
                                    {(sub.bootcamperName ?? "?").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-[#F4F4F4]">
                                        {sub.bootcamperName ?? "Student"}
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-white/35">
                                        Submitted {new Date(sub.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </p>
                                </div>
                            </div>
                            <Link
                                to={`/homework/${sub.resourceId}/reviews`}
                                className="flex items-center gap-1 text-xs font-semibold rounded-lg px-3 py-1.5"
                                style={{ background: "rgba(255,107,53,0.15)", color: "#FF6B35" }}
                            >
                                Review <ChevronRight size={12} />
                            </Link>
                        </div>
                    ))}
                    {pending.length > 4 && (
                        <Link
                            to="/homework-reviews"
                            className="flex items-center justify-center gap-1.5 w-full text-xs font-semibold rounded-xl py-2.5"
                            style={{ background: "rgba(220,53,69,0.1)", color: "#DC3545", border: "1px solid rgba(220,53,69,0.2)" }}
                        >
                            +{pending.length - 4} more pending <ChevronRight size={12} />
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}

export default function HomeworkWidget() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState<LivrableResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                let data: LivrableResponse[] = [];
                if (user?.role === "BOOTCAMPER") {
                    data = await resourceApi.getMyLivrables();
                } else if (user?.role === "FORMATEUR") {
                    // Fetch via resources with pending submissions
                    const resources = await resourceApi.getAllResources(false);
                    const allLivrables = await Promise.all(
                        resources
                            .filter((r) => r.type === "HOMEWORK")
                            .slice(0, 10)
                            .map((r) =>
                                resourceApi.getLivrablesByResource(r.id).catch(() => [] as LivrableResponse[])
                            )
                    );
                    data = allLivrables.flat();
                }
                setSubmissions(data);
            } catch (e) {
                console.error("Homework widget error", e);
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
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="flex items-center justify-center w-10 h-10 rounded-xl"
                        style={{
                            background:
                                user?.role === "FORMATEUR"
                                    ? "rgba(220,53,69,0.15)"
                                    : "rgba(255,107,53,0.15)",
                        }}
                    >
                        <ClipboardList
                            size={20}
                            style={{ color: user?.role === "FORMATEUR" ? "#DC3545" : "#FF6B35" }}
                        />
                    </div>
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-gray-400 dark:text-white/45">
                            HOMEWORK & SUBMISSIONS
                        </p>
                        <p className="text-sm font-bold text-gray-900 dark:text-[#F4F4F4]">
                            {user?.role === "FORMATEUR" ? "Pending Reviews" : "My Submissions"}
                        </p>
                    </div>
                </div>
                <Link
                    to={user?.role === "FORMATEUR" ? "/homework-reviews" : "/my-submissions"}
                    className="text-xs font-semibold"
                    style={{ color: "#FF6B35" }}
                >
                    View All →
                </Link>
            </div>

            {user?.role === "FORMATEUR" ? (
                <FormateurView submissions={submissions} loading={loading} />
            ) : (
                <BootcamperView submissions={submissions} loading={loading} />
            )}
        </div>
    );
}
