import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiCheck, FiX, FiEye, FiMessageCircle, FiSearch} from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import Skeleton from 'react-loading-skeleton'; // Import Skeleton
import Modal from '../components/Modal';

const ProctorDocuments = () => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true); // Start with loading true
    const { token } = useContext(AuthContext);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // State for the feedback modal
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentDocument, setCurrentDocument] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [statusToSet, setStatusToSet] = useState('');

    const fetchAllDocuments = useCallback(async (currentPage) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/documents?page=${currentPage}`, { headers: { Authorization: token } });
            setDocuments(response.data.data);
            setPage(response.data.page);
            setTotalPages(response.data.pages);
        } catch (error) {
            console.error("Failed to fetch documents", error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchAllDocuments(page);
    }, [page, fetchAllDocuments]);

   

        // THIS IS THE NEW FUNCTION FOR COLORED BADGES
        const getStatusBadge = (status) => {
            const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
            if (status === 'Approved') return `${baseClasses} bg-green-100 text-green-800`;
            if (status === 'Rejected') return `${baseClasses} bg-red-100 text-red-800`;
            return `${baseClasses} bg-yellow-100 text-yellow-800`; // For 'Pending'
        };

    const TableSkeleton = () => (
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th><th className="relative px-6 py-3"></th></tr></thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                        <td className="px-6 py-4"><Skeleton height={20} width={120} /></td>
                        <td className="px-6 py-4"><Skeleton height={20} width={200} /></td>
                        <td className="px-6 py-4"><Skeleton height={20} width={80} /></td>
                        <td className="px-6 py-4"><Skeleton height={20} width={100} /></td>
                        <td className="px-6 py-4"><Skeleton height={20} width={100} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );

     const openFeedbackModal = (doc, status) => {
        setCurrentDocument(doc);
        setStatusToSet(status);
        setFeedback('');
        setIsModalOpen(true);
    };

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/documents/status/${currentDocument._id}`, { status: statusToSet, feedback }, { headers: { Authorization: token } });
            fetchAllDocuments(page);
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

     // Filter documents based on the search term
    const filteredDocuments = documents.filter(doc => 
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.student?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold mb-4">Review Student Documents</h2>
                <div className="relative">
                        <input 
                            type="text"
                            placeholder="Search by name or file..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>
            <div className="bg-white shadow overflow-x-auto rounded-lg">
                {isLoading ? <TableSkeleton /> : (
                    <table className="min-w-full divide-y divide-gray-200">
                        {/* ... (your existing table code) ... */}
                        <thead className="bg-gray-50"><tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th><th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th></tr></thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {documents.map((doc) => (<tr key={doc._id}><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.student?.name}</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.fileName}</td><td className="px-6 py-4 whitespace-nowrap text-sm"><span className={getStatusBadge(doc.status)}>{doc.status}</span></td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td><td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4"><a href={`http://localhost:8080/${doc.filePath}`} target="_blank" rel="noopener noreferrer" title="View Document" className="text-gray-600 hover:text-gray-900 inline-flex items-center"><FiEye size={18}/></a>{doc.status === 'Pending' && ( <> <button onClick={() => openFeedbackModal(doc._id, 'Approved')} title="Approve" className="text-green-600 hover:text-green-900"><FiCheck size={18}/></button><button onClick={() => openFeedbackModal(doc._id, 'Rejected')} title="Reject" className="text-red-600 hover:text-red-900"><FiX size={18}/></button> </>)}{doc.feedback && <button onClick={() => toast.info(`Feedback: ${doc.feedback}`)} title="View Feedback" className="text-gray-500 hover:text-gray-700"><FiMessageCircle size={18}/></button>}</td></tr>))}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Pagination Controls */}
            {totalPages > 1 && !isLoading && (
                <div className="mt-4 flex justify-center items-center">
                    {/* ... (pagination buttons remain the same) ... */}
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Feedback for ${currentDocument?.fileName}`}>
                <form onSubmit={handleStatusUpdate}>
                    <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows="4" 
                        className="w-full border border-gray-300 rounded-md p-2"
                        placeholder={statusToSet === 'Rejected' ? 'Reason for rejection (required)' : 'Optional feedback for approval'}
                        required={statusToSet === 'Rejected'}
                    ></textarea>
                    <div className="mt-4 flex justify-end gap-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">Submit</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ProctorDocuments;