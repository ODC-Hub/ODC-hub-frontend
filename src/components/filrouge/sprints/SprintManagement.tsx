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
  Pencil,
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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedSprintToClose, setSelectedSprintToClose] = useState<Sprint | null>(null);
  const [nextSprintId, setNextSprintId] = useState<string>('');
  const [sprintToEdit, setSprintToEdit] = useState<Sprint | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
            Active
          </span>
        );
      case 'CLOSED':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            Completed
          </span>
        );
      case 'PLANNED':
        return (
          <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
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

  const openCreateModal = () => {
    setSprintToEdit(null);
    setFormData({ name: '', startDate: '', endDate: '' });
    setShowCreateModal(true);
  };

  const openEditModal = (sprint: Sprint) => {
    setSprintToEdit(sprint);
    setFormData({
      name: sprint.name,
      startDate: sprint.startDate ? new Date(sprint.startDate).toISOString().split('T')[0] : '',
      endDate: sprint.endDate ? new Date(sprint.endDate).toISOString().split('T')[0] : '',
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (sprintToEdit) {
        await sprintApi.updateSprint(sprintToEdit.id, {
          name: formData.name,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        });
      } else {
        await sprintApi.createSprint(project.id, {
          name: formData.name,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        });
      }

      setFormData({ name: '', startDate: '', endDate: '' });
      setShowCreateModal(false);
      setSprintToEdit(null);
      onSprintUpdate();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        `Failed to ${sprintToEdit ? 'update' : 'create'} sprint. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await sprintApi.startSprint(sprintId);
      onSprintUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start sprint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteSprint = async () => {
    if (!selectedSprintToClose || !nextSprintId) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await sprintApi.closeSprint(selectedSprintToClose.id, nextSprintId);
      setShowCompleteModal(false);
      setSelectedSprintToClose(null);
      setNextSprintId('');
      onSprintUpdate();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete sprint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateProgress = (sprint: Sprint) => {
    if (!sprint.plannedEffort || sprint.plannedEffort === 0) return 0;
    return Math.round(
      (sprint.completedEffort / sprint.plannedEffort) * 100
    );
  };

  const sortedSprints = [...sprints].sort((a, b) => {
    const order = { ACTIVE: 0, PLANNED: 1, CLOSED: 2 };
    const diff = (order[a.status as keyof typeof order] || 0) - (order[b.status as keyof typeof order] || 0);
    if (diff !== 0) return diff;

    if (a.startDate && b.startDate) {
      return (
        new Date(b.startDate).getTime() -
        new Date(a.startDate).getTime()
      );
    }
    return 0;
  });

  const plannedSprints = sprints.filter(s => s.status === 'PLANNED');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Sprint Management
          </h2>
          <p className="text-sm text-gray-600">
            Manage sprints for{' '}
            <span className="font-medium">{project.name}</span>
          </p>
        </div>
        <button
          onClick={openCreateModal}
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
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gray-100">
                    {getStatusIcon(sprint.status)}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {sprint.name}
                      </h3>
                      {getStatusBadge(sprint.status)}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(sprint.startDate)} –{' '}
                      {formatDate(sprint.endDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(sprint)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit Sprint"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  {sprint.status === 'ACTIVE' && (
                    <button
                      onClick={() => {
                        setSelectedSprintToClose(sprint);
                        setShowCompleteModal(true);
                      }}
                      className="px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-800 flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Complete Sprint
                    </button>
                  )}

                  {sprint.status === 'PLANNED' && (
                    <button
                      onClick={() => handleStartSprint(sprint.id)}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Start Sprint
                    </button>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
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
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xs text-gray-500">Planned</div>
                  <div className="text-xl font-semibold">
                    {sprint.plannedEffort || 0}
                  </div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xs text-gray-500">Completed</div>
                  <div className="text-xl font-semibold">
                    {sprint.completedEffort || 0}
                  </div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xs text-gray-500">Work Items</div>
                  <div className="text-xl font-semibold">
                    {sprint.workItems?.length || 0}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Sprint Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {sprintToEdit ? 'Edit Sprint' : 'Create New Sprint'}
              </h3>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              {error && (
                <div className="flex gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Sprint Name
                </label>
                <input
                  required
                  className="w-full px-3 py-2.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2.5 text-sm border rounded-md"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  min={formData.startDate}
                  className="w-full px-3 py-2.5 text-sm border rounded-md"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm border rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : sprintToEdit ? 'Update Sprint' : 'Create Sprint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Sprint Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Complete Sprint</h3>
              <button onClick={() => setShowCompleteModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                You are about to complete <strong>{selectedSprintToClose?.name}</strong>.
                Any unfinished work items will be carried over to the next sprint.
              </p>

              {error && (
                <div className="flex gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 mt-0.5" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Next Sprint (Carry-over destination)
                </label>
                <select
                  className="w-full px-3 py-2.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500"
                  value={nextSprintId}
                  onChange={(e) => setNextSprintId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a planned sprint --</option>
                  {plannedSprints
                    .filter(s => s.id !== selectedSprintToClose?.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))
                  }
                </select>
                {plannedSprints.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No planned sprints available. Create one first to carry over work.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-sm border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSprint}
                  disabled={isSubmitting || !nextSprintId}
                  className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Completing...' : 'Complete & Carry Over'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
