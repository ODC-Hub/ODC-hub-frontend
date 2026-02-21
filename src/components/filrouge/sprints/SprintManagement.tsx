import { useState } from 'react';
import { Project } from '../../../types/project';
import { Sprint } from '../../../types/sprint';
import {
  Plus,
  Play,
  CheckCircle,
  Clock,
  Calendar,
  X,
  AlertCircle,
} from 'lucide-react';
import { sprintApi } from '../../../api/filrouge';

interface SprintManagementProps {
  project: Project;
  sprints: Sprint[];
  onSprintUpdate: () => void;
}

interface CreateSprintFormData {
  name: string;
  startDate: string;
  endDate: string;
}

export function SprintManagement({
  project,
  sprints,
  onSprintUpdate,
}: SprintManagementProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<CreateSprintFormData>({
    name: '',
    startDate: '',
    endDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Complete Sprint Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [sprintToComplete, setSprintToComplete] = useState<Sprint | null>(null);
  const [nextSprintId, setNextSprintId] = useState<string>('');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
            Active
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
            Completed
          </span>
        );
      case 'PLANNED':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">
            Planned
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Play className="w-5 h-5 text-blue-600" />;
      case 'CLOSED':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'PLANNED':
        return <Clock className="w-5 h-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateProgress = (sprint: Sprint) => {
    if (!sprint.plannedEffort || sprint.plannedEffort === 0) return 0;
    return Math.round(
      (sprint.completedEffort / sprint.plannedEffort) * 100
    );
  };

  const sortedSprints = [...sprints].sort((a, b) => {
    const order = { ACTIVE: 0, PLANNED: 1, CLOSED: 2 };
    const diff = order[a.status] - order[b.status];
    if (diff !== 0) return diff;

    if (a.startDate && b.startDate) {
      return (
        new Date(b.startDate).getTime() -
        new Date(a.startDate).getTime()
      );
    }
    return 0;
  });

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await sprintApi.createSprint(project.id, {
        name: formData.name,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      });

      setFormData({ name: '', startDate: '', endDate: '' });
      setShowCreateModal(false);
      onSprintUpdate();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to create sprint. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    try {
      await sprintApi.startSprint(sprintId);
      onSprintUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to start sprint');
    }
  };

  const handleCompleteSprintClick = (sprint: Sprint) => {
    setSprintToComplete(sprint);
    const plannedSprints = sprints.filter(s => s.status === 'PLANNED');
    if (plannedSprints.length > 0) {
      setNextSprintId(plannedSprints[0].id);
    } else {
      setNextSprintId('');
    }
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = async () => {
    if (!sprintToComplete || !nextSprintId) {
      alert("Please select the next sprint.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sprintApi.closeSprint(sprintToComplete.id, nextSprintId);
      setShowCompleteModal(false);
      setSprintToComplete(null);
      setNextSprintId('');
      onSprintUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to complete sprint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasActiveSprint = sprints.some(s => s.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Sprint Management
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage sprints for{' '}
            <span className="font-medium">{project.name}</span>
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Sprint
        </button>
      </div>

      {/* Sprint Cards */}
      <div className="space-y-4">
        {sortedSprints.map((sprint) => {
          const progress = calculateProgress(sprint);

          return (
            <div
              key={sprint.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
                    {getStatusIcon(sprint.status)}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {sprint.name}
                      </h3>
                      {getStatusBadge(sprint.status)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(sprint.startDate)} –{' '}
                      {formatDate(sprint.endDate)}
                    </div>
                  </div>
                </div>

                {sprint.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCompleteSprintClick(sprint)}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200"
                  >
                    Complete Sprint
                  </button>
                )}
                {sprint.status === 'PLANNED' && (
                  <button
                    onClick={() => handleStartSprint(sprint.id)}
                    disabled={hasActiveSprint}
                    className={`px-3 py-1.5 text-sm font-medium border rounded-md transition-colors
                      ${hasActiveSprint
                        ? 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed bg-gray-50 dark:bg-gray-800'
                        : 'border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    title={hasActiveSprint ? "Complete the active sprint first" : "Start this sprint"}
                  >
                    Start Sprint
                  </button>
                )}
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="font-medium dark:text-gray-200">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${sprint.status === 'CLOSED'
                      ? 'bg-green-500'
                      : 'bg-blue-500'
                      }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Planned</div>
                  <div className="text-xl font-semibold dark:text-white">{sprint.plannedEffort || 0}</div>
                </div>
                <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
                  <div className="text-xl font-semibold dark:text-white">{sprint.completedEffort || 0}</div>
                </div>
                <div className="text-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Work Items</div>
                  <div className="text-xl font-semibold dark:text-white">{sprint.workItems?.length || 0}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Sprint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[99999] backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-white">Create New Sprint</h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form
              onSubmit={handleCreateSprint}
              className="p-6 space-y-4"
            >
              {error && (
                <div className="flex gap-2 p-3 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Sprint Name</label>
                <input
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Start Date</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">End Date</label>
                <input
                  type="date"
                  required
                  min={formData.startDate}
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Sprint Modal */}
      {showCompleteModal && sprintToComplete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold dark:text-white">Complete Sprint {sprintToComplete.name}</h3>
              <button onClick={() => setShowCompleteModal(false)}>
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg text-sm">
                <p>This will complete the current sprint. Any incomplete items must be moved to another sprint.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-200">Move incomplete items to:</label>
                <select
                  className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={nextSprintId}
                  onChange={(e) => setNextSprintId(e.target.value)}
                >
                  <option value="" disabled>Select a sprint...</option>
                  {sprints
                    .filter(s => s.status === 'PLANNED')
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))
                  }
                </select>
                {sprints.filter(s => s.status === 'PLANNED').length === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    No planned sprints available. Please create a new sprint first.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmComplete}
                  disabled={isSubmitting || !nextSprintId}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Completing...' : 'Complete Sprint'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
