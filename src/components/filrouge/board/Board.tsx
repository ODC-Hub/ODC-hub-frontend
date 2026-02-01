import { useState } from 'react';
import { WorkItem, WorkItemStatus } from '@/app/types';
import { Column } from './Column';

interface BoardProps {
  workItems: WorkItem[];
  onWorkItemMove: (workItem: WorkItem, newStatus: WorkItemStatus) => void;
  onWorkItemClick: (workItem: WorkItem) => void;
  onAddWorkItem?: () => void;
}

const statusColumns: { id: WorkItemStatus; title: string; color: string }[] = [
  { id: 'TODO', title: 'To Do', color: 'bg-gray-100' },
  { id: 'DOING', title: 'In Progress', color: 'bg-blue-50' },
  { id: 'DONE', title: 'Done', color: 'bg-green-50' },
];

export function Board({ workItems, onWorkItemMove, onWorkItemClick, onAddWorkItem }: BoardProps) {
  const [collapsedColumns, setCollapsedColumns] = useState<Set<WorkItemStatus>>(new Set());

  const toggleColumn = (status: WorkItemStatus) => {
    const newCollapsed = new Set(collapsedColumns);
    if (newCollapsed.has(status)) {
      newCollapsed.delete(status);
    } else {
      newCollapsed.add(status);
    }
    setCollapsedColumns(newCollapsed);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {statusColumns.map((column) => {
        const columnWorkItems = workItems.filter(wi => wi.status === column.id);
        return (
          <Column
            key={column.id}
            status={column.id}
            title={column.title}
            workItems={columnWorkItems}
            onDrop={onWorkItemMove}
            onWorkItemClick={onWorkItemClick}
            collapsed={collapsedColumns.has(column.id)}
            onToggleCollapse={() => toggleColumn(column.id)}
            color={column.color}
            showAddButton={column.id === 'TODO'}
            onAddWorkItem={onAddWorkItem}
          />
        );
      })}
    </div>
  );
}
