import { useState, useEffect } from 'react';
import { BookOpen, Calendar, CheckCircle, Clock, ExternalLink, MessageCircle, XCircle } from 'lucide-react';
import { resourceApi } from '../api/resources';
import { LivrableResponse } from '../types/resource';

export default function MySubmissionsPage() {
    const [submissions, setSubmissions] = useState<LivrableResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const data = await resourceApi.getMyLivrables();
                setSubmissions(data);
            } catch (error) {
                console.error("Failed to fetch my submissions", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading your submissions...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Submissions</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Track your homework submissions and feedback</p>
            </div>

            <div className="space-y-4">
                {submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Submissions Yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">You haven't submitted any homework yet.</p>
                    </div>
                ) : (
                    submissions.map((sub) => (
                        <div key={sub.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${sub.status === 'VALIDATED' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-700' :
                                                    sub.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-700' :
                                                        'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700'}`}>
                                                {sub.status === 'VALIDATED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                {sub.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                                                {sub.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                                {sub.status}
                                            </span>
                                            <span className="text-sm text-gray-400 dark:text-gray-500 text-xs">
                                                Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Homework Submission</h3>
                                    </div>
                                    {sub.fileId && (
                                        <button
                                            onClick={() => resourceApi.viewFile(sub.fileId!)}
                                            className="text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1.5 text-sm font-medium"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View File
                                        </button>
                                    )}
                                </div>

                                <div className="mt-4 grid md:grid-cols-2 gap-6">
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">My Comment</h4>
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{sub.studentComment || 'No comment provided.'}</p>
                                    </div>

                                    {sub.reviewerComment && (
                                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-100 dark:border-orange-800">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageCircle className="w-4 h-4 text-orange-500" />
                                                <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Reviewer Feedback</h4>
                                            </div>
                                            <p className="text-sm text-gray-800 dark:text-gray-300">{sub.reviewerComment}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
