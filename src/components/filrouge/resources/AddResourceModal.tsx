import { useState, useEffect } from 'react';
import { Upload, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { resourceApi } from '../../../api/resources';
import { ResourceType } from '../../../types/resource';
import { MODULES } from './constants';
import { userApi } from '../../../api/users';
import { UserResponseDto } from '../../../types/user';
import { Modal } from '@/components/ui/modal';

interface AddResourceModalProps {
    onClose: () => void;
    onSuccess: (moduleId?: string) => void;
    moduleId?: string;
}

export function AddResourceModal({ onClose, onSuccess, moduleId }: AddResourceModalProps) {
    const [title, setTitle] = useState('');
    const [selectedModuleId, setSelectedModuleId] = useState(moduleId || '');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ResourceType>('PDF');
    const [link, setLink] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Assignment State
    const [assignToAll, setAssignToAll] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [users, setUsers] = useState<UserResponseDto[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (type === 'HOMEWORK' && !assignToAll && users.length === 0) {
            fetchUsers();
        }
    }, [type, assignToAll]);

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const data = await userApi.searchUsers({ role: 'BOOTCAMPER' });
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!title || !selectedModuleId || !description) {
                throw new Error('Please fill in all required fields');
            }

            if (type === 'LINK' && !link) {
                throw new Error('Please provide a link');
            }

            if (type !== 'LINK' && !file) {
                throw new Error('Please upload a file');
            }

            const payload: any = {
                title,
                moduleId: selectedModuleId,
                description,
                type,
                link: type === 'LINK' ? link : undefined,
            };

            if (type === 'HOMEWORK' && !assignToAll) {
                if (selectedUsers.length === 0) throw new Error("Please select at least one student");
                payload.assignedTo = selectedUsers;
            }

            await resourceApi.createResource(payload, file || undefined);

            onSuccess(selectedModuleId);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to create resource');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div>
                <div className="px-8 py-6 flex items-start">
                    <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Resource</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Share learning materials with your students</p>

                      
                    </div>
                </div>

                <form onSubmit={handleSubmit}  className="px-8 pb-8 space-y-6 overflow-y-auto max-h-[75vh]">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-900 dark:text-white">Title *</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter resource title"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-900 dark:text-white">Module *</label>
                        <select
                            className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 dark:text-gray-200"
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                            required
                        >
                            <option value="">Select a module</option>
                            {MODULES.map((mod) => (
                                <option key={mod.id} value={mod.id}>
                                    {mod.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-900 dark:text-white">Type *</label>
                        <select
                            className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 dark:text-gray-200"
                            value={type}
                            onChange={(e) => setType(e.target.value as ResourceType)}
                            required
                        >
                            <option value="PDF">PDF</option>
                            <option value="LINK">LINK</option>
                            <option value="ATELIER">ATELIER</option>
                            <option value="HOMEWORK">HOMEWORK</option>
                        </select>
                    </div>

                    {/* Assignment Section for HOMEWORK */}
                    {type === 'HOMEWORK' && (
                        <div className="space-y-4 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-800">
                            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Assignment</h4>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="assignment"
                                        checked={assignToAll}
                                        onChange={() => setAssignToAll(true)}
                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All Bootcampers</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="assignment"
                                        checked={!assignToAll}
                                        onChange={() => setAssignToAll(false)}
                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Bootcampers</span>
                                </label>
                            </div>

                            {!assignToAll && (
                                <div className="mt-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between items-center mb-3">
                                        <h5 className="text-sm font-bold text-gray-700 dark:text-gray-300">Team Members (Bootcampers)</h5>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUsers(users.map(u => u.id))}
                                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            Select All
                                        </button>
                                    </div>

                                    {loadingUsers ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Loading bootcampers...</p>
                                    ) : users.length === 0 ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No bootcampers found</p>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {users.map((user) => (
                                                <label
                                                    key={user.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-lg cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedUsers([...selectedUsers, user.id]);
                                                            } else {
                                                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
                                                    />
                                                  <div className="flex items-center gap-3 flex-1 min-w-0">

                                                        {user.avatarFileId ? (
                                                            <img
                                                                src={`http://localhost:8080/api/users/avatar/${user.avatarFileId}`}
                                                                alt={user.fullName || user.email}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">

                                                           <p className="text-sm font-medium text-gray-900 dark:text-white truncate">

                                                                {user.fullName || 'Bootcamper'}
                                                            </p>
                                                           <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                               {user.email}
                                                               </p>
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-900 dark:text-white">Description *</label>
                        <textarea
                            className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 min-h-[100px] resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this resource covers..."
                            required
                        />
                    </div>

                    {type === 'LINK' ? (
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-900 dark:text-white">Link URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="url"
                                    className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-900 dark:text-white">Upload File *</label>
                            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative bg-white dark:bg-gray-700/30">
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    required
                                />
                                <div className="flex flex-col items-center gap-2 pointer-events-none">
                                    <div className="mb-2">
                                        <Upload className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {file ? file.name : 'Upload your file'}
                                    </p>
                                    {!file && (
                                        <button type="button" className="mt-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm">
                                            Choose File
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating...' : 'Create Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
