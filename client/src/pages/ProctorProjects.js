import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiEye, FiEdit, FiSearch } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';
import Skeleton from 'react-loading-skeleton';

const ProctorProjects = () => {
    const { token } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // State for the grading modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [grade, setGrade] = useState('');
    const [feedback, setFeedback] = useState('');
    const [markAsResource, setMarkAsResource] = useState(false);

    const fetchAllProjects = useCallback(async (currentPage) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/projects?page=${currentPage}`, { headers: { Authorization: token } });
            setProjects(response.data.data);
            setPage(response.data.page);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error("Failed to fetch projects", error);
            toast.error("Failed to load projects.");
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAllProjects(page);
    }, [page, fetchAllProjects]);

    const openGradeModal = (project) => {
        setCurrentProject(project);
        setGrade(project.grade !== 'Not Graded' ? project.grade : '');
        setFeedback(project.feedback || '');
        setMarkAsResource(project.isResource);
        setIsModalOpen(true);
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        if (!currentProject) return;
        try {
            await api.put(`/projects/grade/${currentProject._id}`, { grade, feedback, markAsResource }, {
                headers: { Authorization: token }
            });
            toast.success("Grade submitted successfully!");
            setIsModalOpen(false);
            fetchAllProjects(page);
        } catch (error) {
            console.error("Failed to submit grade", error);
            toast.error("Grading failed. Please try again.");
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        if (status === 'Checked') return `${baseClasses} bg-green-100 text-green-800`;
        return `${baseClasses} bg-blue-100 text-blue-800`;
    };

    const TableSkeleton = () => (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {Array(5).fill(0).map((_, i) => (<tr key={i}>
                    <td className="px-6 py-4"><Skeleton height={20} width={120} /></td>
                    <td className="px-6 py-4"><Skeleton height={20} width={200} /></td>
                    <td className="px-6 py-4"><Skeleton height={20} width={80} /></td>
                    <td className="px-6 py-4"><Skeleton height={20} width={60} /></td>
                    <td className="px-6 py-4"><Skeleton height={20} width={100} /></td>
                </tr>))}
            </tbody>
        </table>
    );

    // Filter projects based on search
    const filteredProjects = projects.filter(proj =>
        proj.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.student?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold mb-4">Review Student Projects</h2>
                    <div className="relative">
                        <input type="text" placeholder="Search projects..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"/>
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
            </div>
            <div className="bg-white shadow overflow-x-auto rounded-lg">
                {isLoading ? <TableSkeleton /> : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Title</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">{projects.map((proj) => (<tr key={proj._id}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{proj.student?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{proj.title}</td><td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getStatusBadge(proj.status)}>{proj.status}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">{proj.grade}</td><td className="px-6 py-4 whitespace-nowrap text-sm font-medium"><div className="flex items-center space-x-4"><a href={`http://localhost:8080/${proj.filePath}`} target="_blank" rel="noopener noreferrer" title="View Project" className="text-gray-600 hover:text-gray-900"><FiEye /></a><button onClick={() => openGradeModal(proj)} title="Grade Project" className="text-blue-600 hover:text-blue-900"><FiEdit /></button></div></td></tr>))}</tbody>
                    </table>
                )}
            </div>
            {totalPages > 1 && !isLoading && (
                <div className="mt-4 flex justify-center items-center">
                    <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-l-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Previous</button>
                    <span className="px-4 py-2 text-sm text-gray-700 bg-white border-t border-b border-gray-300">Page {page} of {totalPages}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-r-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50">Next</button>
                </div>
            )}
            {/* Grading Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Grade Project: ${currentProject?.title}`}>
                <form onSubmit={handleGradeSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>
                            <input type="text" id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                        </div>
                        <div>
                            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">Feedback</label>
                            <textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} rows="4" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"></textarea>
                        </div>
                        {/* THIS IS THE NEW CHECKBOX */}
                        <div className="flex items-center">
                            <input 
                                id="markAsResource" 
                                type="checkbox" 
                                checked={markAsResource}
                                onChange={(e) => setMarkAsResource(e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor="markAsResource" className="ml-2 block text-sm text-gray-900">
                                Share this project as a resource for other students
                            </label>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Submit Grade</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProctorProjects;