import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPlus, FiSave } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import AnalyticsCharts from '../components/AnalyticsCharts';

const ProctorStudentAnalyticsDetail = () => {
    const { studentId } = useParams();
    const { token } = useContext(AuthContext);

    // State for displaying data
    const [analyticsData, setAnalyticsData] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // State for forms
    const [testName, setTestName] = useState('');
    const [score, setScore] = useState('');
    const [maxScore, setMaxScore] = useState('');
    const [remarksInput, setRemarksInput] = useState('');

    const fetchAnalytics = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/analytics/student/${studentId}`, { headers: { Authorization: token } });
            setAnalyticsData(response.data.data);
            setRemarks(response.data.remarks);
            setRemarksInput(response.data.remarks); // Pre-fill remarks textarea
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setIsLoading(false);
        }
    }, [studentId, token]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleAddGrade = async (e) => {
        e.preventDefault();
        try {
            await api.post('/analytics/manual-grade', { student: studentId, testName, score, maxScore }, { headers: { Authorization: token } });
            setTestName(''); setScore(''); setMaxScore(''); // Reset form
            fetchAnalytics(); // Refresh data
        } catch (error) {
            toast.error('Failed to add grade.');
        }
    };

    const handleUpdateRemarks = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/analytics/remarks/${studentId}`, { remarks: remarksInput }, { headers: { Authorization: token } });
            fetchAnalytics(); // Refresh data
            toast.success('Remarks updated successfully!');
        } catch (error) {
            toast.error('Failed to update remarks.');
        }
    };

    if (isLoading) return <div>Loading analytics...</div>;

    return (
        <div className="space-y-8">
            <Link to="/proctor/analytics" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"><FiArrowLeft />Back to Student List</Link>
            
             {/* ADD THE CHARTS COMPONENT HERE */}
            <AnalyticsCharts data={analyticsData} />
            
            {/* Analytics Table */}
            <div className="bg-white shadow rounded-lg p-6"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade/Score</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th></tr></thead><tbody className="bg-white divide-y divide-gray-200">{analyticsData.map((item, index) => (<tr key={index}><td className="px-6 py-4 text-sm font-medium text-gray-900">{item.type}</td><td className="px-6 py-4 text-sm text-gray-500">{item.title}</td><td className="px-6 py-4 text-sm font-semibold text-gray-700">{item.grade}</td><td className="px-6 py-4 text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td></tr>))}</tbody></table></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add Manual Grade Form */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-4">Add Manual Grade</h3>
                    <form onSubmit={handleAddGrade} className="space-y-4">
                        <input type="text" placeholder="Test Name" value={testName} onChange={(e) => setTestName(e.target.value)} className="w-full border-gray-300 rounded-md" required />
                        <div className="flex gap-4">
                            <input type="number" placeholder="Score" value={score} onChange={(e) => setScore(e.target.value)} className="w-full border-gray-300 rounded-md" required />
                            <input type="number" placeholder="Max Score" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} className="w-full border-gray-300 rounded-md" required />
                        </div>
                        <button type="submit" className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md"><FiPlus />Add Grade</button>
                    </form>
                </div>
                {/* Add/Edit Remarks Form */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-bold mb-4">Add/Edit Remarks</h3>
                    <form onSubmit={handleUpdateRemarks} className="space-y-4">
                        <textarea value={remarksInput} onChange={(e) => setRemarksInput(e.target.value)} rows="5" className="w-full border-gray-300 rounded-md" placeholder="Enter overall remarks for the student..."></textarea>
                        <button type="submit" className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md"><FiSave />Save Remarks</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProctorStudentAnalyticsDetail;