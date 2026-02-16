import {
    FileText,
    Link as LinkIcon,
    Download,
    ExternalLink,
    Eye,
    Upload,
    Calendar,
    Wrench,
    PenTool
} from 'lucide-react';
import { ResourceResponse } from '../../../types/resource';
import { resourceApi } from '../../../api/resources';
import { useState } from 'react';

interface ResourceCardProps {
    resource: ResourceResponse;
    onSubmitHomework?: (resource: ResourceResponse) => void;
    isFormateur?: boolean;
    onValidate?: (id: string) => void;
}

export function ResourceCard({ resource, onSubmitHomework, isFormateur, onValidate }: ResourceCardProps) {
    const [loading, setLoading] = useState(false);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'PDF':
                return <FileText className="w-5 h-5 text-gray-600" />;
            case 'LINK':
                return <LinkIcon className="w-5 h-5 text-gray-600" />;
            case 'HOMEWORK':
                return <FileText className="w-5 h-5 text-gray-600" />;
            case 'ATELIER':
                return <Wrench className="w-5 h-5 text-gray-600" />;
            default:
                return <FileText className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTypeBadge = (type: string) => {
        const baseClasses = "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm";
        switch (type) {
            case 'PDF':
                return <span className={`${baseClasses} bg-blue-100 text-blue-700 rounded-xl border border-blue-300 `}>PDF</span>;
            case 'LINK':
                return <span className={`${baseClasses} bg-green-100 text-green-700 rounded-xl border border-green-300 `}>LINK</span>;
            case 'HOMEWORK':
                return <span className={`${baseClasses} bg-orange-100 text-orange-700 rounded-xl border border-orange-300 `}>HOMEWORK</span>;
            case 'ATELIER':
                return <span className={`${baseClasses} bg-purple-100 text-purple-700 rounded-xl border border-purple-300 `}>ATELIER</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-700 rounded-xl border border-gray-300 `}>{type}</span>;
        }
    };

    const handleDownload = async () => {
        if (!resource.gridFsFileId) return;
        try {
            setLoading(true);
            await resourceApi.downloadFile(resource.gridFsFileId, resource.filename || resource.title);
        } catch (error) {
            console.error('Download failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = async () => {
        if (!resource.gridFsFileId) return;
        try {
            setLoading(true);
            await resourceApi.viewFile(resource.gridFsFileId);
        } catch (error) {
            console.error('View failed', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition relative">
            {/* Top Right Type Badge */}
            <div className="absolute top-6 right-6">
                {getTypeBadge(resource.type)}
            </div>

            <div className="flex flex-col gap-4">
                {/* Header: Icon + Title */}
                <div className="flex items-start bg-transparent gap-3 pr-20"> {/* pr-20 to avoid overlap with badge */}
                    <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(resource.type)}
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900 line-clamp-1" title={resource.title}>
                            {resource.title}
                        </h3>
                    </div>
                </div>

                {/* Description */}
                <div className="pl-8"> {/* Indent to align with title */}
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {resource.description || "No description provided."}
                    </p>

                    <div className="text-xs text-gray-400 mb-4">
                        Uploaded: {new Date(resource.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-2">
                        {resource.type === 'LINK' && resource.link && (
                            <a
                                href={resource.link.startsWith('http') ? resource.link : `https://${resource.link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Open Link
                            </a>
                        )}

                        {resource.hasFile && resource.gridFsFileId && (
                            <>
                                <button
                                    onClick={handleView}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <Eye className="w-4 h-4" />
                                    View
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </>
                        )}

                        {isFormateur && !resource.validated && onValidate && (
                            <button
                                onClick={() => onValidate(resource.id)}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Validate
                            </button>
                        )}

                        {resource.type === 'HOMEWORK' && onSubmitHomework && (
                            <button
                                onClick={() => onSubmitHomework(resource)}
                                className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors shadow-sm"
                            >
                                <Upload className="w-4 h-4" />
                                Submit Homework
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
