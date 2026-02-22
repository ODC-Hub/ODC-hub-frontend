import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { ResourceResponse } from '../../../types/resource';
import { resourceApi } from '../../../api/resources';
import { ResourceCard } from './ResourceCard';
import { AddResourceModal } from './AddResourceModal';
import { SubmitHomeworkModal } from './SubmitHomeworkModal';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { Eye, Trash2 } from 'lucide-react';
import { MODULES } from './constants';
import ConfirmationDialog from '@/components/common/ConfirmationDialog';
import { useSearchParams } from "react-router-dom";

export default function ResourcesPage() {
    const { user } = useAuth();

    const isFormateur = user?.role === 'FORMATEUR' || user?.role === 'ADMIN' || (user as any)?.roles?.includes('FORMATEUR');

    const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
    const [resources, setResources] = useState<ResourceResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedResourceForHomework, setSelectedResourceForHomework] = useState<ResourceResponse | null>(null);

    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const [searchParams] = useSearchParams();
    const highlightedResourceId = searchParams.get("resourceId");

    const fetchResources = async (moduleId = selectedModuleId) => {
        setLoading(true);
        try {
            // isFormateur determines if we fetch only validated resources
            // !isFormateur = true (Bootcamper) -> validatedOnly = true
            // !isFormateur = false (Formateur) -> validatedOnly = false (All resources)
            const validatedOnly = !isFormateur;

            let data: ResourceResponse[];
            if (moduleId === 'all') {
                data = await resourceApi.getAllResources(validatedOnly);
            } else {
                data = await resourceApi.getResourcesByModule(moduleId, validatedOnly);
            }
            setResources(data);
        } catch (error) {
            console.error('Failed to fetch resources', error);
            // toast.error('Failed to load resources');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResources();
    }, [selectedModuleId, isFormateur]);

    useEffect(() => {
        if (!highlightedResourceId || resources.length === 0) return;

        // wait for DOM paint
        const timeout = setTimeout(() => {
            const el = document.getElementById(`resource-${highlightedResourceId}`);
            if (el) {
            el.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
            }
        }, 100); // small delay to ensure DOM is ready

        return () => clearTimeout(timeout);
    }, [highlightedResourceId, resources]);

    const handleResourceCreated = (newResourceModuleId?: string) => {
        toast.success('Resource created successfully');

        // If a specific module was used for creation, switch to it so user sees their new resource
        if (newResourceModuleId && newResourceModuleId !== selectedModuleId) {
            setSelectedModuleId(newResourceModuleId); // This triggers useEffect -> fetchResources
        } else {
            fetchResources(); // Just refresh current
        }
    };

    const handleHomeworkSubmitted = () => {
        toast.success('Homework submitted successfully');
        setSelectedResourceForHomework(null);
    };

    const handleValidate = async (id: string) => {
        try {
            await resourceApi.validateResource(id);
            toast.success('Resource validated');
            fetchResources();
        } catch (error) {
            toast.error('Failed to validate resource');
        }
    };

    const handleDeleteRequest = (id: string) => {
        setDeleteTargetId(id);
    };
