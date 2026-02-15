import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, User } from 'lucide-react';
import { resourceApi } from '../api/resources';
import { LivrableResponse } from '../types/resource';

// Format date as "Jan 24, 2026"
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function HomeworkDetailsPage() {
    const { resourceId } = useParams();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<LivrableResponse[]>([]);
    const [loading, setLoading] = useState(true);

    // State for review comments, keyed by submission ID
    const [reviewComments, setReviewComments] = useState<Record<string, string>>({});
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        if (!resourceId) return;
        fetchData();
    }, [resourceId]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const subs = await resourceApi.getLivrablesByResource(resourceId!);
            setSubmissions(subs);
        } catch (error) {
            console.error("Failed to fetch submissions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentChange = (id: string, value: string) => {
        setReviewComments(prev => ({ ...prev, [id]: value }));
    };

    const handleReview = async (id: string, status: 'VALIDATED' | 'REJECTED') => {
        setActionLoading(id);
        try {
            await resourceApi.reviewLivrable(id, status, reviewComments[id] || '');
            await fetchData();
            // clear comment after success
            setReviewComments(prev => {
                const newState = { ...prev };
                delete newState[id];
                return newState;
            });
        } catch (error) {
            console.error("Failed to submit review", error);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading submissions...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/homework-reviews')}
                className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors font-medium text-sm"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Homework List
            </button>

            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">Submitted Work</h1>
                <p className="text-sm text-gray-500 mt-1">Review student submissions below</p>
            </div>

            <div className="space-y-6">
                {submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-500">No submissions found for this homework.</p>
                    </div>
                ) : (
                    submissions.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <User className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-base">{sub.bootcamperName || 'Unknown Student'}</h3>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                            <span>{formatDate(sub.submittedAt)}</span>
                                            {sub.filename && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">{sub.filename}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    {sub.status === 'VALIDATED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Validated</span>}
                                    {sub.status === 'REJECTED' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Rejected</span>}
                                    {sub.status === 'PENDING' && <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">Pending</span>}
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Student Comment</p>
                                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                                    {sub.studentComment || 'No comment provided.'}
                                </div>
                            </div>

                            {sub.fileId && (
                                <button
                                    onClick={() => resourceApi.viewFile(sub.fileId!)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 transition-colors mb-4"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Submission
                                </button>
                            )}

                            {sub.status === 'PENDING' ? (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Review Comment</label>
                                    <textarea
                                        className="w-full px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-gray-700 resize-none min-h-[80px] mb-3"
                                        placeholder="Provide feedback to the bootcamper..."
                                        value={reviewComments[sub.id] || ''}
                                        onChange={(e) => handleCommentChange(sub.id, e.target.value)}
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleReview(sub.id, 'VALIDATED')}
                                            disabled={actionLoading === sub.id}
                                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {actionLoading === sub.id ? 'Saving...' : 'Validate'}
                                        </button>
                                        <button
                                            onClick={() => handleReview(sub.id, 'REJECTED')}
                                            disabled={actionLoading === sub.id}
                                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            {actionLoading === sub.id ? 'Saving...' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <p className="text-xs font-bold text-blue-500 mb-2 uppercase flex items-center gap-1.5">
                                        <span>📝</span> Your Feedback
                                    </p>
                                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-gray-700 border border-blue-100">
                                        {sub.reviewerComment || 'No feedback provided.'}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
