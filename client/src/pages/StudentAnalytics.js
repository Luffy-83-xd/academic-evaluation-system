import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiDownload } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Change this line
import AnalyticsCharts from '../components/AnalyticsCharts';

const StudentAnalytics = () => {
    const { user, token } = useContext(AuthContext);
    const [analyticsData, setAnalyticsData] = useState([]);
    const [remarks, setRemarks] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const fetchAnalytics = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await api.get(`/analytics/student/${user.id}`, {
                headers: { Authorization: token },
            });
            setAnalyticsData(response.data.data);
            setRemarks(response.data.remarks);
        } catch (error) {
            console.error("Failed to fetch analytics", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, token]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);
    
    const handleDownload = () => {
        const doc = new jsPDF();
        
        // Add Title
        doc.text(`Performance Report for ${user.name}`, 14, 20);
        
        // Add Table
        autoTable(doc, { 
            startY: 30,
            head: [['Type', 'Title', 'Grade/Score', 'Date']],
            body: analyticsData.map(item => [
                item.type,
                item.title,
                item.grade,
                new Date(item.date).toLocaleDateString()
            ]),
        });

        // Add Remarks if they exist
        if (remarks) {
            const finalY = doc.lastAutoTable.finalY; // Get the Y position after the table
            doc.text("Proctor's Remarks:", 14, finalY + 10);
            // The splitTextToSize function handles word wrapping
            const remarksLines = doc.splitTextToSize(remarks, 180); 
            doc.text(remarksLines, 14, finalY + 20);
        }

        doc.save(`${user.name}_Report.pdf`);
    };

    if (isLoading) return <div>Loading analytics...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Performance Report</h2>
                <button 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                    <FiDownload />
                    Download Report
                </button>
            </div>
            
            {/* ADD THE CHARTS COMPONENT HERE */}
            <AnalyticsCharts data={analyticsData} />
            
            <div className="bg-white shadow overflow-x-auto rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title / Subject</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade / Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {analyticsData.map((item, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{item.grade}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {remarks && (
                <div>
                    <h3 className="text-xl font-bold mb-2">Proctor's Remarks</h3>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <p className="text-gray-700 whitespace-pre-wrap">{remarks}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAnalytics;