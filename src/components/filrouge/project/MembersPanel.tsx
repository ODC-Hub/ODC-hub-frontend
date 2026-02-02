import { useState, useEffect } from 'react';
import { Project } from '../../../types/project';
import { Sprint } from '../../../types/sprint';
import { projectApi, userApi } from '../../../api/filrouge';
import Button from '../../ui/button/Button';
import Badge from '../../ui/badge/Badge';
import Avatar from '../../ui/avatar/Avatar';
import { Modal } from '../../ui/modal';
import { Plus, Mail, UserMinus, Search, Loader2 } from 'lucide-react';

interface UserDto {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  avatarFileId?: string;
}

interface MembersPanelProps {
  project: Project;
  sprints: Sprint[];
  onMemberUpdate: () => void;
}

export function MembersPanel({ project, sprints, onMemberUpdate }: MembersPanelProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState<UserDto[]>([]);
  const [projectMembers, setProjectMembers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [project.members]);

  const fetchMembers = async () => {
    setLoading(true);
    try {

      const allUsers = await userApi.searchUsers('');
      const members = allUsers?.filter(u => project.members?.includes(u.id)) || [];
      setProjectMembers(members);

      const filtered = allUsers?.filter(u => !project.members?.includes(u.id)) || [];
      setAvailableUsers(filtered);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    setActionLoading(userId);
    try {
      await projectApi.addMember(project.id, userId);
      onMemberUpdate();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to add member:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    setActionLoading(userId);
    try {
      await projectApi.removeMember(project.id, userId);
      onMemberUpdate();
    } catch (err) {
      console.error('Failed to remove member:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredAvailableUsers = availableUsers.filter(u =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.fullName && u.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading && projectMembers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Team Members</h2>
          <p className="text-sm text-gray-600">{(project.members || []).length} members in this project</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
          startIcon={<Plus className="w-4 h-4" />}
        >
          Add Member
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectMembers.map((user) => {
          const activeSprint = (sprints || []).find(s => s.status === 'ACTIVE');
          const memberWorkItems = activeSprint?.workItems?.filter(wi =>
            wi.assignedUserIds?.includes(user.id)
          ).length || 0;

          return (
            <div key={user.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex items-start gap-4">
                <Avatar
                  src={user.avatarFileId ? `http://localhost:8080/api/users/avatar/${user.avatarFileId}` : `https://ui-avatars.com/api/?name=${user.fullName || user.email}&background=random`}
                  size="large"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{user.fullName || 'No Name'}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <Badge variant="light" color="primary" size="sm">
                    {memberWorkItems} active work items
                  </Badge>
                </div>
                <button
                  onClick={() => handleRemoveMember(user.id)}
                  disabled={actionLoading === user.id}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Remove member"
                >
                  {actionLoading === user.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <UserMinus className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} className="max-w-lg">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Add Team Member</h3>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredAvailableUsers.length > 0 ? (
              filteredAvailableUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 border border-transparent hover:border-orange-100 cursor-pointer transition-all group"
                  onClick={() => handleAddMember(user.id)}
                >
                  <Avatar
                    src={user.avatarFileId ? `http://localhost:8080/api/users/avatar/${user.avatarFileId}` : `https://ui-avatars.com/api/?name=${user.fullName || user.email}&background=random`}
                    size="medium"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                      {user.fullName || 'No Name'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-5 h-5 text-orange-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No users found</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
