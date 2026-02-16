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

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your submissions...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
                <p className="text-gray-500 mt-1">Track your homework submissions and feedback</p>
            </div>

            <div className="space-y-4">
                {submissions.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Submissions Yet</h3>
                        <p className="text-gray-500">You haven't submitted any homework yet.</p>
                    </div>
                ) : (
                    submissions.map((sub) => (
                        <div key={sub.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                                ${sub.status === 'VALIDATED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    sub.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                                                {sub.status === 'VALIDATED' && <CheckCircle className="w-3 h-3 mr-1" />}
                                                {sub.status === 'REJECTED' && <XCircle className="w-3 h-3 mr-1" />}
                                                {sub.status === 'PENDING' && <Clock className="w-3 h-3 mr-1" />}
                                                {sub.status}
                                            </span>
                                            <span className="text-sm text-gray-400 text-xs">
                                                Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Homework Submission</h3> {/* Ideally get Title from backend or populate it */}
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
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">My Comment</h4>
                                        <p className="text-sm text-gray-700">{sub.studentComment || 'No comment provided.'}</p>
                                    </div>

                                    {sub.reviewerComment && (
                                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageCircle className="w-4 h-4 text-orange-500" />
                                                <h4 className="text-xs font-bold text-orange-600 uppercase tracking-wider">Reviewer Feedback</h4>
                                            </div>
                                            <p className="text-sm text-gray-800">{sub.reviewerComment}</p>
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
