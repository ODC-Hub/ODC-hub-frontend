import { useState } from 'react';
import { Project, User } from '@/app/types';
import { mockUsers } from '@/app/data/mockData';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Plus, Mail, UserMinus } from 'lucide-react';

interface MembersPanelProps {
  project: Project;
  onAddMember?: (userId: string) => void;
  onRemoveMember?: (userId: string) => void;
}

export function MembersPanel({ project, onAddMember, onRemoveMember }: MembersPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  
  const projectMembers = mockUsers.filter(user => project.members.includes(user.id));
  const availableUsers = mockUsers.filter(user => !project.members.includes(user.id));

  const handleAddMember = (userId: string) => {
    if (onAddMember) {
      onAddMember(userId);
    }
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl mb-1">Team Members</h2>
          <p className="text-sm text-gray-600">{projectMembers.length} members in this project</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projectMembers.map((user) => {
         
          const activeSprint = project.sprints.find(s => s.id === project.activeSprint);
          const memberWorkItems = activeSprint?.workItems.filter(wi => 
            wi.assignees.includes(user.id)
          ).length || 0;

          return (
            <Card key={user.id} className="p-4">
              <div className="flex items-start gap-3">
                <img 
                  src={user.avatar} 
                  alt={user.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium mb-1">{user.name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-3 h-3 text-gray-400" />
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {memberWorkItems} active work items
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onRemoveMember?.(user.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <UserMinus className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-lg mb-4">Add Team Member</h3>
            <div className="space-y-2 mb-4">
              {availableUsers.length > 0 ? (
                availableUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddMember(user.id)}
                  >
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  All users are already members of this project
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
