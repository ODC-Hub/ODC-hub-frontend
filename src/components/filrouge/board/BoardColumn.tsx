import { useDroppable } from '@dnd-kit/core';
import { WorkItem, WorkItemStatus } from '@/types/sprint';
import { WorkItemCard } from './WorkItemCard';
import { Plus, ChevronUp } from 'lucide-react';
import Button from '@/components/ui/button/Button';

interface BoardColumnProps {
    id: WorkItemStatus;
    title: string;
    items: WorkItem[];
    onItemClick: (item: WorkItem) => void;
    onAddItem: (status: WorkItemStatus) => void;
}

export function BoardColumn({ id, title, items, onItemClick, onAddItem }: BoardColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const getBackgroundColor = () => {
        switch (id) {
            case 'TODO': return 'bg-gray-50';
            case 'DOING': return 'bg-blue-50/40';
            case 'DONE': return 'bg-green-50/40';
        }
    };

    const getHeaderBackgroundColor = () => {
        switch (id) {
            case 'TODO': return 'bg-white';
            case 'DOING': return 'bg-blue-50';
            case 'DONE': return 'bg-green-50';
        }
    };

    const getTotalPoints = () => {
        return items.reduce((sum, item) => sum + (item.points || 0), 0);
    };

    return (
        <div className={`flex flex-col h-full min-h-[500px] w-80 ${getBackgroundColor()} rounded-2xl border border-gray-200`}>
            {/* Header */}
            <div className={`p-4 border-b border-gray-200 ${getHeaderBackgroundColor()} rounded-t-2xl`}>
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 text-base">{title}</h3>
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md text-sm font-medium min-w-[24px] text-center">
                            {items.length}
                        </span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <ChevronUp className="w-5 h-5" />
                    </button>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    {getTotalPoints()} points
                </div>
            </div>

            {/* Droppable Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-4 space-y-3 overflow-y-auto transition-all ${
                    isOver ? 'bg-blue-50/50 ring-2 ring-blue-300 ring-inset' : ''
                }`}
            >
                {items.map((item) => (
                    <WorkItemCard
                        key={item.id}
                        item={item}
                        onClick={onItemClick}
                    />
                ))}

                {items.length === 0 && (
                    <div className="h-24 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                        Drop items here
                    </div>
                )}
            </div>

            {/* Add Work Item Button */}
            <div className="p-4 pt-0">
                <button
                    onClick={() => onAddItem(id)}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center gap-2 text-gray-500 hover:border-gray-400 hover:text-gray-600 hover:bg-white/50 transition-all text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Work Item</span>
                </button>
            </div>
        </div>
    );
}