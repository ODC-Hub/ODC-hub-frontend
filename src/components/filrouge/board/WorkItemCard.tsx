import { WorkItem } from '@/types/sprint';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AlertCircle, Bug, CheckCircle2, Zap } from 'lucide-react';

interface WorkItemCardProps {
  item: WorkItem;
  onClick: (item: WorkItem) => void;
}

export function WorkItemCard({ item, onClick }: WorkItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { item },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const getIcon = () => {
    switch (item.type) {
      case 'RESEARCH': return <AlertCircle className="w-4 h-4 text-purple-500" />;
      case 'DELIVERABLE': return <Zap className="w-4 h-4 text-orange-500" />;
      case 'REVIEW': return <Bug className="w-4 h-4 text-red-500" />;
      case 'TASK': return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  const isOverdue = item.deadline && (new Date(item.deadline) < new Date() && item.status !== 'DONE');

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(item)}
      className={`
        bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab hover:shadow-md transition-shadow
        ${isDragging ? 'rotate-2 scale-105 shadow-xl' : ''}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-xs font-medium text-gray-500 uppercase">{item.type}</span>
        </div>
        {(item.effort || 0) > 0 && (
          <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
            {item.effort} pts
          </span>
        )}
      </div>

      <h4 className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">
        {item.title}
      </h4>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          {isOverdue && (
            <div className="flex items-center text-red-600 gap-1 bg-red-50 px-1.5 py-0.5 rounded">
              <AlertCircle className="w-3 h-3" />
              <span>Overdue</span>
            </div>
          )}
        </div>

        {(item.assignedUserIds || []).length > 0 && (
          <div className="flex -space-x-2">
            {(item.assignedUserIds || []).map(id => (
              <div key={id} className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-[10px] uppercase font-bold text-gray-700">
                U
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
