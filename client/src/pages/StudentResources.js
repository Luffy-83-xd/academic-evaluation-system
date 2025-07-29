import React, { useState, useEffect, useContext, useCallback } from 'react';
import { FiEye, FiFileText } from 'react-icons/fi';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';

const StudentResources = () => {
    const { token } = useContext(AuthContext);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchResources = useCallback(async () => {
        try {
            const response = await api.get('/resources', { headers: { Authorization: token } });
            setResources(response.data.data);
        } catch (err) {
            console.error('Failed to fetch resources', err);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    if (isLoading) {
        return <div>Loading resources...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Study Resources</h2>
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
                            <a 
                                href={`http://localhost:8080/${res.filePath}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                title="View" 
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <FiEye size={20}/>
                            </a>
                        </li>
                    )) : (
                        <p className="p-4 text-center text-gray-500">No resources have been uploaded yet.</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default StudentResources;