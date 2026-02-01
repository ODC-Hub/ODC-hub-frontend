import { Sprint } from '@/app/types';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Progress } from '@/app/components/ui/progress';
import { Play, StopCircle, FileDown } from 'lucide-react';

interface SprintControlsProps {
  sprint: Sprint;
  progress: number;
  completedEffort: number;
  totalEffort: number;
  onCloseSprint?: () => void;
  onExportRetrospective?: () => void;
}

export function SprintControls({ 
  sprint, 
  progress, 
  completedEffort, 
  totalEffort,
  onCloseSprint,
  onExportRetrospective
}: SprintControlsProps) {
  const getDaysRemaining = () => {
    if (!sprint.endDate) return 0;
    const end = new Date(sprint.endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const velocity = sprint.velocity || 0;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl mb-1">{sprint.name}</h2>
          {sprint.startDate && sprint.endDate && (
            <p className="text-sm text-gray-600">
              {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
              <span className="ml-2 text-orange-600">
                ({getDaysRemaining()} days remaining)
              </span>
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onExportRetrospective}>
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={onCloseSprint}>
            <StopCircle className="w-4 h-4 mr-2" />
            Close Sprint
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-gray-600 mb-1">Progress</div>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="flex-1" />
            <span className="text-sm font-medium">{progress}%</span>
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600 mb-1">Planned Effort</div>
          <div className="text-lg font-medium">{sprint.plannedEffort} points</div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-lg font-medium">
            {completedEffort} <span className="text-gray-400">/ {totalEffort}</span> points
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-600 mb-1">Velocity</div>
          <div className="text-lg font-medium">{velocity} pts/sprint</div>
        </div>
      </div>
    </Card>
  );
}
