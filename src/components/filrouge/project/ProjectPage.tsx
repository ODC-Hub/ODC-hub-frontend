import { useState } from 'react';
import { Link } from 'react-router';
import { mockProjects } from '@/app/data/mockData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Progress } from '@/app/components/ui/progress';
import { ProgressRing } from '@/app/components/ProgressRing';
import { MemberAvatars } from '@/app/components/MemberAvatars';
import { CreateProjectModal } from '@/app/components/CreateProjectModal';
import { Plus, Search, Activity, AlertTriangle } from 'lucide-react';
import { Badge } from '@/app/components/ui/badge';

export function ProjectPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const filteredProjects = mockProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskBadge = (riskScore: number) => {
    if (riskScore < 30) return <Badge variant="secondary" className="bg-green-100 text-green-700">Low Risk</Badge>;
    if (riskScore < 60) return <Badge variant="secondary" className="bg-orange-100 text-orange-700">Medium Risk</Badge>;
    return <Badge variant="secondary" className="bg-red-100 text-red-700">High Risk</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl mb-2">Projects</h1>
          <p className="text-gray-600">Manage and track your team projects</p>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const activeSprint = project.sprints.find(s => s.id === project.activeSprint);
            
            return (
              <Link key={project.id} to={`/projects/${project.id}`}>
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer border-2 hover:border-orange-200">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate">{project.name}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {project.description}
                        </CardDescription>
                      </div>
                      <ProgressRing progress={project.progress} size={60} strokeWidth={6} />
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Active Sprint */}
                    {activeSprint && (
                      <div className="flex items-center gap-2 text-sm">
                        <Activity className="w-4 h-4 text-orange-500" />
                        <span className="text-gray-600">Active:</span>
                        <span>{activeSprint.name}</span>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Overall Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="w-4 h-4" />
                          {getRiskBadge(project.riskScore)}
                        </div>
                      </div>
                    </div>

                    {/* Members */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600">Team</span>
                      <MemberAvatars memberIds={project.members} maxDisplay={4} size="sm" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found</p>
          </div>
        )}
      </div>

      <CreateProjectModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
    </div>
  );
}
