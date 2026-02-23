import PageMeta from "../../components/common/PageMeta";
import { useAuth } from "../../context/AuthContext";
import StatsMiniCards from "../../components/dashboard/StatsMiniCards";
import SprintProgressCard from "../../components/dashboard/SprintProgressCard";
import LearningJourneyCard from "../../components/dashboard/LearningJourneyCard";
import QuizStatsWidget from "../../components/dashboard/QuizStatsWidget";
import HomeworkWidget from "../../components/dashboard/HomeworkWidget";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const { user } = useAuth();
  const firstName = user?.fullName?.split(" ")[0] ?? "there";
  const today = formatDate(new Date());

  return (
    <>
      <PageMeta
        title="Dashboard | ODC HUB"
        description="ODC HUB Bootcamp Dashboard"
      />

      {/* Full-width wrapper — light/dark aware */}
      <div className="min-h-screen -m-4 md:-m-6 p-6 md:p-8 bg-gray-50 dark:bg-[#111111] transition-colors duration-300">
        {/* ── Welcome Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-[#F4F4F4]">
              Welcome back, {firstName} 👋
            </h1>
            <p className="mt-1.5 text-sm text-gray-500 dark:text-white/45">
              Here's what's happening in your bootcamp today —{" "}
              <span className="text-gray-600 dark:text-white/60">{today}</span>
            </p>
          </div>

          {/* Bootcamp active badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold self-start sm:self-auto"
            style={{
              background: "rgba(255,107,53,0.12)",
              border: "1px solid rgba(255,107,53,0.3)",
              color: "#FF6B35",
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#28A745", boxShadow: "0 0 6px #28A745" }}
            />
            BOOTCAMP ACTIVE — Full Stack Web Dev
          </div>
        </div>

        {/* ── Stats Mini-Cards Row ─────────────────────────────────── */}
        <div className="mb-6">
          <StatsMiniCards />
        </div>

        {/* ── Main Content Grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Sprint Progress — 4 cols */}
          <div className="xl:col-span-4">
            <SprintProgressCard />
          </div>

          {/* Learning Journey + Quick Resources — 4 cols */}
          <div className="xl:col-span-4">
            <LearningJourneyCard />
          </div>

          {/* Quiz Stats — 4 cols */}
          <div className="xl:col-span-4">
            <QuizStatsWidget />
          </div>

          {/* Homework Widget — full width */}
          <div className="xl:col-span-12">
            <HomeworkWidget />
          </div>
        </div>
      </div>
    </>
  );
}
