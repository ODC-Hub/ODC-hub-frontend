import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../../ui/button/Button';
import { projectApi, userApi } from '../../../api/filrouge';

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProjectCreated?: () => void;
}

interface User {
    id: string;
    email: string;
    fullName?: string;
    role: string;
    avatarFileId?: string;
}

export function CreateProjectModal({ open, onOpenChange, onProjectCreated }: CreateProjectModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]); // User IDs
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            fetchUsers();
            setName('');
            setDescription('');
            setSelectedMembers([]);
            setError(null);
        }
    }, [open]);

    const fetchUsers = async () => {
        try {
            setError(null);

            const data = await userApi.searchUsers('', 'BOOTCAMPER');
            setUsers(data);
        } catch (err: any) {
            console.error("Failed to fetch users", err);
            if (err.response) {
                setError(`Error: ${err.response.status} ${err.response.statusText}`);
            } else {
                setError("Failed to load users. Backend might be down.");
            }
        }
    };

    const toggleMember = (userId: string) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers(selectedMembers.filter(id => id !== userId));
        } else {
            setSelectedMembers([...selectedMembers, userId]);
        }
    };

    const selectAllUsers = () => {
        if (selectedMembers.length === users.length) {
            setSelectedMembers([]);
        } else {
            setSelectedMembers(users.map(u => u.id));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await projectApi.createProject({
                name,
                description,
                memberIds: selectedMembers
            });
            onOpenChange(false);
            if (onProjectCreated) onProjectCreated();
        } catch (error) {
            console.error("Failed to create project", error);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Project</h2>
                    <button onClick={() => onOpenChange(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="e.g. ODC Hub Filerouge"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all h-24 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                            placeholder="Brief description of the project..."
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Team Members (Bootcampers)
                            </label>
                            <button type="button" onClick={selectAllUsers} className="text-xs text-brand-500 hover:underline">
                                {selectedMembers.length === users.length ? "Deselect All" : "Select All"}
                            </button>
                        </div>
                        {error && (
                            <div className="mb-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-600 dark:text-red-400">
                                <p className="font-semibold">{error}</p>
                                {error.includes("404") && (
                                    <p> Please RESTART the Backend Server</p>
                                )}
                            </div>
                        )}
                        <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg p-3 custom-scrollbar bg-white dark:bg-gray-700">
                            {users.map(u => (
                                <div key={u.id} className="flex items-center mb-2 last:mb-0 hover:bg-gray-50 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
                                    <input
                                        type="checkbox"
                                        id={`user-${u.id}`}
                                        checked={selectedMembers.includes(u.id)}
                                        onChange={() => toggleMember(u.id)}
                                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                                    />
                                    <label htmlFor={`user-${u.id}`} className="ml-3 text-sm text-gray-900 dark:text-white cursor-pointer flex-1 select-none flex items-center gap-2">
                                        {/* Avatar Logic */}
                                        {u.avatarFileId ? (
                                            <img
                                                src={`http://35.181.154.39:8080/api/users/avatar/${u.avatarFileId}`}
                                                alt={u.fullName}
                                                className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                                                onError={(e) => {

                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                }}
                                            />
                                        ) : null}

                                        {!u.avatarFileId && (
                                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-[10px] uppercase shrink-0">
                                                {u.fullName ? u.fullName.substring(0, 2) : u.email.substring(0, 2)}
                                            </div>
                                        )}

                                        <div className="flex flex-col">
                                            <span className="font-medium">{u.fullName || u.email}</span>
                                            {u.fullName && <span className="text-xs text-gray-500 dark:text-gray-400">{u.email}</span>}
                                        </div>
                                    </label>
                                </div>
                            ))}
                            {users.length === 0 && !error && (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">No bootcampers found</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={loading || !name}>
                        {loading ? 'Creating...' : 'Create Project'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
