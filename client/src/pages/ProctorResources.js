import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import { FiUpload, FiTrash2, FiFileText, FiEye } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import Modal from '../components/Modal';

const ProctorResources = () => {
    const { token } = useContext(AuthContext);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    
    // State for the upload form
    const [title, setTitle] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState('');

    // State for the confirmation modal
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [resourceToDelete, setResourceToDelete] = useState(null);
    
    const fetchResources = useCallback(async () => {
        try {
            const response = await api.get('/resources', { headers: { Authorization: token } });
            setResources(response.data.data);
        } catch (err) {
            console.error('Failed to fetch resources', err);
            toast.error('Failed to load resources.');
        }
    }, [token]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !title) {
            setError('Please provide a title and select a file.');
            return;
        }
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('resourceFile', selectedFile);
        formData.append('title', title);

        try {
            await api.post('/resources', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token,
                },
            });
            toast.success('Resource uploaded successfully!');
            setTitle('');
            setSelectedFile(null);
            document.getElementById('resourceFile').value = '';
            fetchResources();
        } catch (err) {
            setError('Upload failed. Please try again.');
            toast.error('Upload failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeleteClick = (resource) => {
        setResourceToDelete(resource);
        setIsConfirmModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!resourceToDelete) return;
        try {
            await api.delete(`/resources/${resourceToDelete._id}`, { headers: { Authorization: token } });
            toast.success('Resource deleted successfully!');
            fetchResources();
            setIsConfirmModalOpen(false);
        } catch (err) {
            toast.error('Failed to delete the resource.');
        }
    };

    return (
        <div className="space-y-8">
            {/* Upload Form */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Upload New Resource</h2>
                <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Resource Title</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label htmlFor="resourceFile" className="block text-sm font-medium text-gray-700">File</label>
                        <input type="file" id="resourceFile" onChange={(e) => setSelectedFile(e.target.files[0])} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                        <FiUpload className="mr-2" /> {isLoading ? 'Uploading...' : 'Upload Resource'}
                    </button>
                </form>
            </div>

            {/* Existing Resources List */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Uploaded Resources</h2>
                <div className="bg-white rounded-lg shadow-md">
                    <ul className="divide-y divide-gray-200">
                        {resources.length > 0 ? resources.map((res) => (
                            <li key={res._id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <FiFileText className="text-gray-500 mr-4" size={20} />
                                    <div>
                                        <p className="font-medium text-gray-800">{res.title}</p>
                                        <p className="text-sm text-gray-500">Uploaded by: {res.uploadedBy?.name} on {new Date(res.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <a href={`http://localhost:8080/${res.filePath}`} target="_blank" rel="noopener noreferrer" title="View" className="text-blue-600 hover:text-blue-800"><FiEye size={18}/></a>
                                    <button onClick={() => handleDeleteClick(res)} title="Delete" className="text-red-500 hover:text-red-700"><FiTrash2 size={18}/></button>
                                </div>
                            </li>
                        )) : (
                            <p className="p-4 text-center text-gray-500">No resources have been uploaded yet.</p>
                        )}
                    </ul>
                </div>
            </div>

            {/* Confirmation Modal for Deletion */}
            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="Confirm Deletion">
                <p>Are you sure you want to delete the resource: <strong>{resourceToDelete?.title}</strong>?</p>
                <div className="mt-6 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="button" onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
                </div>
            </Modal>
        </div>
    );
};

export default ProctorResources;