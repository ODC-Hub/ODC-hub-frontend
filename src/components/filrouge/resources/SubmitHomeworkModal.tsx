import { useState } from 'react';
import { X, Upload, AlertCircle, MessageSquare } from 'lucide-react';
import { resourceApi } from '../../../api/resources';
import { ResourceResponse } from '../../../types/resource';

interface SubmitHomeworkModalProps {
    resource: ResourceResponse;
    onClose: () => void;
    onSuccess: () => void;
}

export function SubmitHomeworkModal({ resource, onClose, onSuccess }: SubmitHomeworkModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (!file) {
                throw new Error('Please upload a file');
            }

            await resourceApi.submitLivrable(resource.id, file, comment);

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit homework');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[99999] backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-lg">
                <div className="px-6 py-4 relative">
                    <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X className="w-5 h-5" />
                    </button>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white pr-8">
                        Submit Homework: {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {resource.description || "Upload your work for this assignment."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-5">
                    {error && (
                        <div className="flex gap-2 p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload File</label>
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative bg-white dark:bg-gray-700/30">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                required
                            />
                            <div className="flex flex-col items-center gap-3 pointer-events-none">
                                <div className="p-3 bg-white dark:bg-gray-700 rounded-full">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                </div>

                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {file ? <span className="font-semibold text-gray-900 dark:text-white">{file.name}</span> : 'Drag and drop your file here, or click to browse'}
                                </p>

                                {!file && (
                                    <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm">
                                        Choose File
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment (Optional)</label>
                        <div className="relative">
                            <textarea
                                className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none min-h-[100px] resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add any notes or comments about your submission..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-orange-400 rounded-md hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 shadow-sm"
                            style={{ backgroundColor: '#FF8A65' }} // Matching the specific light orange/coral color from image 4 button "Submit Homework"
                        >
                            {loading ? 'Submitting...' : 'Submit Homework'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
