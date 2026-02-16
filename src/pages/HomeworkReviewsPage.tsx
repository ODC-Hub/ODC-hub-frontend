import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, ChevronRight } from 'lucide-react';
import { resourceApi } from '../api/resources';
import { ResourceResponse } from '../types/resource';
import { MODULES } from '../components/filrouge/resources/constants';

export default function HomeworkReviewsPage() {
    const navigate = useNavigate();
    const [homeworks, setHomeworks] = useState<ResourceResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHomeworks = async () => {
            try {
                const resources = await resourceApi.getAllResources(false);
                const homeworkResources = resources.filter(r => r.type === 'HOMEWORK');
                setHomeworks(homeworkResources);
            } catch (error) {
                console.error("Failed to fetch homeworks", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeworks();
    }, []);

    const getModuleName = (id: string) => MODULES.find(m => m.id === id)?.name || 'Unknown Module';

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading homeworks...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Homework Reviews</h1>
                <p className="text-gray-500 mt-1">Review and validate bootcamper submissions</p>
            </div>

            <div className="space-y-4">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-1">Homework Assignments</h3>
                    <p className="text-sm text-gray-500">Select a homework to view submissions</p>
                </div>

                {homeworks.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Homework Assigned</h3>
                        <p className="text-gray-500">You haven't posted any homework resources yet.</p>
                    </div>
                ) : (
                    homeworks.map((hw) => (
                        <div
                            key={hw.id}
                            onClick={() => navigate(`/homework/${hw.id}/reviews`)}
                            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-center"
                        >
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">
                                    {hw.title}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">{getModuleName(hw.moduleId)}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-xs text-gray-500">{(hw.totalSubmissions || 0)} submissions</span>
                                {(hw.pendingSubmissions || 0) > 0 && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        {hw.pendingSubmissions} pending
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
