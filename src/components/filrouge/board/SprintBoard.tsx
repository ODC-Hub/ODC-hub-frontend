import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  UniqueIdentifier
} from '@dnd-kit/core';
import { WorkItem, WorkItemStatus } from '@/types/sprint';
import { BoardColumn } from './BoardColumn';
import { WorkItemCard } from './WorkItemCard';
import { toast } from 'react-hot-toast'; 
import { createPortal } from 'react-dom';

interface SprintBoardProps {
  workItems: WorkItem[];
  onWorkItemMove: (item: WorkItem, newStatus: WorkItemStatus) => void;
  onWorkItemClick: (item: WorkItem) => void;
  onAddWorkItem: (status: WorkItemStatus) => void;
}

export function SprintBoard({ workItems, onWorkItemMove, onWorkItemClick, onAddWorkItem }: SprintBoardProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItem = active.data.current?.item as WorkItem;
    const overStatus = over.id as WorkItemStatus;

    if (!activeItem || !overStatus) return;

    if (activeItem.status === overStatus) return;

    const currentStatus = activeItem.status;

    if (
      (currentStatus === 'TODO' && overStatus === 'DOING') ||
      (currentStatus === 'DOING' && overStatus === 'DONE') ||
      (currentStatus === 'DONE' && overStatus === 'DOING') ||
      (currentStatus === 'DOING' && overStatus === 'TODO')
    ) {
      onWorkItemMove(activeItem, overStatus);
    } else {
      toast.error("Move step-by-step: TODO -> IN PROGRESS -> DONE", {
        icon: '⚠️',
      });
    }
  };

  const activeItem = activeId ? workItems.find(i => i.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {['TODO', 'DOING', 'DONE'].map((status) => (
          <BoardColumn
            key={status}
            id={status as WorkItemStatus}
            title={status}
            items={workItems.filter(i => i.status === status)}
            onItemClick={onWorkItemClick}
            onAddItem={onAddWorkItem}
          />
        ))}
      </div>

      {createPortal(
        <DragOverlay>
          {activeItem ? (
            <div className="w-80">
              <WorkItemCard item={activeItem} onClick={() => { }} />
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}