const confirmDelete = async () => {
  if (!deleteTargetId) return;

  try {
    setDeleteLoading(true);
    await resourceApi.deleteResource(deleteTargetId);
    toast.success("Resource deleted successfully");
    fetchResources();
  } catch (error) {
    console.error("Failed to delete resource", error);
    toast.error("Failed to delete resource");
  } finally {
    setDeleteLoading(false);
    setDeleteTargetId(null);
  }
};
    const getTypeBadge = (type: string) => {
        const baseClasses = "px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-sm";
        switch (type) {
            case 'PDF':
                return <span className={`${baseClasses} bg-blue-100 text-blue-700 rounded-xl border border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700`}>PDF</span>;
            case 'LINK':
                return <span className={`${baseClasses} bg-green-100 text-green-700 rounded-xl border border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700`}>LINK</span>;
            case 'HOMEWORK':
                return <span className={`${baseClasses} bg-orange-100 text-orange-700 rounded-xl border border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700`}>HOMEWORK</span>;
            case 'ATELIER':
                return <span className={`${baseClasses} bg-purple-100 text-purple-700 rounded-xl border border-purple-300 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-700`}>ATELIER</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>{type}</span>;
        }
    };

    const getModuleName = (id: string) => {
        if (id === 'all') return 'All Modules';
        return MODULES.find(m => m.id === id)?.name || 'Unknown Module';
    };

    const selectedModuleName = getModuleName(selectedModuleId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 dark:border-gray-700">
                <div>
                    {isFormateur ? (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Resources</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload and organize learning materials for your bootcampers</p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Learning Resources</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access course materials, workshops, and homework assignments</p>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Module Filter */}
                    <div className="relative">
                        <select
                            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-sm font-normal text-gray-900 dark:text-white py-2.5 px-4 pr-10 rounded-lg outline-none cursor-pointer hover:border-gray-300 dark:hover:border-gray-500 transition-colors appearance-none min-w-[300px] shadow-sm"
                            value={selectedModuleId}
                            onChange={(e) => setSelectedModuleId(e.target.value)}
                        >
                            <option value="all">All Modules</option>
                            {MODULES.map((m) => (
                                <option className='rounded-lg' key={m.id} value={m.id}>{m.name} </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                    {isFormateur && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
                        >
                            <Plus className="w-5 h-5" />
                            Add Resource
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {isFormateur ? (
                // TABLE VIEW FOR FORMATEUR
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 bg-white dark:bg-gray-800 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                            All Resources  ({resources.length})
                        </h3>
                        {loading && <span className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">Loading...</span>}
                    </div>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-sm font-semibold border-b border-gray-100 dark:border-gray-700 tracking-wider dark:text-gray-300">
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Module</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Uploaded</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {resources.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="font-medium">No resources found in this module.</p>
                                            <p className="text-xs">Try selecting a different module or add a new resource.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                resources.map((resource) => (
                                    <tr id={`resource-${resource.id}`}
                                        key={resource.id} className={`hover:bg-gray-50 transition-colors ${
                                        resource.id === highlightedResourceId
                                        ? "bg-orange-50 ring-2 ring-orange-300"
                                        : ""
                                    }`}>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{resource.title}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-md truncate">{resource.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {MODULES.find(m => m.id === resource.moduleId)?.name || 'Unknown Module'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 ">
                                            {getTypeBadge(resource.type)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(resource.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        if (resource.gridFsFileId) resourceApi.viewFile(resource.gridFsFileId);
                                                        else if (resource.link) window.open(resource.link, '_blank');
                                                    }}
                                                    className="text-gray-800 dark:text-gray-300 hover:text-gray-600 dark:hover:text-white transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                {!resource.validated && (
                                                    <button
                                                        onClick={() => handleValidate(resource.id)}
                                                        className="text-orange-400 hover:text-orange-600 transition-colors"
                                                        title="Validate"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteRequest(resource.id)}                                                    
                                                    className="text-red-600 hover:text-red-500   transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                // CARD VIEW FOR BOOTCAMPER / GENERAL VIEW
                <div>
                    {selectedModuleId === 'all' ? (
                        // GROUPED BY MODULE VIEW
                        <div className="space-y-12">
                            {MODULES.map((module) => {
                                const moduleResources = resources.filter(r => r.moduleId === module.id);
                                if (moduleResources.length === 0) return null;

                                return (
                                    <div key={module.id} className="space-y-4">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {module.name}
                                            </h3>
                                        </div>
                                        <div className="space-y-4">
                                            {moduleResources.map((resource) => (
                                                <ResourceCard
                                                    key={resource.id}
                                                    resource={resource}
                                                    isFormateur={isFormateur}
                                                    highlighted={resource.id === highlightedResourceId}
                                                    onSubmitHomework={(r) => setSelectedResourceForHomework(r)}
                                                    onValidate={handleValidate}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {resources.length === 0 && !loading && (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                                    <div className="text-gray-500 dark:text-gray-400">No resources found.</div>
                                </div>
                            )}
                        </div>
                    ) : (
                        // SINGLE MODULE VIEW
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                                {selectedModuleName}
                            </h3>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-32 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                                    ))}
                                </div>
                            ) : resources.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                                    <div className="text-gray-500 dark:text-gray-400">No resources found in this module.</div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {resources.map((resource) => (
                                        <ResourceCard
                                            key={resource.id}
                                            resource={resource}
                                            isFormateur={isFormateur}
                                            highlighted={resource.id === highlightedResourceId}
                                            onSubmitHomework={(r) => setSelectedResourceForHomework(r)}
                                            onValidate={handleValidate}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {showAddModal && (
                <AddResourceModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleResourceCreated} // Pass the function to handle switching
                    moduleId={selectedModuleId}
                />
            )}

            {selectedResourceForHomework && (
                <SubmitHomeworkModal
                    resource={selectedResourceForHomework}
                    onClose={() => setSelectedResourceForHomework(null)}
                    onSuccess={handleHomeworkSubmitted}
                />
            )}

            <ConfirmationDialog
                open={!!deleteTargetId}
                title="Delete resource"
                message="This action is irreversible. The resource will be permanently deleted."
                confirmText="Delete"
                cancelText="Cancel"
                danger
                confirmDisabled={deleteLoading}
                onCancel={() => setDeleteTargetId(null)}
                onConfirm={confirmDelete}
                />
        </div>
    );
}
