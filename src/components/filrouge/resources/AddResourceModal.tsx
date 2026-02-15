import { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { resourceApi } from '../../../api/resources';
import { ResourceType } from '../../../types/resource';
import { MODULES } from './constants';
import { userApi } from '../../../api/users';
import { UserResponseDto } from '../../../types/user';

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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="px-8 py-6 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Add New Resource</h3>
                        <p className="text-sm text-gray-500 mt-1">Share learning materials with your students</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-900">Title *</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 placeholder-gray-400"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter resource title"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-900">Module *</label>
                        <select
                            className="w-full px-4 py-3 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700"
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
                        <label className="block text-sm font-bold text-gray-900">Type *</label>
                        <select
                            className="w-full px-4 py-3 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700"
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
                        <div className="space-y-4 p-6 bg-orange-50 rounded-xl border border-orange-100">
                            <h4 className="font-bold text-gray-900 text-sm">Assignment</h4>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="assignment"
                                        checked={assignToAll}
                                        onChange={() => setAssignToAll(true)}
                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">All Bootcampers</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="assignment"
                                        checked={!assignToAll}
                                        onChange={() => setAssignToAll(false)}
                                        className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Select Bootcampers</span>
                                </label>
                            </div>

                            {!assignToAll && (
                                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                                    <div className="flex justify-between items-center mb-3">
                                        <h5 className="text-sm font-bold text-gray-700">Team Members (Bootcampers)</h5>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedUsers(users.map(u => u.id))}
                                            className="text-xs text-orange-600 hover:text-orange-700 font-medium"
                                        >
                                            Select All
                                        </button>
                                    </div>

                                    {loadingUsers ? (
                                        <p className="text-sm text-gray-500">Loading bootcampers...</p>
                                    ) : users.length === 0 ? (
                                        <p className="text-sm text-gray-500">No bootcampers found</p>
                                    ) : (
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {users.map((user) => (
                                                <label
                                                    key={user.id}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
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
                                                    <div className="flex items-center gap-3 flex-1">
                                                        {user.avatarFileId ? (
                                                            <img
                                                                src={`http://localhost:8080/api/avatars/${user.avatarFileId}`}
                                                                alt={user.fullName || user.email}
                                                                className="w-10 h-10 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
                                                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {user.fullName || 'Bootcamper'}
                                                            </p>
                                                            <p className="text-xs text-gray-500">{user.email}</p>
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
                        <label className="block text-sm font-bold text-gray-900">Description *</label>
                        <textarea
                            className="w-full px-4 py-3 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 placeholder-gray-400 min-h-[100px] resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this resource covers..."
                            required
                        />
                    </div>

                    {type === 'LINK' ? (
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-900">Link URL</label>
                            <div className="relative">
                                <LinkIcon className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                                <input
                                    type="url"
                                    className="w-full pl-10 pr-4 py-3 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-gray-700 placeholder-gray-400"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    placeholder="https://example.com"
                                    required
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-900">Upload File *</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-white">
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
                                    <p className="text-sm font-medium text-gray-700">
                                        {file ? file.name : 'Upload your file'}
                                    </p>
                                    {!file && (
                                        <button type="button" className="mt-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            Choose File
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
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
        </div>
    );
}
