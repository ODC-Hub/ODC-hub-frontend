import { WorkItem, WorkItemStatus } from '@/app/types';
import { useDrop } from 'react-dnd';
import { WorkItemCard } from './WorkItemCard';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface ColumnProps {
  status: WorkItemStatus;
  title: string;
  workItems: WorkItem[];
  onDrop: (workItem: WorkItem, newStatus: WorkItemStatus) => void;
  onWorkItemClick: (workItem: WorkItem) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  color: string;
  showAddButton?: boolean;
  onAddWorkItem?: () => void;
}

export function Column({ 
  status, 
  title, 
  workItems, 
  onDrop, 
  onWorkItemClick, 
  collapsed, 
  onToggleCollapse, 
  color, 
  showAddButton = false,
  onAddWorkItem
}: ColumnProps) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'WORKITEM',
    drop: (item: { workItem: WorkItem }) => onDrop(item.workItem, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const totalEffort = workItems.reduce((sum, wi) => sum + wi.effort, 0);

  return (
    <div ref={drop} className={`flex flex-col min-w-[320px] ${isOver ? 'opacity-75' : ''}`}>
      <div className={`${color} rounded-t-lg p-3 border border-b-0`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            <Badge variant="secondary">{workItems.length}</Badge>
          </div>
          <button onClick={onToggleCollapse} className="hover:bg-white/50 rounded p-1">
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        <div className="text-sm text-gray-600">
          {totalEffort} points
        </div>
      </div>

      <div className={`flex-1 border border-t-0 rounded-b-lg p-3 space-y-3 ${isOver ? 'bg-blue-50' : 'bg-white'} min-h-[500px]`}>
        {!collapsed && (
          <>
            {workItems.map((workItem) => (
              <WorkItemCard key={workItem.id} workItem={workItem} onClick={onWorkItemClick} />
            ))}
            {showAddButton && (
              <Button 
                variant="ghost" 
                className="w-full border-2 border-dashed"
                onClick={onAddWorkItem}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Work Item
              </Button>
            )}
          </>
        )}
        {collapsed && (
          <div className="text-center text-sm text-gray-400 py-4">
            Column collapsed
          </div>
        )}
      </div>
    </div>
  );
}
