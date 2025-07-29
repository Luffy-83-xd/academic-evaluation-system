import { toast } from 'react-toastify';
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiUpload, FiFileText, FiCheckCircle, FiClock, FiEye, FiMessageCircle } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const StudentProjects = () => {
    const { token } = useContext(AuthContext);

    // State for the upload form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    // State for managing UI
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchProjects = useCallback(async () => {
        try {
            const response = await api.get('/projects/student', {
                headers: { Authorization: token },
            });
            setProjects(response.data.data);
        } catch (err) {
            console.error('Failed to fetch projects', err);
        }
    }, [token]);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile || !title || !description) {
            setError('Please fill in all fields and select a file.');
            return;
        }
        setIsLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('projectFile', selectedFile);
        formData.append('title', title);
        formData.append('description', description);

        try {
            await api.post('/projects/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: token,
                },
            });
            // Reset form and refresh list
            setTitle('');
            setDescription('');
            setSelectedFile(null);
            fetchProjects();
        } catch (err) {
            setError('File upload failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        if (status === 'Checked') return `${baseClasses} bg-green-100 text-green-800`;
        return `${baseClasses} bg-blue-100 text-blue-800`;
      };

    return (
        <div className="space-y-8">
            {/* Project Upload Form */}
            <div>
                <h2 className="text-2xl font-bold mb-4">Upload New Project</h2>
                <form onSubmit={handleUpload} className="bg-white p-6 rounded-lg shadow-md space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Project Title</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full border-gray-600 rounded-md shadow-sm ring-1 ring-blue-400" required />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows="3" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm ring-1 ring-blue-400" required></textarea>
                    </div>
                    <div>
                        <label htmlFor="projectFile" className="block text-sm font-medium text-gray-700">Project File (PDF, PPT, DOCX)</label>
                        <input type="file" id="projectFile" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
                        <FiUpload className="mr-2" /> {isLoading ? 'Uploading...' : 'Upload Project'}
                    </button>
                </form>
            </div>

            {/* Submitted Projects List */}
            <div>
                <h2 className="text-2xl font-bold mb-4">My Submitted Projects</h2>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {projects.length > 0 ? (
                            projects.map((proj) => (
                                <li key={proj._id} className="p-4 flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{proj.title}</p>
                                        <p className="text-sm text-gray-500 truncate">{proj.description}</p>
                                        <p className="text-sm text-gray-500 mt-1">Grade: <span className="font-medium text-gray-700">{proj.grade}</span></p>
                                    </div>
                                    <div className="flex items-center gap-4 ml-4">
                                        <a href={`http://localhost:8080/${proj.filePath}`} target="_blank" rel="noopener noreferrer" title="View Project" className="text-gray-500 hover:text-gray-700"><FiEye size={18} /></a>
                                        {proj.feedback && <button onClick={() => toast.info(`Feedback: ${proj.feedback}`)} title="View Feedback" className="text-blue-500 hover:text-blue-700"><FiMessageCircle size={18} /></button>}
                                        <span className={getStatusBadge(proj.status)}>{proj.status}</span>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="p-4 text-center text-gray-500">You haven't uploaded any projects yet.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default StudentProjects;