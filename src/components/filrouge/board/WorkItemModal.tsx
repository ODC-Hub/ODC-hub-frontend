import { useState } from 'react';
import { WorkItem, WorkItemType, WorkItemStatus } from '@/types/sprint';
import Button from '@/components/ui/button/Button';
import { X, Calendar, Users, Clock, ChevronDown } from 'lucide-react';

interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  avatarFileId?: string;
}

interface WorkItemModalProps {
  workItem?: WorkItem;
  onClose: () => void;
  onSave: (workItem: Partial<WorkItem>) => void;
  mode: 'create' | 'edit' | 'view';
  initialStatus?: WorkItemStatus;
  members: User[];
}

const typeOptions: { label: string; value: WorkItemType; color: any }[] = [
  { label: 'Task', value: 'TASK', color: 'info' },
  { label: 'Research', value: 'RESEARCH', color: 'secondary' },
  { label: 'Deliverable', value: 'DELIVERABLE', color: 'success' },
  { label: 'Review', value: 'REVIEW', color: 'warning' },
];

export function WorkItemModal({ workItem, onClose, onSave, mode, initialStatus = 'TODO', members }: WorkItemModalProps) {
  const [formData, setFormData] = useState<any>(
    workItem ? {
      ...workItem,
      deadline: workItem.deadline ? workItem.deadline.split('T')[0] : new Date().toLocaleDateString('en-CA')
    } : {
      title: '',
      description: '',
      type: 'TASK',
      status: initialStatus,
      effort: 1,
      deadline: new Date().toLocaleDateString('en-CA'),
      assignedUserIds: [],
    }
  );

  const isCreate = mode === 'create';

  const handleSave = () => {
    if (!formData.title?.trim()) {
      alert('Title is required');
      return;
    }

    if ((formData.effort || 0) <= 0) {
      alert('Story points must be at least 1');
      return;
    }

    const deadlineDate = new Date(formData.deadline || new Date());
    deadlineDate.setHours(23, 59, 59, 999);

    const payload = {
      ...formData,
      deadline: deadlineDate.toISOString()
    };

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-start border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isCreate ? 'Create New Work Item' : 'Work Item Details'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {isCreate ? 'Add a new item to your sprint' : `Review and update details for this item`}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Implement user authentication"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed information..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Type *
              </label>
              <div className="relative">
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkItemType })}
                  className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white pr-10"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <div className="relative">
                <select
                  disabled={isCreate}
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkItemStatus })}
                  className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white pr-10 disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
                >
                  <option value="TODO">To Do</option>
                  <option value="DOING">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                {!isCreate && <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Effort */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                <Clock className="w-4 h-4" /> Story Points
              </label>
              <input
                type="number"
                value={formData.effort || ''}
                onChange={(e) => setFormData({ ...formData, effort: parseInt(e.target.value) || 0 })}
                placeholder="e.g., 5"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                <Calendar className="w-4 h-4" /> Deadline
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-gray-50/50 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Assignees */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              <Users className="w-4 h-4" /> Assignees
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-xl p-2 bg-gray-50/50 dark:bg-gray-700">
              {members?.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-white dark:hover:bg-gray-600 rounded-lg transition-all">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={(formData.assignedUserIds || []).includes(member.id)}
                    onChange={(e) => {
                      const current = formData.assignedUserIds || [];
                      const next = e.target.checked
                        ? [...current, member.id]
                        : current.filter((id: string) => id !== member.id);
                      setFormData({ ...formData, assignedUserIds: next });
                    }}
                    className="w-4 h-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <label htmlFor={`member-${member.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                    {member.avatarFileId ? (
                      <img
                        src={`http://localhost:8080/api/users/avatar/${member.avatarFileId}`}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 text-[10px] font-bold">
                        {member.fullName?.substring(0, 2) || member.email.substring(0, 2)}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{member.fullName || member.email}</span>
                  </label>
                </div>
              ))}
              {members.length === 0 && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 py-4">No members available in this project</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end items-center bg-gray-50/50 dark:bg-gray-900">
          <Button variant="outline" onClick={onClose} className="px-6 rounded-xl font-semibold">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 rounded-xl font-semibold bg-orange-500 hover:bg-orange-600 border-none text-white shadow-lg shadow-orange-200"
          >
            {isCreate ? 'Create Work Item' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
