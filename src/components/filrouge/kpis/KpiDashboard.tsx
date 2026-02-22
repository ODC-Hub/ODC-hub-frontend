import { useState, useEffect } from 'react';
import { Project, ProjectKpi } from '../../../types/project';
import { Sprint } from '../../../types/sprint';
import { TrendingUp, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react';
import { projectApi } from '../../../api/filrouge';

interface KpiDashboardProps {
  project: Project;
  sprints: Sprint[];
  kpis: ProjectKpi | null;
}

export function KpiDashboard({ project, sprints, kpis }: KpiDashboardProps) {
  if (!kpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const sprintVelocityData = sprints
    .map(sprint => {
      const kpi = kpis?.sprintKpis.find(sk => sk.sprintId === sprint.id);
      return {
        name: sprint.name,
        planned: sprint.plannedEffort || 0,
        completed: kpi?.completedEffort || 0,
        status: sprint.status,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Overall Progress from KPI
  const progress = Math.round(kpis?.globalProgress || 0);

  // Velocity Trend calculation: comparing last two CLOSED sprints
  const closedSprints = sprints
    .filter(s => s.status === 'CLOSED')
    .sort((a, b) => (a.endDate || '').localeCompare(b.endDate || ''));

  const lastSprint = closedSprints[closedSprints.length - 1];
  const prevSprint = closedSprints[closedSprints.length - 2];

  const lastVelocity = kpis?.sprintKpis.find(k => k.sprintId === lastSprint?.id)?.completedEffort || 0;
  const prevVelocity = kpis?.sprintKpis.find(k => k.sprintId === prevSprint?.id)?.completedEffort || 0;

  const velocityDiff = prevVelocity > 0 ? ((lastVelocity - prevVelocity) / prevVelocity) * 100 : 0;
  const completionTrend = velocityDiff >= 0 ? 'up' : 'down';

  // Risk calculation from backend
  const avgRiskScore = kpis?.sprintKpis.length
    ? kpis.sprintKpis.reduce((acc, k) => acc + k.riskScore, 0) / kpis.sprintKpis.length
    : 0;
  const riskLevel = avgRiskScore > 50 ? 'high' : avgRiskScore > 30 ? 'medium' : 'low';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-col items-center">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                <circle cx="64" cy="64" r="56" stroke="#f97316" strokeWidth="12" fill="transparent"
                  strokeDasharray={351.68} strokeDashoffset={351.68 - (351.68 * progress) / 100}
                  className="transition-all duration-1000" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{progress}%</span>
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-3">Overall Progress</div>
          </div>
        </div>

        {/* Active Sprints */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Active Sprints</div>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {sprints.filter((s: Sprint) => s.status === 'ACTIVE').length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-500">
            {sprints.filter((s: Sprint) => s.status === 'CLOSED').length} completed
          </div>
        </div>

        {/* Velocity Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Velocity Trend</div>
          <div className="flex items-center gap-2">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{lastVelocity}</div>
            {completionTrend === 'up' ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className={`text-xs mt-2 ${completionTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {velocityDiff > 0 ? '+' : ''}{Math.round(velocityDiff)}% from previous sprint
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Risk Score</div>
          <div className="flex items-center gap-2 mb-2">
            <div className="text-4xl font-bold text-gray-900 dark:text-white">{Math.round(avgRiskScore)}</div>
            <AlertTriangle className={`w-6 h-6 ${riskLevel === 'high' ? 'text-red-600' : riskLevel === 'medium' ? 'text-orange-600' : 'text-green-600'}`} />
          </div>
          <div className={`inline-block px-2 py-1 text-xs font-medium rounded ${riskLevel === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : riskLevel === 'medium' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
            {riskLevel.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Sprint Velocity Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sprint Velocity</h3>
        <div className="h-64 flex items-end justify-around gap-4">
          {sprintVelocityData.map((sprint, index) => {
            const maxEffort = Math.max(...sprintVelocityData.map(s => Math.max(s.planned, s.completed)));
            const plannedHeight = (sprint.planned / maxEffort) * 100;
            const completedHeight = (sprint.completed / maxEffort) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-2 h-48">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-orange-200 rounded-t transition-all duration-500" style={{ height: `${plannedHeight}%` }} />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{sprint.planned}</span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-full ${sprint.status === 'ACTIVE' ? 'bg-green-200' : 'bg-green-500'} rounded-t transition-all duration-500`} style={{ height: `${completedHeight}%` }} />
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{sprint.completed}</span>
                  </div>
                </div>
                <div className="text-[10px] text-gray-700 dark:text-gray-300 font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full text-center" title={sprint.name}>
                  {sprint.name}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Planned Effort</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Completed Effort</span>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Risk Assessment</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { category: 'Schedule', value: Math.round(avgRiskScore) },
            { category: 'Scope', value: Math.round(avgRiskScore * 0.8) },
            { category: 'Quality', value: Math.round(avgRiskScore * 0.6) },
            { category: 'Resources', value: Math.round(avgRiskScore * 0.9) },
          ].map((risk) => (
            <div key={risk.category} className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{risk.value}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{risk.category}</div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${risk.value > 50 ? 'bg-red-500' : risk.value > 30 ? 'bg-orange-500' : 'bg-green-500'}`}
                  style={{ width: `${risk.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sprint List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Sprint History</h3>
        <div className="space-y-3">
          {sprints.map((sprint: Sprint) => (
            <div key={sprint.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-orange-200 dark:hover:border-orange-700 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{sprint.name}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${sprint.status === 'ACTIVE' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : sprint.status === 'CLOSED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                    {sprint.status}
                  </span>
                </div>
                {sprint.startDate && sprint.endDate && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400">Effort</div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {sprint.completedEffort || 0} / {sprint.plannedEffort || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
